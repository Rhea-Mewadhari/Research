import request from "supertest";
import app from "../../../benchmark-backend/src/app";

const AUTH = { Authorization: "Bearer benchmark-token-2024" };

describe("Hidden: combined filter behaviour", () => {
  it("combines category + inStock + search correctly", async () => {
    const res = await request(app).get(
      "/products?category=electronics&inStock=true&search=lap&limit=50"
    ).set(AUTH);

    expect(res.body.data.length).toBeGreaterThan(0);
    expect(
      res.body.data.every(
        (p: any) =>
          p.category === "electronics" &&
          p.inStock === true &&
          p.name.toLowerCase().includes("lap")
      )
    ).toBe(true);
  });

  it("applies filters before sorting", async () => {
    const res = await request(app).get(
      "/products?category=electronics&sort=price_asc&limit=50"
    ).set(AUTH);

    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(res.body.data.every((p: any) => p.category === "electronics")).toBe(true);
  });
});
