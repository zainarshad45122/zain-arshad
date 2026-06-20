import { Body, Controller, Post } from "@nestjs/common";

import { ChatService } from "./chat.service";
import { CreateChatDto } from "./create-chat.dto";

@Controller( "chat" )
export class ChatController {
  constructor( private readonly chatService: ChatService ) {}

  @Post()
  sendMessage( @Body() dto: CreateChatDto ) {
    return this.chatService.sendMessage( dto.userId, dto.question );
  }
}
