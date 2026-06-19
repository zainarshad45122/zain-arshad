import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class AppService {
  constructor( private readonly dataSource: DataSource ) {}

  getHello(): string {
    return "ai-gateway";
  }

  async checkDb(): Promise<{ ok: boolean }> {
    await this.dataSource.query( "SELECT 1" );
    return { ok: true };
  }
}
