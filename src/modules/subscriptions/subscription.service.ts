import { Injectable, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { addBillingPeriod, toDateString } from "../../common/utils";
import { CreateSubscriptionDto } from "./create-subscription.dto";
import { SubscriptionStatus } from "./entities/subscription.entity";
import { SubscriptionRepository } from "./subscription.repository";
import { TIER_CONFIG } from "./tiers";

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly subscriptions: SubscriptionRepository,
  ) {}

  async create( dto: CreateSubscriptionDto ) {
    const tier = TIER_CONFIG[ dto.tier ];
    const dates = addBillingPeriod( dto.billingCycle );

    return this.subscriptions.create( {
      userId: dto.userId,
      tier: dto.tier,
      billingCycle: dto.billingCycle,
      autoRenew: dto.autoRenew,
      status: SubscriptionStatus.ACTIVE,
      maxMessages: tier.maxMessages,
      remainingMessages: tier.maxMessages,
      price: String( tier.price ),
      startDate: dates.startDate,
      endDate: dates.endDate,
      renewalDate: dates.endDate,
    } );
  }

  async updateAutoRenew( id: string, autoRenew: boolean ) {
    const subscription = await this.subscriptions.findById( id );
    if( !subscription ) {
      throw new NotFoundException( "Subscription not found" );
    }

    subscription.autoRenew = autoRenew;
    return this.subscriptions.save( subscription );
  }

  async cancel( id: string ) {
    const subscription = await this.subscriptions.findById( id );
    if( !subscription ) {
      throw new NotFoundException( "Subscription not found" );
    }

    subscription.autoRenew = false;
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptions.save( subscription );
  }

  @Cron( CronExpression.EVERY_DAY_AT_MIDNIGHT )
  async processRenewals() {
    // fine for a test app,at scale this would enqueue renewals and process them in batches
    const today = toDateString( new Date() );

    const due = await this.subscriptions.findDueForRenewal( today );

    for( const sub of due ) {
      // 20% chance of payment failure - making the subscription inactive
      if( Math.random() < 0.2 ) {
        sub.status = SubscriptionStatus.INACTIVE;
      } else {
        const dates = addBillingPeriod( sub.billingCycle );
        sub.startDate = dates.startDate;
        sub.endDate = dates.endDate;
        sub.renewalDate = dates.endDate;
        sub.remainingMessages = sub.maxMessages;
      }

      await this.subscriptions.save( sub );
    }

    //marking expired subscriptions as inactive
    const expired = await this.subscriptions.findExpired( today );

    for( const sub of expired ) {
      sub.status = SubscriptionStatus.INACTIVE;
      await this.subscriptions.save( sub );
    }
  }
}
