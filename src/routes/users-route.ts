import { Elysia, t } from "elysia";
import { registerUser, loginUser, logoutUser } from "../services/users-services";
import { authMiddleware } from "../middlewares/auth-middleware";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    const result = await registerUser(body);
    set.status = result.status;
    return { data: result.data as string };
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    }),
    response: {
      201: t.Object({
        data: t.String()
      }, {
        description: "User registered successfully"
      }),
      400: t.Object({
        data: t.String()
      }, {
        description: "Bad Request (Email already exists)"
      }),
      500: t.Object({
        data: t.String()
      }, {
        description: "Internal Server Error"
      })
    }
  })
  .post("/login", async ({ body, set }) => {
    const result = await loginUser(body);
    set.status = result.status;
    if ("error" in result) {
      return { error: result.error as string };
    }
    return { data: result.data as string };
  }, {
    body: t.Object({
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    }),
    response: {
      200: t.Object({
        data: t.String()
      }, {
        description: "Login successful, returns session token"
      }),
      400: t.Object({
        error: t.String()
      }, {
        description: "Invalid email or password"
      }),
      500: t.Object({
        error: t.String()
      }, {
        description: "Internal Server Error"
      })
    }
  })
  .use(authMiddleware) // Applying the dry auth middleware
  .get("/current", async ({ isAuthorized, user, set }) => {
    if (!isAuthorized || !user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    return { 
      data: {
        id: user.id as number,
        name: user.name as string,
        email: user.email as string,
        createdAt: user.createdAt
      }
    };
  }, {
    response: {
      200: t.Object({
        data: t.Object({
          id: t.Number(),
          name: t.String(),
          email: t.String(),
          createdAt: t.Any()
        })
      }, {
        description: "Return current user profile"
      }),
      401: t.Object({
        error: t.String()
      }, {
        description: "Unauthorized"
      }),
      500: t.Object({
        error: t.String()
      }, {
        description: "Internal Server Error"
      })
    }
  })
  .delete("/logout", async ({ isAuthorized, token, set }) => {
    if (!isAuthorized || !token) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const result = await logoutUser(token);
    set.status = result.status;
    if ("error" in result) {
      return { error: result.error as string };
    }

    return { data: result.data as string };
  }, {
    response: {
      200: t.Object({
        data: t.String()
      }, {
        description: "Logout successful"
      }),
      401: t.Object({
        error: t.String()
      }, {
        description: "Unauthorized"
      }),
      500: t.Object({
        error: t.String()
      }, {
        description: "Internal Server Error"
      })
    }
  });
