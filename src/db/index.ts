import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connection = await mysql.createConnection({
  user: "root",
  database: "belajar_vibe_coding",
  socketPath: "/run/mysqld/mysqld.sock",
});
export const db = drizzle(connection, { schema, mode: 'default' });
