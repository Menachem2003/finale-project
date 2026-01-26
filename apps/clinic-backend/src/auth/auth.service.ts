import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
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
    const { email, password } = loginDto;
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

    const cart = await this.cartModel.findOne({ userId: user._id });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return {
      user: userResponse,
      token,
    };
  }

  async signup(signupDto: SignupDto) {
    const { name, email, password } = signupDto;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new this.userModel({ name, email, password: hashedPassword });
      await user.save();

      const userResponse = user.toObject();
      userResponse.password = '********';

      return userResponse;
    } catch (err: any) {
      if (err.code === 11000) {
        throw new ConflictException('User already exists');
      }
      if (err.name === 'ValidationError') {
        throw new ConflictException(err.message);
      }
      throw err;
    }
  }

  async validate(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userResponse = user.toObject();
    userResponse.password = '********';

    const cart = await this.cartModel.findOne({ userId: user._id });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return userResponse;
  }
}
