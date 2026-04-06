import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connection = await mysql.createConnection({
  user: "root",
  database: "my_database",
  socketPath: "/run/mysqld/mysqld.sock",
});
export const db = drizzle(connection, { schema, mode: 'default' });
