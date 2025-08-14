import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { StripeService, CreatePaymentIntentData, CreateSubscriptionData } from './stripe.service';

export class CreatePaymentIntentDto {
  tenantId: string;
  appointmentId: string;
  amountCents: number;
  currency?: string;
  depositCents?: number;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export class CreateSubscriptionDto {
  tenantId: string;
  customerEmail: string;
  priceId: string;
  metadata?: Record<string, string>;
}

export class RefundPaymentDto {
  amountCents?: number;
  reason?: string;
}

@ApiTags('Payments')
@Controller('v1/payments')
export class PaymentsController {
  constructor(private stripeService: StripeService) {}

  @ApiOperation({ summary: 'Create payment intent for appointment deposit' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'FRONTDESK')
  @Post('deposit-intent')
  async createDepositIntent(@Body() createPaymentData: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent(createPaymentData);
  }

  @ApiOperation({ summary: 'Create full payment intent for appointment' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'FRONTDESK')
  @Post('payment-intent')
  async createPaymentIntent(@Body() createPaymentData: CreatePaymentIntentDto) {
    return this.stripeService.createPaymentIntent({
      ...createPaymentData,
      depositCents: 0, // Full payment
    });
  }

  @ApiOperation({ summary: 'Confirm payment intent' })
  @ApiResponse({ status: 200, description: 'Payment intent confirmed' })
  @Post('confirm/:paymentIntentId')
  async confirmPaymentIntent(@Param('paymentIntentId') paymentIntentId: string) {
    return this.stripeService.confirmPaymentIntent(paymentIntentId);
  }

  @ApiOperation({ summary: 'Refund payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER', 'FINANCE')
  @Post('refund/:paymentIntentId')
  async refundPayment(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body() refundData: RefundPaymentDto
  ) {
    return this.stripeService.refundPayment(paymentIntentId, refundData.amountCents);
  }

  @ApiOperation({ summary: 'Create subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Post('subscriptions')
  async createSubscription(@Body() subscriptionData: CreateSubscriptionDto) {
    return this.stripeService.createSubscription(subscriptionData);
  }

  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription canceled' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'MANAGER')
  @Post('subscriptions/:subscriptionId/cancel')
  async cancelSubscription(
    @Param('subscriptionId') subscriptionId: string,
    @Body() body: { immediately?: boolean }
  ) {
    return this.stripeService.cancelSubscription(subscriptionId, body.immediately);
  }

  @ApiOperation({ summary: 'Get available pricing plans' })
  @ApiResponse({ status: 200, description: 'Pricing plans retrieved' })
  @Get('prices')
  async listPrices() {
    return this.stripeService.listPrices();
  }

  @ApiOperation({ summary: 'Get payment intent details' })
  @ApiResponse({ status: 200, description: 'Payment intent details' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('payment-intent/:paymentIntentId')
  async getPaymentIntent(@Param('paymentIntentId') paymentIntentId: string) {
    return this.stripeService.getPaymentIntent(paymentIntentId);
  }

  @ApiOperation({ summary: 'Get subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription details' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('subscriptions/:subscriptionId')
  async getSubscription(@Param('subscriptionId') subscriptionId: string) {
    return this.stripeService.getSubscription(subscriptionId);
  }

  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  @HttpCode(HttpStatus.OK)
  @Post('webhooks/stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    const payload = req.rawBody?.toString() || '';
    return this.stripeService.handleWebhook(signature, payload);
  }
}
