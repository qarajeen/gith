import { QuoteCalculator } from '@/components/landing/quote-calculator';

export default function Home() {
  return (
    <main className="flex flex-col justify-center min-h-screen p-4 md:p-8">
      <div className="w-full mx-auto">
        <QuoteCalculator />
      </div>
    </main>
  );
}
