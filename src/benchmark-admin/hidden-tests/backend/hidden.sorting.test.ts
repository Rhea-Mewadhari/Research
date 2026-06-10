import request from "supertest";
import app from "../../../benchmark-backend/src/app";

const AUTH = { Authorization: "Bearer benchmark-token-2024" };

describe("Hidden: sorting", () => {
  it("sorts by name ascending", async () => {
    const res = await request(app).get("/products?sort=name_asc&limit=50").set(AUTH);
    const names = res.body.data.map((p: any) => p.name);
    expect(names).toEqual([...names].sort());
  });

  it("sorts by name descending", async () => {
    const res = await request(app).get("/products?sort=name_desc&limit=50").set(AUTH);
    const names = res.body.data.map((p: any) => p.name);
    expect(names).toEqual([...names].sort().reverse());
  });
});
