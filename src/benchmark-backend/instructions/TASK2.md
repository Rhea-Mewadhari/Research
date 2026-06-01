# Task 2: Fix Logical Bugs in Product API

## Objective
Fix incorrect behavior in the `GET /products` endpoint so that filtering, searching, and sorting work as intended.

## Known Issues

The endpoint is implemented but has logical bugs:

- Searching for a lowercase term (e.g. `search=wireless`) returns no results, even when a matching product exists
- A search term with surrounding whitespace (e.g. `search=%20mouse%20`) returns no results
- Results are not correctly sorted when a `sort` parameter is provided
- Combining `category` and `inStock` returns incorrect results — one filter silently overrides the other

## Requirements

Fix the implementation so that:

- Search is case-insensitive and trims leading/trailing whitespace from the query value
- `category`, `inStock`, and `search` filters all apply together — none overrides another
- The pipeline order is: filter → search → sort
- Sorting produces correctly ordered results for all four sort values (`price_asc`, `price_desc`, `name_asc`, `name_desc`)

## Constraints
- Do not change the API structure (route path, response format, query parameter names)
- Do not remove any features

## Expected Files to Modify
- `src/services/productService.ts`

## Success Criteria
- All visible tests pass
- Combined filters return the correct subset of products
- Sort order is stable and correct for all four sort values
