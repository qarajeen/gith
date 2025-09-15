import { Film } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-border/40">
            <div className="container flex flex-col md:flex-row items-center justify-between py-8">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <Film className="h-5 w-5 text-primary" />
                    <span className="font-bold font-headline">WRH Enigma</span>
                </div>
                <div className="text-sm text-foreground/70 text-center md:text-right">
                    <p>&copy; {new Date().getFullYear()} WRH Enigma. All rights reserved.</p>
                    <p className="mt-1">Crafting cinematic experiences in Dubai, UAE</p>
                </div>
            </div>
        </footer>
    );
}
