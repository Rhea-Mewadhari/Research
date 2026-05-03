const fs = require("fs");
const path = require("path");

const targetFile = path.resolve(
  __dirname,
  "../../../benchmark-backend/src/controllers/productController.ts"
);

let content = fs.readFileSync(targetFile, "utf-8");

// Inject syntax/runtime issues
const buggyController = `
import { Request, Response } from "express";
import { getAllProducts } from "../services/productService";

export const getProducts = (req: Request, res: Response) => {
  const result = getAllProducts(req.query)

  // BUG: missing response method + syntax issue
  res.send(result

  // BUG: unreachable code
  console.log("This will never run");
};
`;

content = content.replace(
  /export const getProducts[\s\S]*?};/,
  buggyController
);

fs.writeFileSync(targetFile, content);

console.log("❌ Syntax bugs injected");