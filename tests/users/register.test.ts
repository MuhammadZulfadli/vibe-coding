import { describe, it, expect, beforeEach } from "bun:test";
import { app } from "../../src/index";
import { clearDB } from "../setup";

describe("POST /api/users/ - User Registration API", () => {
  beforeEach(async () => {
    await clearDB();
  });

  it("should successfully register a new user", async () => {
    const payload = {
      name: "Fadly",
      email: "fadly@email.com",
      password: "password123"
    };

    const res = await app.handle(
      new Request("http://localhost/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    expect(res.status).toBe(201);
    const body: any = await res.json();
    expect(body.data).toBe("OK");
  });

  it("should fail if email is already registered", async () => {
    const payload = {
      name: "Fadly",
      email: "fadly@email.com",
      password: "password123"
    };

    // Register first time
    await app.handle(
      new Request("http://localhost/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    // Register second time with duplicate email
    const res = await app.handle(
      new Request("http://localhost/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    expect(res.status).toBe(400);
    const body: any = await res.json();
    expect(body.data).toBe("Email sudah terdaftar");
  });

  it("should fail validation if name exceeds 255 characters", async () => {
    const longName = "a".repeat(300);
    const payload = {
      name: longName,
      email: "long@email.com",
      password: "password123"
    };

    const res = await app.handle(
      new Request("http://localhost/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    expect(res.status).toBe(422); // Elysia's default validation error status
  });

  it("should fail validation if payload is missing fields", async () => {
    const payload = {
      email: "fadly@email.com"
      // Missing name and password
    };

    const res = await app.handle(
      new Request("http://localhost/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    );

    expect(res.status).toBe(422);
  });
});
