import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";

import {
  SubscriptionEntity,
  SubscriptionStatus,
  SubscriptionTier,
} from "../subscriptions/entities/subscription.entity";
import { ChatMessageEntity, ChatSource } from "./entities/chat-message.entity";
import { MockOpenAiService } from "./mock-openai.service";
import { QuotaExceededError } from "../../common/errors/quota-exceeded.error";
import { toDateString } from "../../common/utils";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository( ChatMessageEntity )
    private readonly chatRepo: Repository<ChatMessageEntity>,
    @InjectRepository( SubscriptionEntity )
    private readonly subscriptionsRepo: Repository<SubscriptionEntity>,
    private readonly mockOpenAi: MockOpenAiService,
  ) {}

  async hasFreeQuota( userId: string ) {
    const monthStart = new Date();
    monthStart.setDate( 1 );
    monthStart.setHours( 0, 0, 0, 0 );

    const freeCount = await this.chatRepo.count( {
      where: {
        userId,
        source: ChatSource.FREE,
        createdAt: MoreThanOrEqual( monthStart ),
      },
    } );

    return freeCount < 3;
  }

  async useBundle( userId: string ) {
    const today = toDateString( new Date() );

    const subscription = await this.subscriptionsRepo
      .createQueryBuilder( "s" )
      .where( "s.user_id = :userId", { userId } )
      .andWhere( "s.end_date >= :today", { today } )
      .andWhere( "s.status IN (:...statuses)", {
        statuses: [ SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED ],
      } )
      .andWhere(
        "(s.remaining_messages > 0 OR s.tier = :enterprise)",
        { enterprise: SubscriptionTier.ENTERPRISE },
      )
      .orderBy( "s.created_at", "DESC" )
      .getOne();

    if( !subscription ) {
      return null;
    }

    if(
      subscription.tier !== SubscriptionTier.ENTERPRISE &&
      subscription.remainingMessages !== null
    ) {
      subscription.remainingMessages -= 1;
      await this.subscriptionsRepo.save( subscription );
    }

    return subscription;
  }

  async sendMessage( userId: string, question: string ) {
    let source: ChatSource;
    let subscriptionId: string | null = null;

    if( await this.hasFreeQuota( userId ) ) {
      source = ChatSource.FREE;
    } else {
      const subscription = await this.useBundle( userId );
      if( !subscription ) {
        throw new QuotaExceededError();
      }
      source = ChatSource.BUNDLE;
      subscriptionId = subscription.id;
    }

    const { answer, tokens } = await this.mockOpenAi.complete( question );

    const message = this.chatRepo.create( {
      userId,
      question,
      answer,
      tokens,
      source,
      subscriptionId,
    } );

    return this.chatRepo.save( message );
  }
}
