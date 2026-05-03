import request from "supertest";
import app from "../../../benchmark-backend/src/app";

describe("Hidden: GET /products", () => {

  it("search should be case-insensitive", async () => {
    const res = await request(app).get("/products?search=laptop");
    const res2 = await request(app).get("/products?search=LAPTOP");

    expect(res.body).toEqual(res2.body);
  });

  it("search should trim whitespace", async () => {
    const res = await request(app).get("/products?search=  Laptop  ");
    const res2 = await request(app).get("/products?search=Laptop");

    expect(res.body).toEqual(res2.body);
  });

  it("should combine category + inStock + search correctly", async () => {
    const res = await request(app).get(
      "/products?category=electronics&inStock=true&search=lap"
    );

    expect(res.body.length).toBeGreaterThan(0);
    expect(
      res.body.every((p: any) =>
        p.category === "electronics" &&
        p.inStock === true &&
        p.name.toLowerCase().includes("lap")
      )
    ).toBe(true);
  });

  it("should apply filter before sort", async () => {
    const res = await request(app).get(
      "/products?category=electronics&sort=price_asc"
    );

    const prices = res.body.map((p: any) => p.price);
    const sorted = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sorted);
    expect(res.body.every((p: any) => p.category === "electronics")).toBe(true);
  });

  it("should not mutate original dataset", async () => {
    const res1 = await request(app).get("/products");
    await request(app).get("/products?category=electronics");
    const res2 = await request(app).get("/products");

    expect(res1.body).toEqual(res2.body);
  });

  it("should handle invalid inStock values gracefully", async () => {
    const res = await request(app).get("/products?inStock=invalid");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return empty array when no results match", async () => {
    const res = await request(app).get(
      "/products?search=nonexistentitem"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should support name sorting ascending", async () => {
    const res = await request(app).get("/products?sort=name_asc");

    const names = res.body.map((p: any) => p.name);
    const sorted = [...names].sort();

    expect(names).toEqual(sorted);
  });

  it("should support name sorting descending", async () => {
    const res = await request(app).get("/products?sort=name_desc");

    const names = res.body.map((p: any) => p.name);
    const sorted = [...names].sort().reverse();

    expect(names).toEqual(sorted);
  });

});