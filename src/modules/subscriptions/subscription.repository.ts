import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, LessThan, LessThanOrEqual, Repository } from "typeorm";

import {
  SubscriptionEntity,
  SubscriptionStatus,
} from "./entities/subscription.entity";

@Injectable()
export class SubscriptionRepository {
  constructor(
    @InjectRepository( SubscriptionEntity )
    private readonly repo: Repository<SubscriptionEntity>,
  ) {}

  create( data: Partial<SubscriptionEntity> ) {
    return this.repo.save( this.repo.create( data ) );
  }

  save( subscription: SubscriptionEntity ) {
    return this.repo.save( subscription );
  }

  findById( id: string ) {
    return this.repo.findOne( { where: { id } } );
  }

  findDueForRenewal( today: string ) {
    return this.repo.find( {
      where: {
        autoRenew: true,
        status: SubscriptionStatus.ACTIVE,
        renewalDate: LessThanOrEqual( today ),
      },
    } );
  }

  findExpired( today: string ) {
    return this.repo.find( {
      where: {
        status: In( [ SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED ] ),
        endDate: LessThan( today ),
      },
    } );
  }
}
