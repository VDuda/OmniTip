"use client";
import { useState } from 'react';
import GoalButton from '@/components/GoalButton';

export default function AdminPage() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState('');
  if (!ok) {
    return (
      <div className="max-w-sm space-y-3">
        <h2 className="text-xl font-semibold">Admin Login</h2>
        <input value={pw} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPw(e.target.value)} placeholder="Password" className="border px-3 py-2 rounded w-full" />
        <button className="bg-black text-white px-4 py-2 rounded" onClick={()=> setOk(pw === 'hack2025')}>Enter</button>
      </div>
    );
  }
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Controls</h1>
      <div className="flex gap-4">
        <GoalButton team="England" />
        <GoalButton team="Argentina" />
      </div>
    </main>
  );
}
