import request from "supertest";
import app from "../../../benchmark-backend/src/app";

const AUTH = { Authorization: "Bearer benchmark-token-2024" };

describe("Hidden: GET /products", () => {

  it("search should be case-insensitive", async () => {
    const res = await request(app).get("/products?search=laptop&limit=50").set(AUTH);
    const res2 = await request(app).get("/products?search=LAPTOP&limit=50").set(AUTH);

    expect(res.body.data).toEqual(res2.body.data);
  });

  it("search should trim whitespace", async () => {
    const res = await request(app).get("/products?search=  Laptop  &limit=50").set(AUTH);
    const res2 = await request(app).get("/products?search=Laptop&limit=50").set(AUTH);

    expect(res.body.data).toEqual(res2.body.data);
  });

  it("should combine category + inStock + search correctly", async () => {
    const res = await request(app).get(
      "/products?category=electronics&inStock=true&search=lap&limit=50"
    ).set(AUTH);

    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.every((p: any) =>
        p.category === "electronics" &&
        p.inStock === true &&
        p.name.toLowerCase().includes("lap")
      )
    ).toBe(true);
  });

  it("should apply filter before sort", async () => {
    const res = await request(app).get(
      "/products?category=electronics&sort=price_asc&limit=50"
    ).set(AUTH);

    const prices = res.body.data.map((p: any) => p.price);
    const sorted = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sorted);
    expect(res.body.data.every((p: any) => p.category === "electronics")).toBe(true);
  });

  it("should not mutate original dataset", async () => {
    const res1 = await request(app).get("/products?limit=50").set(AUTH);
    await request(app).get("/products?category=electronics&limit=50").set(AUTH);
    const res2 = await request(app).get("/products?limit=50").set(AUTH);

    expect(res1.body.data).toEqual(res2.body.data);
  });

  it("should handle invalid inStock values gracefully", async () => {
    const res = await request(app).get("/products?inStock=invalid&limit=50").set(AUTH);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should return empty array when no results match", async () => {
    const res = await request(app).get(
      "/products?search=nonexistentitem&limit=50"
    ).set(AUTH);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("should support name sorting ascending", async () => {
    const res = await request(app).get("/products?sort=name_asc&limit=50").set(AUTH);

    const names = res.body.data.map((p: any) => p.name);
    const sorted = [...names].sort();

    expect(names).toEqual(sorted);
  });

  it("should support name sorting descending", async () => {
    const res = await request(app).get("/products?sort=name_desc&limit=50").set(AUTH);

    const names = res.body.data.map((p: any) => p.name);
    const sorted = [...names].sort().reverse();

    expect(names).toEqual(sorted);
  });

});
