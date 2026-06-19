import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum ChatSource {
  FREE = "FREE",
  BUNDLE = "BUNDLE",
}

@Entity( "chat_messages" )
export class ChatMessageEntity {
  @PrimaryGeneratedColumn( "uuid" )
  id!: string;

  @Column( { name: "user_id", type: "uuid" } )
  userId!: string;

  @Column( { type: "text" } )
  question!: string;

  @Column( { type: "text" } )
  answer!: string;

  @Column( { type: "int" } )
  tokens!: number;

  @Column( { type: "enum", enum: ChatSource } )
  source!: ChatSource;

  @Column( { name: "subscription_id", type: "uuid", nullable: true } )
  subscriptionId!: string | null;

  @CreateDateColumn( { name: "created_at", type: "timestamptz" } )
  createdAt!: Date;
}
