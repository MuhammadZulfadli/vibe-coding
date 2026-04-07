import { db } from "../db";
import { users } from "../db/schema";
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
