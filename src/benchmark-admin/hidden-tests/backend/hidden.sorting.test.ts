import request from "supertest";
import app from "../../../benchmark-backend/src/app";

describe("Hidden: sorting", () => {
  it("sorts by name ascending", async () => {
    const res = await request(app).get("/products?sort=name_asc");
    const names = res.body.map((p: any) => p.name);
    expect(names).toEqual([...names].sort());
  });

  it("sorts by name descending", async () => {
    const res = await request(app).get("/products?sort=name_desc");
    const names = res.body.map((p: any) => p.name);
    expect(names).toEqual([...names].sort().reverse());
  });
});
