import { db } from "../src/db";
import { sessions, users } from "../src/db/schema";

export const clearDB = async () => {
  // Delete sessions first to respect foreign key constraints
  await db.delete(sessions);
  await db.delete(users);
};
