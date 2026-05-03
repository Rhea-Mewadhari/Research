import { products } from "../data/products";

export const getAllProducts = (query: any) => {
  let result = [...products];

  // TODO (agent must implement):
  // - search
  // - category filter
  // - inStock filter
  // - sorting

  return result;
};