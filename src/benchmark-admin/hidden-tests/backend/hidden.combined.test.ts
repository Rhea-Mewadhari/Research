import request from "supertest";
import app from "../../../benchmark-backend/src/app";

describe("Hidden: combined filter behaviour", () => {
  it("combines category + inStock + search correctly", async () => {
    const res = await request(app).get(
      "/products?category=electronics&inStock=true&search=lap"
    );

    expect(res.body.length).toBeGreaterThan(0);
    expect(
      res.body.every(
        (p: any) =>
          p.category === "electronics" &&
          p.inStock === true &&
          p.name.toLowerCase().includes("lap")
      )
    ).toBe(true);
  });

  it("applies filters before sorting", async () => {
    const res = await request(app).get(
      "/products?category=electronics&sort=price_asc"
    );

    const prices = res.body.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(res.body.every((p: any) => p.category === "electronics")).toBe(true);
  });
});
