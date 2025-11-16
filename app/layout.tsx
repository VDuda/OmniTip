import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'OmniTip',
  description: 'Voice Sentiment Oracle for Live Soccer',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <div className="container py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
