import MatchScore from '@/components/MatchScore';
import SentimentChart from '@/components/SentimentChart';
import TipFeed from '@/components/TipFeed';
import WhatsAppSim from '@/components/WhatsAppSim';

export default function Page() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">OmniTip: England vs Argentina</h1>
      <MatchScore />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SentimentChart />
        </div>
        <div>
          <TipFeed />
        </div>
      </div>
      <WhatsAppSim />
    </main>
  );
}
