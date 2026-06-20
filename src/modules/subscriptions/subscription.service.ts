import { Injectable, NotFoundException } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThan, LessThanOrEqual, Repository } from "typeorm";

import { addBillingPeriod, toDateString } from "../../common/utils";
import { CreateSubscriptionDto } from "./create-subscription.dto";
import {
  SubscriptionEntity,
  SubscriptionStatus,
} from "./entities/subscription.entity";
import { TIER_CONFIG } from "./tiers";

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository( SubscriptionEntity )
    private readonly subscriptionsRepo: Repository<SubscriptionEntity>,
  ) {}

  async create( dto: CreateSubscriptionDto ) {
    const tier = TIER_CONFIG[ dto.tier ];
    const dates = addBillingPeriod( dto.billingCycle );

    const subscription = this.subscriptionsRepo.create( {
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

    return this.subscriptionsRepo.save( subscription );
  }

  async updateAutoRenew( id: string, autoRenew: boolean ) {
    const subscription = await this.subscriptionsRepo.findOne( { where: { id } } );
    if( !subscription ) {
      throw new NotFoundException( "Subscription not found" );
    }

    subscription.autoRenew = autoRenew;
    return this.subscriptionsRepo.save( subscription );
  }

  async cancel( id: string ) {
    const subscription = await this.subscriptionsRepo.findOne( { where: { id } } );
    if( !subscription ) {
      throw new NotFoundException( "Subscription not found" );
    }

    subscription.autoRenew = false;
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionsRepo.save( subscription );
  }

  @Cron( CronExpression.EVERY_DAY_AT_MIDNIGHT )
  async processRenewals() {
    const today = toDateString( new Date() );

    const due = await this.subscriptionsRepo.find( {
      where: {
        autoRenew: true,
        status: SubscriptionStatus.ACTIVE,
        renewalDate: LessThanOrEqual( today ),
      },
    } );

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

      await this.subscriptionsRepo.save( sub );
    }

    const expired = await this.subscriptionsRepo.find( {
      where: {
        status: In( [ SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED ] ),
        endDate: LessThan( today ),
      },
    } );

    for( const sub of expired ) {
      sub.status = SubscriptionStatus.INACTIVE;
      await this.subscriptionsRepo.save( sub );
    }
  }
}
