import { config } from "dotenv";
import { DataSource } from "typeorm";

config();

function requireEnv( key: string ): string {
  const value = process.env[ key ];
  if( !value ) {
    throw new Error( `Missing env var: ${key}` );
  }
  return value;
}

export default new DataSource( {
  type: "postgres",
  host: requireEnv( "DB_HOST" ),
  port: Number( requireEnv( "DB_PORT" ) ),
  username: requireEnv( "DB_USER" ),
  password: requireEnv( "DB_PASSWORD" ),
  database: requireEnv( "DB_NAME" ),
  entities: [ "src/**/*.entity.ts" ],
  migrations: [ "migrations/*.ts" ],
} );
