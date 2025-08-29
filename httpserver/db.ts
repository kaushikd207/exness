import { Pool } from "pg";

export const pg = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "password", // change to your password
  port: 5432,
});
