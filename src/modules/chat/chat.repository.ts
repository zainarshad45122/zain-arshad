import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThanOrEqual, Repository } from "typeorm";

import { ChatMessageEntity, ChatSource } from "./entities/chat-message.entity";

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository( ChatMessageEntity )
    private readonly repo: Repository<ChatMessageEntity>,
  ) {}

  create( data: Partial<ChatMessageEntity> ) {
    return this.repo.save( this.repo.create( data ) );
  }

  // counts free messages for a user since a given date (used for the 3 messages per-month limit)
  countFreeSince( userId: string, since: Date ) {
    return this.repo.count( {
      where: {
        userId,
        source: ChatSource.FREE,
        createdAt: MoreThanOrEqual( since ),
      },
    } );
  }
}
