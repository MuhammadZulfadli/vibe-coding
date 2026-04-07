import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/users-services";

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
  });
