import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";

import { ChatMessageEntity, ChatSource } from "./entities/chat-message.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository( ChatMessageEntity )
    private readonly chatRepo: Repository<ChatMessageEntity>,
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
}
