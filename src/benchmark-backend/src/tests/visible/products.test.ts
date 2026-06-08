import request from 'supertest';
import app from '../../app';

describe('GET /products', () => {
  it('returns all products', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(15);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/products?category=electronics');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(4);
    expect(res.body.every((p: any) => p.category === 'electronics')).toBe(true);
  });

  it('returns empty array for unknown category', async () => {
    const res = await request(app).get('/products?category=nonexistent');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('filters in-stock products', async () => {
    const res = await request(app).get('/products?inStock=true');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(11);
    expect(res.body.every((p: any) => p.inStock)).toBe(true);
  });

  it('filters out-of-stock products', async () => {
    const res = await request(app).get('/products?inStock=false');
    expect(res.status).toBe(200);
    expect(res.body.every((p: any) => !p.inStock)).toBe(true);
  });

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/products?sort=price_asc');
    const prices = res.body.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by price descending', async () => {
    const res = await request(app).get('/products?sort=price_desc');
    const prices = res.body.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('sorts by name ascending', async () => {
    const res = await request(app).get('/products?sort=name_asc');
    const names = res.body.map((p: any) => p.name);
    expect(names).toEqual([...names].sort());
  });

  it('sorts by name descending', async () => {
    const res = await request(app).get('/products?sort=name_desc');
    const names = res.body.map((p: any) => p.name);
    expect(names).toEqual([...names].sort().reverse());
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/products?search=laptop');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((p: any) => p.name.toLowerCase().includes('laptop'))).toBe(true);
  });

  it('returns empty array when search matches nothing', async () => {
    const res = await request(app).get('/products?search=xyznonexistent');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
