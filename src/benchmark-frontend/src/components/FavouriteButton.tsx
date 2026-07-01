import { useFavouritesContext } from '../context/FavouritesContext';

type Props = {
  productId: string;
};

export default function FavouriteButton({ productId }: Props) {
  const { isFavourite, isPending, toggleFavourite } = useFavouritesContext();
  const favourite = isFavourite(productId);
  const pending = isPending(productId);

  return (
    <button
      type="button"
      className={`favourite-btn${favourite ? ' is-favourite' : ''}`}
      aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
      aria-pressed={favourite}
      disabled={pending}
      onClick={(e) => {
        e.stopPropagation();
        void toggleFavourite(productId);
      }}
    >
      {pending ? (
        <span aria-hidden="true">…</span>
      ) : (
        <span aria-hidden="true">{favourite ? '♥' : '♡'}</span>
      )}
      {pending && <span className="sr-only">Loading</span>}
    </button>
  );
}
