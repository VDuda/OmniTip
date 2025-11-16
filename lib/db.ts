import { Database } from 'bun:sqlite';
import { join } from 'path';

const dbPath = join(process.cwd(), 'omnitip.db');
const db = new Database(dbPath);

// Initialize tips table
db.exec(`
  CREATE TABLE IF NOT EXISTS tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    text TEXT NOT NULL,
    predictsEngland INTEGER NOT NULL,
    wallet TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )
`);

export type Tip = {
  id?: number;
  phone: string;
  text: string;
  predictsEngland: boolean;
  wallet: string;
  timestamp: number;
};

export function addTip(tip: Omit<Tip, 'id'>) {
  const stmt = db.prepare(`
    INSERT INTO tips (phone, text, predictsEngland, wallet, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    tip.phone,
    tip.text,
    tip.predictsEngland ? 1 : 0,
    tip.wallet,
    tip.timestamp
  );
  return result.lastInsertRowid;
}

export function getTips(limit = 50): Tip[] {
  const stmt = db.prepare(`
    SELECT id, phone, text, predictsEngland, wallet, timestamp
    FROM tips
    ORDER BY timestamp DESC
    LIMIT ?
  `);
  const rows = stmt.all(limit) as any[];
  return rows.map(row => ({
    ...row,
    predictsEngland: Boolean(row.predictsEngland),
  }));
}

export function getSentimentBias(): { engTips: number; argTips: number; total: number } {
  const stmt = db.prepare(`
    SELECT 
      SUM(CASE WHEN predictsEngland = 1 THEN 1 ELSE 0 END) as engTips,
      SUM(CASE WHEN predictsEngland = 0 THEN 1 ELSE 0 END) as argTips,
      COUNT(*) as total
    FROM tips
  `);
  const result = stmt.get() as any;
  return {
    engTips: result.engTips || 0,
    argTips: result.argTips || 0,
    total: result.total || 0,
  };
}

export default db;
