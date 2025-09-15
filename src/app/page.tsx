import { QuoteCalculator } from '@/components/landing/quote-calculator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <QuoteCalculator />
      </main>
    </div>
  );
}
