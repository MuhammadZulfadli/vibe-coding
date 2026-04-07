import { Elysia } from "elysia";
import { db } from "../db";
import { sessions, users } from "../db/schema";
import { eq } from "drizzle-orm";

export const authMiddleware = new Elysia()
  .derive({ as: "scoped" }, async ({ headers, set }) => {
    const auth = headers["authorization"];
    if (!auth || !auth.startsWith("Bearer ")) {
      return {
        user: null,
        token: null,
        isAuthorized: false,
      };
    }

    const token = auth.split(" ")[1];
    if (!token) {
      return {
        user: null,
        token: null,
        isAuthorized: false,
      };
    }

    // Find session
    const sessionRecord = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (sessionRecord.length === 0 || !sessionRecord[0]) {
      return {
        user: null,
        token: null,
        isAuthorized: false,
      };
    }

    // Find user
    const userRecord = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, sessionRecord[0].userId as number))
      .limit(1);

    if (userRecord.length === 0 || !userRecord[0]) {
      return {
        user: null,
        token: null,
        isAuthorized: false,
      };
    }

    return {
      user: userRecord[0],
      token: token,
      isAuthorized: true,
    };
  });
