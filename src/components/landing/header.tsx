"use client";

import Link from "next/link";
import { Film } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Film className="h-6 w-6 text-accent" />
          <span className="font-headline">WRH Enigma</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="#services" className="transition-colors hover:text-accent">
            Services
          </Link>
          <Link href="#quote" className="transition-colors hover:text-accent">
            Quote
          </Link>
          <Link href="#contact" className="transition-colors hover:text-accent">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
