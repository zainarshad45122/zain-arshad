import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ChatMessageEntity } from "./entities/chat-message.entity";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { ChatController } from "./chat.controller";
import { ChatRepository } from "./chat.repository";
import { ChatService } from "./chat.service";
import { MockOpenAiService } from "./mock-openai.service";

@Module( {
  imports: [
    TypeOrmModule.forFeature( [ ChatMessageEntity ] ),
    SubscriptionsModule,
  ],
  controllers: [ ChatController ],
  providers: [ MockOpenAiService, ChatService, ChatRepository ],
} )
export class ChatModule {}
