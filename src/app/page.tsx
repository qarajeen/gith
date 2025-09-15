import { QuoteCalculator } from '@/components/landing/quote-calculator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center">
      <main className="flex-1 container py-12">
        <QuoteCalculator />
      </main>
    </div>
  );
}
