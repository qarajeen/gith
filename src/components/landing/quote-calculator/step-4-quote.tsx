import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';
import type { FormData } from './types';

type Step4QuoteProps = {
    formData: FormData;
    quoteDetails: { items: { name: string; price: string | number; }[]; total: number; };
    handlePrint: () => void;
};

export function Step4Quote({
    formData,
    quoteDetails,
    handlePrint,
}: Step4QuoteProps) {

    return (
        <div className="printable-area animate-fade-in-up pb-20 sm:pb-0">
            <div id="quote-preview" className="p-8 bg-card rounded-lg border-2 border-primary/20">
                <>
                    <CardTitle className="text-3xl font-bold text-center pb-2">
                        Your Project Quote
                    </CardTitle>
                    <CardDescription className="text-center pb-6 min-h-[40px] text-lg">
                        Here is a summary of your quote selections.
                    </CardDescription>
                    <div className="mt-4 space-y-4 text-base">
                        {quoteDetails.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-muted-foreground">{item.name}</span>
                                <span className="font-medium">{typeof item.price === 'number' ? `${item.price.toLocaleString()} AED` : item.price}</span>
                            </div>
                        ))}
                        <Separator className="my-4 bg-primary/30" />
                        <div className="flex justify-between font-bold text-xl">
                            <span>Total Estimate</span>
                            <span>{quoteDetails.total.toLocaleString()} AED</span>
                        </div>
                    </div>
                </>
            </div>
             <div className="flex justify-end mt-6 gap-2">
                <Button onClick={handlePrint} size="lg" className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Download as PDF
                </Button>
            </div>
        </div>
    );
}
