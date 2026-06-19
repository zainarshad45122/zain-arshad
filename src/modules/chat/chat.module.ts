import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ChatMessageEntity } from "./entities/chat-message.entity";
import { MockOpenAiService } from "./mock-openai.service";

@Module( {
  imports: [ TypeOrmModule.forFeature( [ ChatMessageEntity ] ) ],
  providers: [ MockOpenAiService ],
  exports: [ TypeOrmModule, MockOpenAiService ],
} )
export class ChatModule {}
