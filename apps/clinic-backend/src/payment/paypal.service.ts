import { Injectable, Logger, BadRequestException } from '@nestjs/common';

// Using require for PayPal SDK as it's CommonJS module
const paypalSdk = require('@paypal/paypal-server-sdk');

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private ordersClient: any;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';

    this.logger.log(`Initializing PayPal service... Client ID: ${clientId ? 'Set' : 'Missing'}, Secret: ${clientSecret ? 'Set' : 'Missing'}, Mode: ${mode}`);

    if (!clientId || !clientSecret) {
      this.logger.warn(
        'PayPal credentials not configured. PayPal functionality will be disabled.',
      );
      return;
    }

    try {
      // Check SDK structure
      this.logger.log('Checking PayPal SDK structure...');
      
      if (!paypalSdk) {
        this.logger.error('PayPal SDK not loaded');
        throw new Error('PayPal SDK not loaded correctly');
      }

      const Client = paypalSdk.Client;
      const Environment = paypalSdk.Environment;
      const OrdersController = paypalSdk.OrdersController;

      this.logger.log(`Client: ${Client ? 'Found' : 'Missing'}, Environment: ${Environment ? 'Found' : 'Missing'}, OrdersController: ${OrdersController ? 'Found' : 'Missing'}`);

      if (!Client || !Environment || !OrdersController) {
        this.logger.error('PayPal SDK structure not recognized');
        throw new Error('PayPal SDK structure not recognized');
      }

      this.logger.log('Creating PayPal client...');
      const client = new Client({
        clientCredentialsAuthCredentials: {
          oAuthClientId: clientId,
          oAuthClientSecret: clientSecret,
        },
        environment:
          mode === 'live'
            ? Environment.Live
            : Environment.Sandbox,
      });

      this.ordersClient = new OrdersController(client);
      
      // Log available methods for debugging
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this.ordersClient)).filter(
        (name) => name !== 'constructor' && typeof this.ordersClient[name] === 'function'
      );
      this.logger.log('OrdersController available methods:', methods);
      
      this.isInitialized = true;
      this.logger.log(`PayPal service initialized successfully in ${mode} mode`);
    } catch (error: any) {
      this.logger.error('Failed to initialize PayPal client:', error?.message || error);
      if (error?.stack) {
        this.logger.error('Stack:', error.stack);
      }
      this.isInitialized = false;
    }
  }

  async createOrder(
    amount: number,
    currency: string = 'ILS',
    orderId?: string,
  ): Promise<string> {
    if (!this.isInitialized || !this.ordersClient) {
      throw new BadRequestException('PayPal service not initialized');
    }

    try {
      const orderBody = {
        intent: 'CAPTURE',
        purchaseUnits: [
          {
            referenceId: orderId || `ORDER-${Date.now()}`,
            amount: {
              currencyCode: currency,
              value: amount.toFixed(2),
            },
          },
        ],
        applicationContext: {
          brandName: 'מרפאת שיניים',
          landingPage: 'NO_PREFERENCE',
          userAction: 'PAY_NOW',
          returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/orders/success`,
          cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:4200'}/checkout`,
        },
      };

      const response = await this.ordersClient.createOrder({ body: orderBody });
      const order = response.result;

      if (order && order.id) {
        this.logger.log(`PayPal order created: ${order.id}`);
        return order.id;
      }

      throw new BadRequestException('Failed to create PayPal order');
    } catch (error: any) {
      this.logger.error('Error creating PayPal order:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create PayPal order: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async captureOrder(paypalOrderId: string): Promise<{
    success: boolean;
    transactionId?: string;
    payer?: any;
    amount?: any;
  }> {
    if (!this.isInitialized || !this.ordersClient) {
      throw new BadRequestException('PayPal service not initialized');
    }

    try {
      const response = await this.ordersClient.captureOrder(paypalOrderId, {});
      const order = response.result;

      if (order && order.status === 'COMPLETED') {
        const capture = order.purchase_units?.[0]?.payments?.captures?.[0];
        const transactionId = capture?.id;

        this.logger.log(
          `PayPal order captured successfully: ${paypalOrderId}, transaction: ${transactionId}`,
        );

        return {
          success: true,
          transactionId,
          payer: order.payer,
          amount: capture?.amount,
        };
      }

      throw new BadRequestException('PayPal order capture failed');
    } catch (error: any) {
      this.logger.error(`Error capturing PayPal order ${paypalOrderId}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to capture PayPal order: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async getOrderDetails(paypalOrderId: string): Promise<any> {
    if (!this.isInitialized || !this.ordersClient) {
      throw new BadRequestException('PayPal service not initialized');
    }

    try {
      const response = await this.ordersClient.getOrder(paypalOrderId);
      return response.result;
    } catch (error: any) {
      this.logger.error(`Error getting PayPal order details ${paypalOrderId}:`, error);
      throw new BadRequestException(
        `Failed to get PayPal order details: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
