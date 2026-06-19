import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserEntity } from "./entities/user.entity";

const SEED_EMAIL = "test@example.com";

@Injectable()
export class UsersSeedService implements OnModuleInit {
  constructor(
    @InjectRepository( UserEntity )
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.usersRepo.count();
    if( count > 0 ) {
      return;
    }

    await this.usersRepo.save( { email: SEED_EMAIL } );
  }
}
