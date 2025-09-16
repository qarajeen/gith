"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const QuoteCalculator = dynamic(
  () => import('@/components/landing/quote-calculator').then((mod) => mod.QuoteCalculator),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 w-full">
            <Skeleton className="w-full h-[600px] rounded-lg" />
          </div>
          <div className="hidden lg:block lg:col-span-1">
            <Skeleton className="w-full h-[400px] rounded-lg" />
          </div>
        </div>
      </div>
    )
  }
);

export function ClientQuoteCalculator() {
  return <QuoteCalculator />;
}
