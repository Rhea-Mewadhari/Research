const favourites = new Set<string>();

export function addFavourite(productId: string): void {
  favourites.add(productId);
}

export function removeFavourite(productId: string): void {
  favourites.delete(productId);
}
