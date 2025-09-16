import { ClientQuoteCalculator } from '@/components/landing/client-quote-calculator';

export default function Home() {
  return (
    <main className="flex flex-col justify-center min-h-screen p-4 md:p-8">
      <div className="w-full mx-auto">
        <ClientQuoteCalculator />
      </div>
    </main>
  );
}
