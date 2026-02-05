import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Order, OrderDocument } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ProcessPaymentDto } from "./dto/process-payment.dto";
import { Product, ProductDocument } from "../products/schemas/product.schema";
import { PayPalService } from "../payment/paypal.service";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly paypalService: PayPalService,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    try {
      this.logger.log(`Creating order for user ${userId}`);

      // Validate all products exist and check inventory
      const inventoryErrors: string[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        // Check inventory
        if (product.count < item.quantity) {
          inventoryErrors.push(
            `Insufficient inventory for product: ${product.name}. Available: ${product.count}, Requested: ${item.quantity}`
          );
        }
      }

      // If any products have insufficient inventory, throw error
      if (inventoryErrors.length > 0) {
        const errorMessage =
          inventoryErrors.length === 1
            ? inventoryErrors[0]
            : `Multiple products have insufficient inventory:\n${inventoryErrors.join(
                "\n"
              )}`;
        throw new BadRequestException(errorMessage);
      }

      // Create order
      const order = new this.orderModel({
        userId: new Types.ObjectId(userId),
        items: createOrderDto.items.map((item) => ({
          productId: new Types.ObjectId(item.productId),
          quantity: item.quantity,
          price: item.price,
        })),
        total: createOrderDto.total,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "paypal",
      });

      await order.save();

      // Update product inventory atomically (all products passed inventory check at this point)
      for (const item of createOrderDto.items) {
        await this.productModel.findByIdAndUpdate(
          item.productId,
          { $inc: { count: -item.quantity } },
          { new: true }
        );
        this.logger.log(
          `Updated inventory for product ${item.productId}: decremented by ${item.quantity}`
        );
      }

      await order.populate("items.productId");

      this.logger.log(`Order ${order._id} created successfully`);

      return order;
    } catch (error) {
      this.logger.error(`Error creating order for user ${userId}:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException("Failed to create order");
    }
  }

  async createPayPalOrder(orderId: string) {
    try {
      this.logger.log(`Creating PayPal order for order ${orderId}`);

      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException("Order not found");
      }

      if (order.paymentStatus === "paid") {
        throw new BadRequestException("Order already paid");
      }

      if (order.paypalOrderId) {
        // PayPal order already created, return existing ID
        return { paypalOrderId: order.paypalOrderId };
      }

      // Create PayPal order
      const paypalOrderId = await this.paypalService.createOrder(
        order.total,
        "ILS",
        order._id.toString(),
      );

      // Save PayPal Order ID to our order
      order.paypalOrderId = paypalOrderId;
      await order.save();

      this.logger.log(
        `PayPal order created for order ${orderId}: ${paypalOrderId}`,
      );

      return { paypalOrderId };
    } catch (error) {
      this.logger.error(
        `Error creating PayPal order for order ${orderId}:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException("Failed to create PayPal order");
    }
  }

  async capturePayPalPayment(orderId: string, paypalOrderId: string) {
    try {
      this.logger.log(
        `Capturing PayPal payment for order ${orderId}, PayPal order: ${paypalOrderId}`,
      );

      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException("Order not found");
      }

      if (order.paymentStatus === "paid") {
        throw new BadRequestException("Order already paid");
      }

      if (order.paypalOrderId !== paypalOrderId) {
        throw new BadRequestException("PayPal Order ID mismatch");
      }

      // Capture PayPal order
      const captureResult = await this.paypalService.captureOrder(paypalOrderId);

      if (captureResult.success && captureResult.transactionId) {
        order.paymentStatus = "paid";
        order.status = "completed";
        order.transactionId = captureResult.transactionId;
        order.paymentMethod = "paypal";

        await order.save();
        await order.populate("items.productId");

        this.logger.log(
          `PayPal payment captured successfully for order ${orderId}, transaction: ${captureResult.transactionId}`,
        );

        return {
          success: true,
          order,
          transactionId: captureResult.transactionId,
          message: "Payment processed successfully",
        };
      } else {
        order.paymentStatus = "failed";
        await order.save();

        this.logger.warn(`PayPal payment capture failed for order ${orderId}`);

        return {
          success: false,
          order,
          message: "Payment processing failed. Please try again.",
        };
      }
    } catch (error) {
      this.logger.error(
        `Error capturing PayPal payment for order ${orderId}:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException("Failed to capture PayPal payment");
    }
  }

  async processPayment(orderId: string, _processPaymentDto: ProcessPaymentDto) {
    // This method is kept for backward compatibility but now redirects to PayPal
    // In the future, this can be removed or used for other payment methods
    try {
      this.logger.log(`Processing payment for order ${orderId}`);

      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException("Order not found");
      }

      if (!order.paypalOrderId) {
        throw new BadRequestException(
          "PayPal order not created. Please create PayPal order first.",
        );
      }

      return await this.capturePayPalPayment(orderId, order.paypalOrderId);
    } catch (error) {
      this.logger.error(
        `Error processing payment for order ${orderId}:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException("Failed to process payment");
    }
  }

  async getAllOrders() {
    try {
      const orders = await this.orderModel
        .find()
        .populate("items.productId")
        .populate("userId", "name email")
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      this.logger.error("Error getting all orders:", error);
      throw new BadRequestException("Failed to retrieve all orders");
    }
  }

  async getUserOrders(userId: string) {
    try {
      const orders = await this.orderModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate("items.productId")
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      this.logger.error(`Error getting orders for user ${userId}:`, error);
      throw new BadRequestException("Failed to retrieve orders");
    }
  }

  async getOrderById(orderId: string, userId: string) {
    try {
      const order = await this.orderModel
        .findOne({
          _id: new Types.ObjectId(orderId),
          userId: new Types.ObjectId(userId),
        })
        .populate("items.productId");

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      return order;
    } catch (error) {
      this.logger.error(
        `Error getting order ${orderId} for user ${userId}:`,
        error
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("Failed to retrieve order");
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const order = await this.orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      return order;
    } catch (error) {
      this.logger.error(`Error updating order status for ${orderId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("Failed to update order status");
    }
  }
}
