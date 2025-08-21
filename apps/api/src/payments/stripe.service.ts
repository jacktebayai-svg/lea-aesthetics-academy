import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';

export interface CreatePaymentIntentData {
  appointmentId: string;
  amountCents: number;
  currency?: string;
  depositCents?: number;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private logger = new Logger(StripeService.name);

  constructor(private prisma: PrismaService) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createPaymentIntent(data: CreatePaymentIntentData) {
    try {
      const {
        appointmentId,
        amountCents,
        currency = 'gbp',
        depositCents = 0,
        customerEmail,
        metadata = {},
      } = data;

      // Create payment intent with Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: depositCents > 0 ? depositCents : amountCents,
        currency,
        receipt_email: customerEmail,
        metadata: {
          appointmentId,
          fullAmount: amountCents.toString(),
          isDeposit: depositCents > 0 ? 'true' : 'false',
          ...metadata,
        },
        capture_method: 'automatic',
        confirmation_method: 'automatic',
      });

      // Save payment record to database
      const payment = await this.prisma.payment.create({
        data: {
          appointmentId,
          stripePiId: paymentIntent.id,
          amountCents,
          currency,
          status: 'REQUIRES_ACTION',
          depositCents,
          type: depositCents > 0 ? 'deposit' : 'full',
        },
      });

      this.logger.log(`Payment intent created: ${paymentIntent.id} for appointment: ${appointmentId}`);

      return {
        paymentIntent,
        payment,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      this.logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      
      // Update payment status in database
      await this.prisma.payment.update({
        where: { stripePiId: paymentIntentId },
        data: {
          status: paymentIntent.status === 'succeeded' ? 'SUCCEEDED' : 'FAILED',
        },
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error confirming payment intent ${paymentIntentId}:`, error);
      throw error;
    }
  }

  async refundPayment(paymentIntentId: string, amountCents?: number) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amountCents, // If not provided, refunds the full amount
      });

      // Update payment status
      await this.prisma.payment.update({
        where: { stripePiId: paymentIntentId },
        data: {
          status: amountCents ? 'PARTIAL_REFUND' : 'REFUNDED',
        },
      });

      this.logger.log(`Refund created: ${refund.id} for payment: ${paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`Error creating refund for ${paymentIntentId}:`, error);
      throw error;
    }
  }

  async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });

      this.logger.log(`Customer created: ${customer.id} for email: ${email}`);
      return customer;
    } catch (error) {
      this.logger.error(`Error creating customer for ${email}:`, error);
      throw error;
    }
  }

  async createSubscription(customerEmail: string, priceId: string, metadata: Record<string, string> = {}) {
    try {
      // Create or get customer
      let customer = await this.getCustomerByEmail(customerEmail);
      if (!customer) {
        customer = await this.createCustomer(customerEmail, undefined, metadata);
      }

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata,
      });

      this.logger.log(`Subscription created: ${subscription.id}`);
      
      return {
        subscription,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      };
    } catch (error) {
      this.logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, immediately = false) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately,
      });

      if (immediately) {
        await this.stripe.subscriptions.cancel(subscriptionId);
      }

      this.logger.log(`Subscription ${immediately ? 'canceled' : 'scheduled for cancellation'}: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Error canceling subscription ${subscriptionId}:`, error);
      throw error;
    }
  }

  async handleWebhook(signature: string, payload: string) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      this.logger.log(`Processing webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object);
          break;
        case 'customer.subscription.updated':
          this.logger.log(`Subscription updated: ${event.data.object.id}`);
          break;
        case 'customer.subscription.deleted':
          this.logger.log(`Subscription deleted: ${event.data.object.id}`);
          break;
        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error);
      throw error;
    }
  }

  private async handlePaymentSucceeded(paymentIntent: any) {
    await this.prisma.payment.update({
      where: { stripePiId: paymentIntent.id },
      data: { status: 'SUCCEEDED' },
    });

    // Update appointment status if this was a deposit
    if (paymentIntent.metadata?.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: paymentIntent.metadata.appointmentId },
        data: { status: 'SCHEDULED' },
      });
    }

    this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
  }

  private async handlePaymentFailed(paymentIntent: any) {
    await this.prisma.payment.update({
      where: { stripePiId: paymentIntent.id },
      data: { status: 'FAILED' },
    });

    this.logger.log(`Payment failed: ${paymentIntent.id}`);
  }

  private async handleInvoicePaymentSucceeded(invoice: any) {
    // Handle subscription invoice payment
    this.logger.log(`Invoice payment succeeded: ${invoice.id}`);
  }


  private async getCustomerByEmail(email: string) {
    const customers = await this.stripe.customers.list({
      email,
      limit: 1,
    });

    return customers.data.length > 0 ? customers.data[0] : null;
  }

  // Utility methods
  async getPaymentIntent(paymentIntentId: string) {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async getSubscription(subscriptionId: string) {
    return this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async listPrices() {
    return this.stripe.prices.list({ active: true });
  }
}
