import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export const registerUser = async ({ name, email, password }: any) => {
  try {
    // 1. Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { status: 400, data: "Email sudah terdaftar" };
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert new user
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    return { status: 201, data: "OK" };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { status: 500, data: "Internal Server Error" };
  }
};

export const loginUser = async ({ email, password }: any) => {
  try {
    // 1. Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0 || !user[0]) {
      return { status: 400, error: "Email atau Password salah" };
    }

    const currentUser = user[0];

    // 2. Compare password
    const passwordMatch = await bcrypt.compare(password, currentUser.password);
    if (!passwordMatch) {
      return { status: 400, error: "Email atau Password salah" };
    }

    // 3. Generate Token (UUID)
    const token = crypto.randomUUID();

    // 4. Save Session
    await db.insert(sessions).values({
      token,
      user: currentUser.name,
      userId: currentUser.id,
    });

    // 5. Success
    return { status: 200, data: token };
  } catch (error: any) {
    console.error("Login error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const getCurrentUser = async (token: string) => {
  try {
    // 1. Find session by token
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0 || !session[0]) {
      return { status: 401, error: "Unauthorized" };
    }

    const currentSession = session[0];

    // 2. Find user by userId from session
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, currentSession.userId as number))
      .limit(1);

    if (user.length === 0 || !user[0]) {
      return { status: 401, error: "Unauthorized" };
    }

    // 3. Success
    return { status: 200, data: user[0] };
  } catch (error: any) {
    console.error("Get current user error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};

export const logoutUser = async (token: string) => {
  try {
    // 1. Check if session exists
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0 || !session[0]) {
      return { status: 401, error: "Unauthorized" };
    }

    // 2. Delete session
    await db.delete(sessions).where(eq(sessions.token, token));

    return { status: 200, data: "OK" };
  } catch (error: any) {
    console.error("Logout error:", error);
    return { status: 500, error: "Internal Server Error" };
  }
};
