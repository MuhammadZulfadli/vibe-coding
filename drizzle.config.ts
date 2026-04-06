import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: "mysql://root@localhost/my_database?socketPath=/run/mysqld/mysqld.sock",
  },
});
