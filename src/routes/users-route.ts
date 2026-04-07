import { Elysia, t } from "elysia";
import { registerUser, loginUser, logoutUser } from "../services/users-services";
import { authMiddleware } from "../middlewares/auth-middleware";

export const usersRoute = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
    const result = await registerUser(body);
    set.status = result.status;
    return { data: result.data };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post("/login", async ({ body, set }) => {
    const result = await loginUser(body);
    if (result.error) {
      set.status = result.status;
      return { error: result.error };
    }
    set.status = 200;
    return { data: result.data };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  })
  .use(authMiddleware) // Applying the dry auth middleware
  .get("/current", async ({ isAuthorized, user, set }) => {
    if (!isAuthorized) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    return { data: user };
  })
  .delete("/logout", async ({ isAuthorized, token, set }) => {
    if (!isAuthorized) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const result = await logoutUser(token!);
    if (result.error) {
      set.status = result.status;
      return { error: result.error };
    }

    return { data: "OK" };
  });
