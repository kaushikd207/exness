import { Client } from "pg";

export const pg = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "password",
  port: 5432,
});
pg.connect();
