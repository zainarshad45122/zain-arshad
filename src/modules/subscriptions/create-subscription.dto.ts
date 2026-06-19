import { IsBoolean, IsEnum, IsUUID } from "class-validator";

import {
  BillingCycle,
  SubscriptionTier,
} from "./entities/subscription.entity";

export class CreateSubscriptionDto {
  @IsUUID()
  userId!: string;

  @IsEnum( SubscriptionTier )
  tier!: SubscriptionTier;

  @IsEnum( BillingCycle )
  billingCycle!: BillingCycle;

  @IsBoolean()
  autoRenew!: boolean;
}
