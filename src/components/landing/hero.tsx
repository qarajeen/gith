"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section id="hero" className="container flex flex-col items-center justify-center text-center py-20 md:py-32">
      <div className="animate-fade-in-up space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 font-headline bg-clip-text text-transparent bg-gradient-to-r from-white to-primary">
          WRH Enigma
        </h1>
        <p className="max-w-[700px] text-lg md:text-xl text-foreground/80 mb-8">
          Crafting Cinematic Stories, One Frame at a Time.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="#quote">Get a Quote</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#services">Our Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
