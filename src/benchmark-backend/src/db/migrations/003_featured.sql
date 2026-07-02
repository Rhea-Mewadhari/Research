-- Featured is a column on products, this migration adds
-- the featured_overrides table for admin-level overrides
CREATE TABLE IF NOT EXISTS featured_overrides (
  product_id   TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  is_featured  INTEGER NOT NULL,
  set_at       TEXT NOT NULL DEFAULT (datetime('now'))
);
