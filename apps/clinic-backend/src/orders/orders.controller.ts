import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ProcessPaymentDto } from "./dto/process-payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/guards/roles.guard";

@ApiTags("orders")
@Controller("orders")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create order from cart" })
  @ApiResponse({ status: 201, description: "Order created successfully" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Product not found" })
  async createOrder(
    @Request() req: any,
    @Body() createOrderDto: CreateOrderDto
  ) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Post(":id/payment/create")
  @ApiOperation({ summary: "Create PayPal order for payment" })
  @ApiResponse({
    status: 200,
    description: "PayPal order created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Order already paid or PayPal order creation failed",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async createPayPalOrder(
    @Request() req: any,
    @Param("id") orderId: string,
  ) {
    // Verify order belongs to user
    await this.ordersService.getOrderById(orderId, req.user.id);
    return this.ordersService.createPayPalOrder(orderId);
  }

  @Post(":id/payment/capture")
  @ApiOperation({ summary: "Capture PayPal payment for order" })
  @ApiResponse({
    status: 200,
    description: "Payment captured successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Payment failed or order already paid",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async capturePayPalPayment(
    @Request() req: any,
    @Param("id") orderId: string,
    @Body() body: { paypalOrderId: string },
  ) {
    // Verify order belongs to user
    await this.ordersService.getOrderById(orderId, req.user.id);
    return this.ordersService.capturePayPalPayment(orderId, body.paypalOrderId);
  }

  @Post(":id/payment")
  @ApiOperation({
    summary: "Process payment for order (legacy - redirects to PayPal)",
  })
  @ApiResponse({ status: 200, description: "Payment processed successfully" })
  @ApiResponse({
    status: 400,
    description: "Payment failed or order already paid",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async processPayment(
    @Request() req: any,
    @Param("id") orderId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
  ) {
    // Verify order belongs to user
    await this.ordersService.getOrderById(orderId, req.user.id);
    return this.ordersService.processPayment(orderId, processPaymentDto);
  }

  @Get("all")
  @UseGuards(RolesGuard)
  @Roles("admin")
  @ApiOperation({ summary: "Get all orders (Admin only)" })
  @ApiResponse({
    status: 200,
    description: "All orders retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get()
  @ApiOperation({ summary: "Get user orders" })
  @ApiResponse({ status: 200, description: "Orders retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getUserOrders(@Request() req: any) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get specific order by ID" })
  @ApiResponse({ status: 200, description: "Order retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async getOrderById(@Request() req: any, @Param("id") orderId: string) {
    return this.ordersService.getOrderById(orderId, req.user.id);
  }
}
