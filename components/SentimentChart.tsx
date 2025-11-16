"use client";
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SentimentChart() {
  const [data, setData] = useState<{ t: string; eng: number; arg: number }[]>([]);
  useEffect(() => {
    const id = setInterval(() => {
      const last = data[data.length - 1]?.eng ?? 50;
      const next = Math.max(0, Math.min(100, last + (Math.random() * 10 - 5)));
      setData(d => [...d.slice(-50), { t: new Date().toLocaleTimeString(), eng: next, arg: 100 - next }]);
    }, 1500);
    return () => clearInterval(id);
  }, [data]);
  return (
    <div className="rounded border p-4 bg-card">
      <h3 className="font-semibold mb-2">Crowd Bias: England vs Argentina</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="t" hide/>
            <YAxis domain={[0,100]} hide/>
            <Tooltip/>
            <Area type="monotone" dataKey="eng" stroke="#2563eb" fill="#93c5fd" />
            <Area type="monotone" dataKey="arg" stroke="#ef4444" fill="#fecaca" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
