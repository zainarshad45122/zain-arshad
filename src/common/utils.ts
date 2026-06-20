import { BillingCycle } from "../modules/subscriptions/entities/subscription.entity";

export function toDateString( date: Date ) {
  return date.toISOString().slice( 0, 10 );
}

export function sleep( ms: number ) {
  return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}

// sets startDate to today and endDate one month or one year out, depending on billing cycle
export function addBillingPeriod( cycle: BillingCycle ) {
  const start = new Date();
  const end = new Date( start );

  if( cycle === BillingCycle.MONTHLY ) {
    end.setMonth( end.getMonth() + 1 );
  } else {
    end.setFullYear( end.getFullYear() + 1 );
  }

  return { startDate: toDateString( start ), endDate: toDateString( end ) };
}
