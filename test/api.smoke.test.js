import { describe, expect, it, jest } from "@jest/globals";
import request from "supertest";
const mockRedirectService = jest.fn(async () => ({
    id: 1,
    original_url: "https://example.com"
}));
await jest.unstable_mockModule("../src/services/url/url.service.ts", async () => {
    const actual = await import("../src/services/url/url.service.js");
    return {
        ...actual,
        redirectService: mockRedirectService
    };
});
const app = await import("../src/app.js");
describe("Health endpoints", () => {
    it("GET /health returns 200", async () => {
        const response = await request(app).get("/api/v1/health");
        expect(response.status).toBe(200);
        expect(response);
    });
    it("GET /health/ready returns 200 or 503", async () => {
        const response = await request(app).get("/api/v1/health/ready");
        expect([200, 503]).toContain(response.status);
        expect(response);
    });
    it("GET /health/full returns 200 or 503", async () => {
        const response = await request(app).get("/api/v1/health/full");
        expect([200, 503]).toContain(response.status);
        expect(response);
    });
});
describe("Auth endpoints", () => {
    it("POST /auth/signup returns 400 on empty body", async () => {
        const response = await request(app).post("/api/v1/auth/signup").send({});
        expect(response.status).toBe(400);
        expect(response);
    });
    it("POST /auth/login returns 400 on empty body", async () => {
        const response = await request(app).post("/api/v1/auth/login").send({});
        expect(response.status).toBe(400);
        expect(response);
    });
    it("POST /auth/logout returns 200", async () => {
        const response = await request(app).post("/api/v1/auth/logout");
        expect(response.status).toBe(200);
        expect(response);
    });
    it("GET /auth/me returns 401 without auth", async () => {
        const response = await request(app).get("/api/v1/auth/me");
        expect(response.status).toBe(401);
        expect(response);
    });
});
describe("User endpoints", () => {
    it("GET /user/me returns 401 without auth", async () => {
        const response = await request(app).get("/api/v1/user/me");
        expect(response.status).toBe(401);
        expect(response);
    });
    it("PATCH /user/me returns 401 without auth", async () => {
        const response = await request(app)
            .patch("/api/v1/user/me")
            .send({});
        expect(response.status).toBe(401);
        expect(response);
    });
    it("POST /user/change-password returns 401 without auth", async () => {
        const response = await request(app)
            .post("/api/v1/user/change-password")
            .send({});
        expect(response.status).toBe(401);
        expect(response);
    });
    it("DELETE /user/me returns 401 without auth", async () => {
        const response = await request(app).delete("/api/v1/user/me");
        expect(response.status).toBe(401);
        expect(response);
    });
});
describe("Organization endpoints", () => {
    it("POST /org returns 401 without auth", async () => {
        const response = await request(app).post("/api/v1/org").send({});
        expect(response.status).toBe(401);
        expect(response);
    });
    it("GET /org/me returns 401 without auth", async () => {
        const response = await request(app).get("/api/v1/org/me");
        expect(response.status).toBe(401);
        expect(response);
    });
    it("GET /org/:id returns 401 without auth", async () => {
        const response = await request(app).get("/api/v1/org/1");
        expect(response.status).toBe(401);
        expect(response);
    });
    it("PATCH /org/:id returns 401 without auth", async () => {
        const response = await request(app).patch("/api/v1/org/1").send({});
        expect(response.status).toBe(401);
        expect(response);
    });
    it("DELETE /org/:id returns 401 without auth", async () => {
        const response = await request(app).delete("/api/v1/org/1");
        expect(response.status).toBe(401);
        expect(response);
    });
});
describe("Subscription endpoints", () => {
    it("POST /subscription/purchase returns 401 without auth", async () => {
        const response = await request(app)
            .post("/api/v1/subscription/purchase")
            .send({});
        expect(response.status).toBe(401);
        expect(response);
    });
    it("GET /subscription/current returns 401 without auth", async () => {
        const response = await request(app).get("/api/v1/subscription/current");
        expect(response.status).toBe(401);
        expect(response);
    });
});
describe("API key endpoints", () => {
    it("POST /apikey returns 401 without auth", async () => {
        const response = await request(app).post("/api/v1/apikey").send({});
        expect(response.status).toBe(401);
        expect(response);
    });
    it("GET /apikey returns 401 without auth", async () => {
        const response = await request(app).get("/api/v1/apikey");
        expect(response.status).toBe(401);
        expect(response);
    });
    it("PATCH /apikey/:id returns 401 without auth", async () => {
        const response = await request(app)
            .patch("/api/v1/apikey/1")
            .send({});
        expect(response.status).toBe(401);
        expect(response);
    });
    it("POST /apikey/:id/revoke returns 401 without auth", async () => {
        const response = await request(app).post("/api/v1/apikey/1/revoke");
        expect(response.status).toBe(401);
        expect(response);
    });
    it("DELETE /apikey/:id returns 401 without auth", async () => {
        const response = await request(app).delete("/api/v1/apikey/1");
        expect(response.status).toBe(401);
        expect(response);
    });
});
describe("URL endpoints", () => {
    it("GET /url/r/:shortCode redirects", async () => {
        const response = await request(app).get("/api/v1/url/r/abc123");
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("https://example.com");
        expect(mockRedirectService).toHaveBeenCalledWith("abc123");
        expect(response);
    });
    it("POST /url/create returns 401 without auth", async () => {
        const response = await request(app).post("/api/v1/url/create").send({});
        expect(response.status).toBe(401);
        expect(response);
    });
    it("GET /url/user returns 401 without auth", async () => {
        const response = await request(app).get("/api/v1/url/user");
        expect(response.status).toBe(401);
        expect(response);
    });
    it("GET /url/org returns 401 without auth", async () => {
        const response = await request(app).get("/api/v1/url/org");
        expect(response.status).toBe(401);
        expect(response);
    });
    it("GET /url/:id returns 401 without auth", async () => {
        const response = await request(app).get("/api/v1/url/1");
        expect(response.status).toBe(401);
        expect(response);
    });
    it("PUT /url/:id returns 401 without auth", async () => {
        const response = await request(app).put("/api/v1/url/1").send({});
        expect(response.status).toBe(401);
        expect(response);
    });
    it("DELETE /url/:id returns 401 without auth", async () => {
        const response = await request(app).delete("/api/v1/url/1");
        expect(response.status).toBe(401);
        expect(response);
    });
});
//# sourceMappingURL=api.smoke.test.js.map