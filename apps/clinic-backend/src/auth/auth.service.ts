import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'secret';

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      
      if (!email || !password) {
        throw new UnauthorizedException('Email and password are required');
      }

      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const payload = {
        id: user._id.toString(),
        role: user.role,
      };

      const token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: '24h',
      });

      const userResponse = user.toObject();
      userResponse.password = '********';

      // Create cart if it doesn't exist (for backward compatibility)
      try {
        let cart = await this.cartModel.findOne({ userId: user._id });
        if (!cart) {
          cart = new this.cartModel({ userId: user._id, items: [] });
          await cart.save();
        }
      } catch (cartError) {
        // Log cart error but don't fail login
        console.error('Error creating/finding cart:', cartError);
      }

      return {
        user: userResponse,
        token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Login error:', error);
      throw new UnauthorizedException('Login failed. Please try again.');
    }
  }

  async signup(signupDto: SignupDto) {
    const { name, email, password } = signupDto;

    try {
      if (!name || !email || !password) {
        throw new ConflictException('Name, email, and password are required');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new this.userModel({ name, email, password: hashedPassword });
      await user.save();

      // Create a cart for the new user
      try {
        const cart = new this.cartModel({ userId: user._id, items: [] });
        await cart.save();
      } catch (cartError) {
        // Log cart error but don't fail signup
        console.error('Error creating cart during signup:', cartError);
        // User is created, cart can be created later
      }

      const userResponse = user.toObject();
      userResponse.password = '********';

      return userResponse;
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
        throw new ConflictException('User already exists');
      }
      if (err && typeof err === 'object' && 'name' in err && err.name === 'ValidationError') {
        const validationError = err as { message?: string };
        throw new ConflictException(validationError.message || 'Validation error');
      }
      console.error('Signup error:', err);
      throw new ConflictException('Failed to create user. Please try again.');
    }
  }

  async validate(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userResponse = user.toObject();
    userResponse.password = '********';

    // Create cart if it doesn't exist (for backward compatibility)
    let cart = await this.cartModel.findOne({ userId: user._id });
    if (!cart) {
      cart = new this.cartModel({ userId: user._id, items: [] });
      await cart.save();
    }

    return userResponse;
  }
}
