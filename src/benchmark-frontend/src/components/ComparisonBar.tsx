import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useComparisonContext } from '../context/ComparisonContext';
import { useProductContext } from '../context/ProductContext';

export default function ComparisonBar() {
  const navigate = useNavigate();
  const { comparedIds, removeFromComparison, clearComparison } = useComparisonContext();
  const { products } = useProductContext();

  if (comparedIds.length === 0) return null;

  const comparedProducts = comparedIds
    .map((id) => products.find((p) => String(p.id) === id) ?? null)
    .filter(Boolean);

  return ReactDOM.createPortal(
    <div
      role="region"
      aria-label="Product comparison"
      className="comparison-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#fff',
        borderTop: '2px solid #ddd',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <span>Compare ({comparedIds.length}/3):</span>

      <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
        {comparedProducts.map((product) => (
          <div
            key={product!.id}
            className="comparison-thumb"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <img
              src={`/images/${product!.name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
              alt={product!.name}
              width={40}
              height={40}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
            />
            <span>{product!.name}</span>
            <button
              type="button"
              aria-label={`Remove ${product!.name} from comparison`}
              onClick={() => removeFromComparison(String(product!.id))}
              className="comparison-remove-btn"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button type="button" aria-label="Clear all comparisons" onClick={clearComparison}>
        Clear
      </button>

      <button
        type="button"
        disabled={comparedIds.length < 2}
        onClick={() => navigate('/compare')}
      >
        Compare
      </button>
    </div>,
    document.body,
  );
}
