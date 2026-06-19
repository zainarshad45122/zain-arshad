import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ChatModule } from "./modules/chat/chat.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { UsersModule } from "./modules/users/users.module";

@Module( {
  imports: [
    ConfigModule.forRoot( {
      isGlobal: true,
    } ),
    TypeOrmModule.forRootAsync( {
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( config: ConfigService ) => ( {
        type: "postgres" as const,
        host: config.getOrThrow<string>( "DB_HOST" ),
        port: config.getOrThrow<number>( "DB_PORT" ),
        username: config.getOrThrow<string>( "DB_USER" ),
        password: config.getOrThrow<string>( "DB_PASSWORD" ),
        database: config.getOrThrow<string>( "DB_NAME" ),
        autoLoadEntities: true,
        synchronize: true,
      } ),
    } ),
    UsersModule,
    SubscriptionsModule,
    ChatModule,
  ],
  controllers: [ AppController ],
  providers: [ AppService ],
} )
export class AppModule {}
