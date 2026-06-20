import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateChatDto {
  @IsUUID()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  question!: string;
}
