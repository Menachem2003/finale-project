import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId');

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;
    const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (item) {
      throw new BadRequestException('Product already in cart');
    }

    cart.items.push({ productId: new Types.ObjectId(productId), quantity });
    await cart.save();

    return cart;
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
