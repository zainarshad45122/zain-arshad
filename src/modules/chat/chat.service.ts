import { Injectable } from "@nestjs/common";

import { SubscriptionTier } from "../subscriptions/entities/subscription.entity";
import { SubscriptionRepository } from "../subscriptions/subscription.repository";
import { ChatSource } from "./entities/chat-message.entity";
import { ChatRepository } from "./chat.repository";
import { MockOpenAiService } from "./mock-openai.service";
import { QuotaExceededError } from "../../common/errors/quota-exceeded.error";
import { toDateString } from "../../common/utils";

@Injectable()
export class ChatService {
  constructor(
    private readonly chat: ChatRepository,
    private readonly subscriptions: SubscriptionRepository,
    private readonly mockOpenAi: MockOpenAiService,
  ) {}

  // true if the user has used fewer than 3 free messages this calendar month
  async hasFreeQuota( userId: string ) {
    const monthStart = new Date();
    monthStart.setDate( 1 );
    monthStart.setHours( 0, 0, 0, 0 );

    const freeCount = await this.chat.countFreeSince( userId, monthStart );

    return freeCount < 3;
  }

  // picks the newest active bundle with quota left and decrements it (enterprise skips decrement)
  async useBundle( userId: string ) {
    const today = toDateString( new Date() );

    const subscription = await this.subscriptions.findActiveBundleForUser(
      userId,
      today,
    );

    if( !subscription ) {
      return null;
    }

    if(
      subscription.tier !== SubscriptionTier.ENTERPRISE &&
      subscription.remainingMessages !== null
    ) {
      subscription.remainingMessages -= 1;
      await this.subscriptions.save( subscription );
    }

    return subscription;
  }

  // checks free quota first then uses bundle, calls mock OpenAI and saves the message
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

    return this.chat.create( {
      userId,
      question,
      answer,
      tokens,
      source,
      subscriptionId,
    } );
  }
}
