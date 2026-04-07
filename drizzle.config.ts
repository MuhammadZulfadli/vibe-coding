import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: "mysql://root@localhost/belajar_vibe_coding?socketPath=/run/mysqld/mysqld.sock",
  },
});
