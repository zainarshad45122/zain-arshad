import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SubscriptionEntity } from "./entities/subscription.entity";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionRepository } from "./subscription.repository";
import { SubscriptionService } from "./subscription.service";

@Module( {
  imports: [ TypeOrmModule.forFeature( [ SubscriptionEntity ] ) ],
  controllers: [ SubscriptionController ],
  providers: [ SubscriptionService, SubscriptionRepository ],
} )
export class SubscriptionsModule {}
