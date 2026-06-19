import { config } from "dotenv";
import { DataSource } from "typeorm";

config();

export default new DataSource( {
  type: "postgres",
  host: process.env.DB_HOST ?? "localhost",
  port: Number( process.env.DB_PORT ?? 5432 ),
  username: process.env.DB_USER ?? "ai_gateway",
  password: process.env.DB_PASSWORD ?? "ai_gateway",
  database: process.env.DB_NAME ?? "ai_gateway",
  entities: [ "src/**/*.entity.ts" ],
  migrations: [ "migrations/*.ts" ],
} );
