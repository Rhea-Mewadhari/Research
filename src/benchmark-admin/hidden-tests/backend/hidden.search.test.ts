import request from "supertest";
import app from "../../../benchmark-backend/src/app";

describe("Hidden: search behaviour", () => {
  it("search is case-insensitive", async () => {
    const res  = await request(app).get("/products?search=laptop");
    const res2 = await request(app).get("/products?search=LAPTOP");
    expect(res.body).toEqual(res2.body);
  });

  it("search trims leading and trailing whitespace", async () => {
    const res  = await request(app).get("/products?search=  Laptop  ");
    const res2 = await request(app).get("/products?search=Laptop");
    expect(res.body).toEqual(res2.body);
  });

  it("returns empty array when search matches nothing", async () => {
    const res = await request(app).get("/products?search=nonexistentitem");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
