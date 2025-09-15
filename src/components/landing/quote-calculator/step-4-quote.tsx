import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { summarizeQuote } from "@/ai/flows/summarize-quote-flow";
import { Download, Wand2 } from 'lucide-react';
import type { FormData } from './types';
import { serviceOptions, photographySubServices, videoSubServices, timelapseSubServices, toursSubServices, postProductionSubServices } from './types';
import jsPDF from 'jspdf';

type Step4QuoteProps = {
    formData: FormData;
    quoteDetails: { items: { name: string; price: string | number; }[]; total: number; };
    handlePrint: () => void;
    aiProjectTitle: string;
    setAiProjectTitle: (title: string) => void;
    aiSummary: string;
    setAiSummary: (summary: string) => void;
    isGeneratingSummary: boolean;
    setIsGeneratingSummary: (isGenerating: boolean) => void;
};

export function Step4Quote({
    formData,
    quoteDetails,
    handlePrint,
    aiProjectTitle,
    setAiProjectTitle,
    aiSummary,
    setAiSummary,
    isGeneratingSummary,
    setIsGeneratingSummary
}: Step4QuoteProps) {

    React.useEffect(() => {
        if (!aiSummary) {
          const generateSummary = async () => {
            setIsGeneratingSummary(true);
            try {
              const serviceName = formData.serviceType ? serviceOptions[formData.serviceType].name : '';
              let subTypeName = '';
              if (formData.serviceType === 'photography' && formData.photographySubType) {
                  subTypeName = photographySubServices[formData.photographySubType].name;
              } else if (formData.serviceType === 'video' && formData.videoSubType) {
                  subTypeName = videoSubServices[formData.videoSubType].name;
              } else if (formData.serviceType === 'timelapse' && formData.timelapseSubType) {
                  subTypeName = timelapseSubServices[formData.timelapseSubType].name;
              } else if (formData.serviceType === '360tours' && formData.toursSubType) {
                subTypeName = toursSubServices[formData.toursSubType].name;
              } else if (formData.serviceType === 'post' && formData.postSubType) {
                subTypeName = postProductionSubServices[formData.postSubType].name;
              }
              
              const selectedAddons: string[] = [];
              if (formData.secondCamera) selectedAddons.push("Second Camera");
              if (formData.timelapseExtraCamera) selectedAddons.push("Extra Camera");
              if (formData.deliveryTimeline === 'rush') selectedAddons.push("Rush Delivery");

              const input = {
                serviceType: `${serviceName}${subTypeName ? `: ${subTypeName}` : ''}`,
                packageType: 'Custom', // Simplified for AI
                location: formData.location,
                locationType: formData.locationType,
                addons: selectedAddons,
                name: formData.name,
              };
              const result = await summarizeQuote(input);
              setAiSummary(result.summary);
              setAiProjectTitle(result.projectTitle);
            } catch (error) {
              console.error("Error generating AI summary:", error);
              setAiSummary("Here is a summary of your quote selections.");
              setAiProjectTitle("Your Project Quote");
            } finally {
              setIsGeneratingSummary(false);
            }
          };
          generateSummary();
        }
      }, [formData, aiSummary, setAiSummary, setAiProjectTitle, setIsGeneratingSummary]);

    return (
        <div className="printable-area animate-fade-in-up pb-20 sm:pb-0">
            <div id="quote-preview" className="p-8 bg-card rounded-lg border-2 border-primary/20">
               {isGeneratingSummary ? (
                    <div className="space-y-4 text-center py-20">
                        <Wand2 className="mx-auto h-12 w-12 animate-pulse text-primary" />
                        <p className="text-lg text-muted-foreground">Generating your personalized quote...</p>
                        <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
                        <Skeleton className="h-4 w-full mx-auto" />
                        <Skeleton className="h-4 w-5/6 mx-auto" />
                        <div className="mt-8 space-y-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                        </div>
                    </div>
                ) : (
                    <>
                        <CardTitle className="text-3xl font-bold text-center pb-2">
                            {aiProjectTitle}
                        </CardTitle>
                        <CardDescription className="text-center pb-6 min-h-[40px] text-lg">
                            {aiSummary}
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
                )}
            </div>
             <div className="flex justify-end mt-6 gap-2">
                <Button onClick={handlePrint} size="lg" className="w-full">
                    <Download className="mr-2 h-5 w-5" />
                    Download as PDF
                </Button>
            </div>
            {/* The hidden PDF content is no longer needed with the new jspdf implementation */}
        </div>
    );
}