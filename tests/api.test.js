import { describe, test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

let accessToken;

beforeEach(async () => {
    // Login and get an access token before each test
    const login = await request(app)
        .post("/auth")
        .send({
            username: "jk",
            password: "sala"
        })
        .expect(200);

    accessToken = login.body.access_token;
});

describe("GET /users", () => {
    test("responds with 200 and JSON", async () => {
        const res = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect("Content-Type", /json/i)
            .expect(200);

        assert.ok(Array.isArray(res.body));
    });
});

describe("GET /users/:id", () => {
    test("responds with 200 and the user object for existing user", async () => {
        const users = await request(app)
            .get("/users")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(200);

        const alice = users.body.find(user => user.name === "Alice");

        assert(alice, "Alice should exist in the users list");

        const res = await request(app)
            .get(`/users/${alice.id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .expect("Content-Type", /json/i)
            .expect(200);

        assert.deepStrictEqual(res.body, alice);
    });

    test("responds with 404 for non-existing user", async () => {
        await request(app)
            .get("/users/9999999")
            .set("Authorization", `Bearer ${accessToken}`)
            .expect(404);
    });
});
