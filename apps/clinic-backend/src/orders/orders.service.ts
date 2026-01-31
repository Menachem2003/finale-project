import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
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
            `Insufficient inventory for product: ${product.name}. Available: ${product.count}, Requested: ${item.quantity}`,
          );
        }
      }

      // If any products have insufficient inventory, throw error
      if (inventoryErrors.length > 0) {
        const errorMessage =
          inventoryErrors.length === 1
            ? inventoryErrors[0]
            : `Multiple products have insufficient inventory:\n${inventoryErrors.join('\n')}`;
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
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'mock',
      });

      await order.save();

      // Update product inventory atomically (all products passed inventory check at this point)
      for (const item of createOrderDto.items) {
        await this.productModel.findByIdAndUpdate(
          item.productId,
          { $inc: { count: -item.quantity } },
          { new: true },
        );
        this.logger.log(
          `Updated inventory for product ${item.productId}: decremented by ${item.quantity}`,
        );
      }

      await order.populate('items.productId');

      this.logger.log(`Order ${order._id} created successfully`);

      return order;
    } catch (error) {
      this.logger.error(`Error creating order for user ${userId}:`, error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create order');
    }
  }

  async processPayment(orderId: string, processPaymentDto: ProcessPaymentDto) {
    try {
      this.logger.log(`Processing payment for order ${orderId}`);

      const order = await this.orderModel.findById(orderId);
      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.paymentStatus === 'paid') {
        throw new BadRequestException('Order already paid');
      }

      // Mock payment processing - simulate 2 second delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock payment: 95% success rate
      const paymentSuccess = Math.random() > 0.05;
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      if (paymentSuccess) {
        order.paymentStatus = 'paid';
        order.status = 'completed';
        order.transactionId = transactionId;
        order.paymentMethod = processPaymentDto.paymentMethod || 'mock';

        await order.save();
        await order.populate('items.productId');

        this.logger.log(`Payment successful for order ${orderId}, transaction: ${transactionId}`);

        return {
          success: true,
          order,
          transactionId,
          message: 'Payment processed successfully',
        };
      } else {
        order.paymentStatus = 'failed';
        await order.save();

        this.logger.warn(`Payment failed for order ${orderId}`);

        return {
          success: false,
          order,
          message: 'Payment processing failed. Please try again.',
        };
      }
    } catch (error) {
      this.logger.error(`Error processing payment for order ${orderId}:`, error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to process payment');
    }
  }

  async getUserOrders(userId: string) {
    try {
      const orders = await this.orderModel
        .find({ userId: new Types.ObjectId(userId) })
        .populate('items.productId')
        .sort({ createdAt: -1 });

      return orders;
    } catch (error) {
      this.logger.error(`Error getting orders for user ${userId}:`, error);
      throw new BadRequestException('Failed to retrieve orders');
    }
  }

  async getOrderById(orderId: string, userId: string) {
    try {
      const order = await this.orderModel
        .findOne({
          _id: new Types.ObjectId(orderId),
          userId: new Types.ObjectId(userId),
        })
        .populate('items.productId');

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      this.logger.error(`Error getting order ${orderId} for user ${userId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve order');
    }
  }

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const order = await this.orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true },
      );

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      this.logger.error(`Error updating order status for ${orderId}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update order status');
    }
  }
}
