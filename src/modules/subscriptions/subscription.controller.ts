import { Body, Controller, Param, Patch, Post } from "@nestjs/common";

import { CreateSubscriptionDto } from "./create-subscription.dto";
import { SubscriptionService } from "./subscription.service";
import { UpdateAutoRenewDto } from "./update-auto-renew.dto";

@Controller( "subscriptions" )
export class SubscriptionController {
  constructor( private readonly subscriptionService: SubscriptionService ) {}

  @Post()
  create( @Body() dto: CreateSubscriptionDto ) {
    return this.subscriptionService.create( dto );
  }

  @Patch( ":id/auto-renew" )
  updateAutoRenew(
    @Param( "id" ) id: string,
    @Body() dto: UpdateAutoRenewDto,
  ) {
    return this.subscriptionService.updateAutoRenew( id, dto.autoRenew );
  }

  @Post( ":id/cancel" )
  cancel( @Param( "id" ) id: string ) {
    return this.subscriptionService.cancel( id );
  }
}
