import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string) {
    try {
      let cart = await this.cartModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .populate('items.productId');

      // Create cart if it doesn't exist
      if (!cart) {
        cart = new this.cartModel({ userId: new Types.ObjectId(userId), items: [] });
        await cart.save();
        await cart.populate('items.productId');
      }

      return cart;
    } catch (error) {
      this.logger.error(`Error getting cart for user ${userId}:`, error);
      throw new BadRequestException('Failed to retrieve cart');
    }
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    try {
      const { productId, quantity } = addToCartDto;

      this.logger.log(`Adding product ${productId} to cart for user ${userId} with quantity ${quantity}`);

      // Validate product exists
      const product = await this.productModel.findById(productId);
      if (!product) {
        this.logger.warn(`Product ${productId} not found`);
        throw new NotFoundException('Product not found');
      }

      // Validate quantity doesn't exceed available stock
      if (quantity > product.count) {
        this.logger.warn(`Quantity ${quantity} exceeds available stock ${product.count}`);
        throw new BadRequestException(`Only ${product.count} items available in stock`);
      }

      let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

      // Create cart if it doesn't exist
      if (!cart) {
        this.logger.log(`Creating new cart for user ${userId}`);
        cart = new this.cartModel({ userId: new Types.ObjectId(userId), items: [] });
        await cart.save();
      }

      // Check if product is already in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId && item.productId.toString() === productId,
      );

      if (existingItemIndex !== -1) {
        // Update quantity if product already exists
        this.logger.log(`Product ${productId} already in cart, updating quantity`);
        cart.items[existingItemIndex].quantity += quantity;
        
        // Validate updated quantity doesn't exceed stock
        if (cart.items[existingItemIndex].quantity > product.count) {
          throw new BadRequestException(`Only ${product.count} items available in stock`);
        }
      } else {
        // Add new item to cart
        cart.items.push({ productId: new Types.ObjectId(productId), quantity });
      }
      
      await cart.save();
      this.logger.log(`Product ${productId} added to cart successfully`);

      // Populate product details before returning
      try {
        const populatedCart = await this.cartModel
          .findById(cart._id)
          .populate('items.productId');
        
        if (!populatedCart) {
          throw new NotFoundException('Cart not found after save');
        }

        return populatedCart;
      } catch (populateError) {
        this.logger.error(`Error populating cart:`, populateError);
        // Return cart without population if populate fails
        return cart;
      }
    } catch (error) {
      this.logger.error(`Error adding to cart for user ${userId}:`, error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Unexpected error:`, error);
      throw new BadRequestException(`Failed to add product to cart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateCartItem(userId: string, productId: string, updateDto: UpdateCartItemDto) {
    const { quantity } = updateDto;

    const updatedCart = await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), 'items.productId': new Types.ObjectId(productId) },
      { $set: { 'items.$.quantity': quantity } },
      { new: true },
    );

    if (!updatedCart) {
      throw new NotFoundException('Cart item not found');
    }

    return updatedCart;
  }

  async removeFromCart(userId: string, productId: string) {
    const updatedCart = await this.cartModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), 'items.productId': new Types.ObjectId(productId) },
      { $pull: { items: { productId: new Types.ObjectId(productId) } } },
      { new: true },
    );

    if (!updatedCart) {
      throw new NotFoundException('Cart item not found');
    }

    return updatedCart;
  }
}
