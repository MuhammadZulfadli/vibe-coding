import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../../src/index";
import { clearDB } from "../setup";

describe("DELETE /api/users/logout - User Logout API", () => {
  let validToken = "";

  beforeEach(async () => {
    await clearDB();
    
    // Register
    await app.handle(
      new Request("http://localhost/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Fadly",
          email: "fadly@email.com",
          password: "password123"
        })
      })
    );

    // Login
    const loginRes = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "fadly@email.com",
          password: "password123"
        })
      })
    );
    const body: any = await loginRes.json();
    validToken = body.data;
  });

  it("should successfully log out and invalidate the session", async () => {
    // Perform logout
    const logoutRes = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${validToken}` }
      })
    );

    expect(logoutRes.status).toBe(200);
    const logoutBody: any = await logoutRes.json();
    expect(logoutBody.data).toBe("OK");

    // Verify token is invalidated by trying to get current user
    const checkRes = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: { "Authorization": `Bearer ${validToken}` }
      })
    );

    expect(checkRes.status).toBe(401);
  });

  it("should fail to log out if Authorization header is missing", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE"
      })
    );

    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should fail to log out if token is fake or already invalidated", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/logout", {
        method: "DELETE",
        headers: { "Authorization": "Bearer some-fake-token" }
      })
    );

    expect(res.status).toBe(401);
  });
});
