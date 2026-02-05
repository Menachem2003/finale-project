import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Referral, ReferralDocument } from './schemas/referral.schema';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralStatusDto } from './dto/update-referral-status.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    private readonly emailService: EmailService,
  ) {}

  async create(createReferralDto: CreateReferralDto) {
    try {
      const referral = new this.referralModel(createReferralDto);
      const savedReferral = await referral.save();

      // Send confirmation email to customer
      try {
        const emailSent = await this.emailService.sendReferralConfirmation(
          savedReferral.email,
          savedReferral.fullName,
          savedReferral.reason,
        );
        if (emailSent) {
          this.logger.log(`Confirmation email sent to ${savedReferral.email}`);
        } else {
          this.logger.warn(`Failed to send confirmation email to ${savedReferral.email}`);
        }
      } catch (emailError) {
        // Don't fail the referral creation if email fails
        this.logger.error(`Error sending confirmation email to ${savedReferral.email}:`, emailError);
      }

      return savedReferral;
    } catch (err: any) {
      this.logger.error('Create referral error:', err);
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors || {}).map((e: any) => e.message).join(', ');
        throw new BadRequestException(`Validation error: ${validationErrors}`);
      }
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException(err.message || 'Failed to create referral. Please try again.');
    }
  }

  async findAll() {
    return this.referralModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const referral = await this.referralModel.findById(id);
    if (!referral) {
      throw new NotFoundException('Referral not found');
    }
    return referral;
  }

  async updateStatus(id: string, updateStatusDto: UpdateReferralStatusDto) {
    const referral = await this.referralModel.findByIdAndUpdate(
      id,
      { status: updateStatusDto.status },
      { new: true },
    );
    if (!referral) {
      throw new NotFoundException('Referral not found');
    }
    return referral;
  }
}
