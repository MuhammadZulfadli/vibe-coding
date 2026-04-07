import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../../src/index";
import { clearDB } from "../setup";

describe("GET /api/users/current - Get Current User API", () => {
  let validToken = "";

  beforeEach(async () => {
    await clearDB();
    
    // Register User
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

    // Login to get token
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

  it("should return the user profile when provided a valid token", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: { "Authorization": `Bearer ${validToken}` }
      })
    );

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.data).toBeDefined();
    expect(body.data.name).toBe("Fadly");
    expect(body.data.email).toBe("fadly@email.com");
    expect(body.data.password).toBeUndefined(); // Ensure password is leaked
  });

  it("should fail authentication if Authorization header is missing", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET"
      })
    );

    expect(res.status).toBe(401);
    const body: any = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should fail authentication if the token is invalid or fabricated", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/users/current", {
        method: "GET",
        headers: { "Authorization": "Bearer fake-invalid-token-123" }
      })
    );

    expect(res.status).toBe(401);
  });
});
