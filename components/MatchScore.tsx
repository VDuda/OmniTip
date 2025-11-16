"use client";
import { useEffect, useState } from 'react';

export default function MatchScore() {
  const [scores, setScores] = useState({ england: 0, argentina: 0 });

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await fetch('/api/scores');
        const data = await res.json();
        if (data.england !== undefined) {
          setScores(data);
        }
      } catch (e) {
        console.error('Failed to fetch scores:', e);
      }
    };
    fetchScores();
    const interval = setInterval(fetchScores, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded border p-4 bg-card">
      <div className="text-center text-3xl font-bold">
        <span className="text-blue-600">England {scores.england}</span>
        {' - '}
        <span className="text-red-600">{scores.argentina} Argentina</span>
      </div>
      <div className="text-center text-sm text-muted-foreground mt-2">Live from opBNB Testnet</div>
    </div>
  );
}
