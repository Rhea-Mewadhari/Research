import request from "supertest";
import app from "../../../benchmark-backend/src/app";

const AUTH = { Authorization: "Bearer benchmark-token-2024" };

describe("Hidden: data integrity and error handling", () => {
  it("does not mutate the original dataset across requests", async () => {
    const res1 = await request(app).get("/products?limit=50").set(AUTH);
    await request(app).get("/products?category=electronics&sort=price_desc&limit=50").set(AUTH);
    const res2 = await request(app).get("/products?limit=50").set(AUTH);

    expect(res1.body.data).toEqual(res2.body.data);
  });

  it("handles invalid inStock value gracefully", async () => {
    const res = await request(app).get("/products?inStock=invalid&limit=50").set(AUTH);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
