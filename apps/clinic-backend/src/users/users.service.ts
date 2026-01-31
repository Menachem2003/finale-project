import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll() {
    return this.userModel.find().select('-password');
  }


  async updateRole(id: string, role: 'user' | 'admin') {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userResponse = user.toObject();
    userResponse.password = '********';
    return userResponse;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
