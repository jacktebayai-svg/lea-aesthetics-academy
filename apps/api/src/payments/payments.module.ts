import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeService } from './stripe.service';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [StripeService],
  exports: [StripeService],
})
export class PaymentsModule {}
