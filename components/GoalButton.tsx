"use client";
import { useState } from 'react';

export default function GoalButton({ team }: { team: 'England' | 'Argentina' }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const click = async () => {
    setLoading(true);
    setStatus('Submitting to blockchain...');
    try {
      const res = await fetch('/api/admin/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team, password: 'hack2025' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`✅ ${team} scored! Tx: ${data.txHash.slice(0, 10)}...`);
        setTimeout(() => setStatus(''), 5000);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (e: any) {
      setStatus(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button 
        onClick={click} 
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition"
      >
        {loading ? '⏳ Processing...' : `⚽ ${team} Scores!`}
      </button>
      {status && <div className="text-sm">{status}</div>}
    </div>
  );
}
