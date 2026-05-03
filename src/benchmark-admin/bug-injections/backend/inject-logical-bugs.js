const fs = require("fs");
const path = require("path");

const targetFile = path.resolve(
  __dirname,
  "../../../benchmark-backend/src/services/productService.ts"
);

let content = fs.readFileSync(targetFile, "utf-8");

// Inject buggy implementation
const buggyLogic = `
export const getAllProducts = (query: any) => {
  let result = products; // BUG: no copy → mutation risk

  // BUG: case-sensitive search, no trim
  if (query.search) {
    result = result.filter(p => p.name.includes(query.search));
  }

  // BUG: incorrect filter override (resets result)
  if (query.category) {
    result = products.filter(p => p.category === query.category);
  }

  // BUG: inStock handled incorrectly
  if (query.inStock) {
    result = result.filter(p => p.inStock === true);
  }

  // BUG: sorting before filtering
  if (query.sort === "price_asc") {
    result.sort((a, b) => a.price - b.price);
  }

  return result;
};
`;

// Replace function
content = content.replace(
  /export const getAllProducts[\s\S]*?};/,
  buggyLogic
);

fs.writeFileSync(targetFile, content);

console.log("✅ Logical bugs injected");