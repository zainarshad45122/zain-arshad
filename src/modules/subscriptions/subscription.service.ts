import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateSubscriptionDto } from "./create-subscription.dto";
import {
  BillingCycle,
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
    const start = new Date();
    const end = new Date( start );

    if( dto.billingCycle === BillingCycle.MONTHLY ) {
      end.setMonth( end.getMonth() + 1 );
    } else {
      end.setFullYear( end.getFullYear() + 1 );
    }

    const toDate = ( date: Date ) => date.toISOString().slice( 0, 10 );

    const subscription = this.subscriptionsRepo.create( {
      userId: dto.userId,
      tier: dto.tier,
      billingCycle: dto.billingCycle,
      autoRenew: dto.autoRenew,
      status: SubscriptionStatus.ACTIVE,
      maxMessages: tier.maxMessages,
      remainingMessages: tier.maxMessages,
      price: String( tier.price ),
      startDate: toDate( start ),
      endDate: toDate( end ),
      renewalDate: toDate( end ),
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
}
