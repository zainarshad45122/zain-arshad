import { Body, Controller, Post } from "@nestjs/common";

import { CreateSubscriptionDto } from "./create-subscription.dto";
import { SubscriptionService } from "./subscription.service";

@Controller( "subscriptions" )
export class SubscriptionController {
  constructor( private readonly subscriptionService: SubscriptionService ) {}

  @Post()
  create( @Body() dto: CreateSubscriptionDto ) {
    return this.subscriptionService.create( dto );
  }
}
