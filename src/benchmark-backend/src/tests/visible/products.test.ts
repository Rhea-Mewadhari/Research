import request from "supertest";
import app from "../../app";

describe("GET /products", () => {
  it("returns all products", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    const res = await request(app).get("/products?category=electronics");
    expect(res.body.every((p: any) => p.category === "electronics")).toBe(true);
  });

  it("filters in-stock products", async () => {
    const res = await request(app).get("/products?inStock=true");
    expect(res.body.every((p: any) => p.inStock)).toBe(true);
  });

  it("sorts by price ascending", async () => {
    const res = await request(app).get("/products?sort=price_asc");
    const prices = res.body.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});