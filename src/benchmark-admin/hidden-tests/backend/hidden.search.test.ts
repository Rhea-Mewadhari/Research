import request from "supertest";
import app from "../../../benchmark-backend/src/app";

const AUTH = { Authorization: "Bearer benchmark-token-2024" };

describe("Hidden: search behaviour", () => {
  it("search is case-insensitive", async () => {
    const res  = await request(app).get("/products?search=laptop&limit=50").set(AUTH);
    const res2 = await request(app).get("/products?search=LAPTOP&limit=50").set(AUTH);
    expect(res.body.data).toEqual(res2.body.data);
  });

  it("search trims leading and trailing whitespace", async () => {
    const res  = await request(app).get("/products?search=  Laptop  &limit=50").set(AUTH);
    const res2 = await request(app).get("/products?search=Laptop&limit=50").set(AUTH);
    expect(res.body.data).toEqual(res2.body.data);
  });

  it("returns empty array when search matches nothing", async () => {
    const res = await request(app).get("/products?search=nonexistentitem&limit=50").set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});
