import Database from 'better-sqlite3';
import { join } from 'node:path';

const dbPath =
  process.env.NODE_ENV === 'test'
    ? ':memory:'
    : join(process.cwd(), 'benchmark.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
