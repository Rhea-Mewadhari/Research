CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  price       REAL NOT NULL,
  category    TEXT NOT NULL,
  in_stock    INTEGER NOT NULL DEFAULT 1,  -- 0 or 1
  rating      REAL NOT NULL DEFAULT 0,
  stock       INTEGER NOT NULL DEFAULT 0,
  featured    INTEGER NOT NULL DEFAULT 0,
  images      TEXT NOT NULL DEFAULT '[]',  -- JSON array stored as text
  tags        TEXT NOT NULL DEFAULT '[]',  -- JSON array stored as text
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
