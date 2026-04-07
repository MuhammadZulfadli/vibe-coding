import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../../src/index";
import { clearDB } from "../setup";

describe("POST /api/users/login - User Login API", () => {
  beforeEach(async () => {
    await clearDB();
    // Pre-register a valid user for login tests
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
  });

  it("should successfully log in with valid credentials and return a token", async () => {
    const payload = {
      email: "fadly@email.com",
      password: "password123"
    };

    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.data).toBeTypeOf("string"); // Token should be a string
  });

  it("should fail login with incorrect password", async () => {
    const payload = {
      email: "fadly@email.com",
      password: "wrongpassword"
    };

    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    expect(res.status).toBe(400); // Bad Request (defined in our service layer)
    const body: any = await res.json();
    expect(body.error).toBe("Email atau Password salah");
  });

  it("should fail login with unregistered email", async () => {
    const payload = {
      email: "notfound@email.com",
      password: "password123"
    };

    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.error).toBe("Email atau Password salah");
  });

  it("should fail validation if login payload is missing fields", async () => {
    const payload = {
      email: "fadly@email.com"
      // missing password
    };

    const res = await app.handle(
      new Request("http://localhost/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    expect(res.status).toBe(422);
  });
});
