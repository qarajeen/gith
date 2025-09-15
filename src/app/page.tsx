import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Services } from '@/components/landing/services';
import { QuoteCalculator } from '@/components/landing/quote-calculator';
import { Contact } from '@/components/landing/contact';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Services />
        <div id="quote">
          <QuoteCalculator />
        </div>
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
