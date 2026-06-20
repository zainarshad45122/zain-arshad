import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ChatMessageEntity } from "./entities/chat-message.entity";
import { SubscriptionEntity } from "../subscriptions/entities/subscription.entity";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { MockOpenAiService } from "./mock-openai.service";

@Module( {
  imports: [
    TypeOrmModule.forFeature( [ ChatMessageEntity, SubscriptionEntity ] ),
  ],
  controllers: [ ChatController ],
  providers: [ MockOpenAiService, ChatService ],
} )
export class ChatModule {}
