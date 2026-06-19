import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum SubscriptionTier {
  BASIC = "BASIC",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  CANCELLED = "CANCELLED",
}

@Entity( "subscriptions" )
export class SubscriptionEntity {
  @PrimaryGeneratedColumn( "uuid" )
  id!: string;

  @Column( { name: "user_id", type: "uuid" } )
  userId!: string;

  @Column( { type: "enum", enum: SubscriptionTier } )
  tier!: SubscriptionTier;

  @Column( { name: "billing_cycle", type: "enum", enum: BillingCycle } )
  billingCycle!: BillingCycle;

  @Column( { type: "enum", enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE } )
  status!: SubscriptionStatus;

  @Column( { name: "max_messages", type: "int", nullable: true } )
  maxMessages!: number | null;

  @Column( { name: "remaining_messages", type: "int", nullable: true } )
  remainingMessages!: number | null;

  @Column( { type: "decimal", precision: 10, scale: 2 } )
  price!: string;

  @Column( { name: "start_date", type: "date" } )
  startDate!: string;

  @Column( { name: "end_date", type: "date" } )
  endDate!: string;

  @Column( { name: "renewal_date", type: "date" } )
  renewalDate!: string;

  @Column( { name: "auto_renew", default: false } )
  autoRenew!: boolean;

  @CreateDateColumn( { name: "created_at", type: "timestamptz" } )
  createdAt!: Date;
}
