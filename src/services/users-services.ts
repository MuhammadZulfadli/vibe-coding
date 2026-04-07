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
