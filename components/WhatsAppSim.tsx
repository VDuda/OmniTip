"use client";
import { useState } from 'react';

export default function WhatsAppSim() {
  const [text, setText] = useState('England next goal');
  const [status, setStatus] = useState('');
  const send = async () => {
    setStatus('Sending...');
    const res = await fetch('/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ From: '+541122233344', Body: text }),
    });
    setStatus(await res.text());
  };
  return (
    <div className="rounded border p-4 bg-card">
      <h3 className="font-semibold mb-2">WhatsApp Simulator</h3>
      <div className="flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} className="border px-3 py-2 rounded w-full"/>
        <button className="bg-black text-white px-4 py-2 rounded" onClick={send}>Send</button>
      </div>
      <div className="text-sm mt-2 opacity-70">{status}</div>
    </div>
  );
}
