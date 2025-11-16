"use client";
import { useEffect, useState } from 'react';

type Tip = { phone: string; text: string; predictsEngland: boolean; timestamp: number };

export default function TipFeed() {
  const [tips, setTips] = useState<Tip[]>([]);
  useEffect(() => {
    // Fetch from API (stubbed)
    fetch('/api/tips')
      .then((r) => r.json() as Promise<{ tips: Tip[] }>)
      .then((res) => setTips(res.tips || []))
      .catch(() => setTips([]));
  }, []);
  return (
    <div className="rounded border p-4 bg-card">
      <h3 className="font-semibold mb-2">Live Tips</h3>
      <div className="space-y-2 max-h-72 overflow-auto">
        {tips.map((t, i) => (
          <div key={i} className="text-sm flex justify-between border-b pb-1">
            <span className="opacity-70">****{t.phone}</span>
            <span className="truncate mx-2">{t.text}</span>
            <span className={t.predictsEngland ? 'text-blue-600' : 'text-red-600'}>
              {t.predictsEngland ? 'England' : 'Argentina'}
            </span>
          </div>
        ))}
        {tips.length === 0 && <div className="text-sm opacity-70">No tips yet</div>}
      </div>
    </div>
  );
}
