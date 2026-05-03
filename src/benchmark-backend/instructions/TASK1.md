# Task 1: Implement Product Filtering API

## Objective
Complete the `/products` endpoint by implementing filtering, searching, and sorting logic.

## Requirements

The endpoint must support:

### Filtering
- `category=<string>` → filter by category
- `inStock=<true|false>` → filter by stock availability

### Search
- `search=<string>` → filter by product name

### Sorting
- `sort=price_asc`
- `sort=price_desc`
- `sort=name_asc`
- `sort=name_desc`

## Notes
- Query params are optional and can be combined
- Return JSON array of products
- Do not mutate original dataset

## Example
GET /products?category=electronics&inStock=true&sort=price_asc