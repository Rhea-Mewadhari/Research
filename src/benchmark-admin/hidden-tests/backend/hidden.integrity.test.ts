import request from "supertest";
import app from "../../../benchmark-backend/src/app";

describe("Hidden: data integrity and error handling", () => {
  it("does not mutate the original dataset across requests", async () => {
    const res1 = await request(app).get("/products");
    await request(app).get("/products?category=electronics&sort=price_desc");
    const res2 = await request(app).get("/products");

    expect(res1.body).toEqual(res2.body);
  });

  it("handles invalid inStock value gracefully", async () => {
    const res = await request(app).get("/products?inStock=invalid");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
