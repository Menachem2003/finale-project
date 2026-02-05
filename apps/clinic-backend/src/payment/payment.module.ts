import { Module, Global } from '@nestjs/common';
import { PayPalService } from './paypal.service';

@Global()
@Module({
  providers: [PayPalService],
  exports: [PayPalService],
})
export class PaymentModule {}
