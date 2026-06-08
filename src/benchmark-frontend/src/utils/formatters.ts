export function formatPrice(price: number, discountPct?: number): string {
  if (!discountPct) return `$${price}`;
  return `$${Math.round(price * (1 - discountPct / 100))}`;
}

export function formatRating(rating: number, reviewCount: number): string {
  return `${rating.toFixed(1)} (${reviewCount.toLocaleString()} reviews)`;
}

export function truncate(text: string, maxLen = 90): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trimEnd()}…`;
}
