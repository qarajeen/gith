import * as React from 'react';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { summarizeQuote } from "@/ai/flows/summarize-quote-flow";
import { Download, Wand2 } from 'lucide-react';
import type { FormData } from './types';
import { serviceOptions, photographySubServices, videoSubServices, timelapseSubServices, toursSubServices, postProductionSubServices } from './types';

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
            <div id="pdf-quote-preview-container" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1200px' }}>
                <div id="pdf-quote-preview" className="p-12 bg-white text-black w-full text-lg font-sans">
                    <div className="flex justify-between items-start mb-12">
                        <div className="w-1/2">
                            <h2 className="text-5xl font-bold mb-4 text-violet-600">{aiProjectTitle}</h2>
                            <p className="text-gray-600 text-xl">{aiSummary}</p>
                        </div>
                        <div className="w-1/2 text-right">
                             <h3 className="text-4xl font-bold text-black">Estimated Quote</h3>
                        </div>
                    </div>
                    
                    <div className="space-y-3 mb-12">
                        <div className="flex bg-gray-100 font-semibold rounded-t-lg text-gray-800 text-xl">
                            <div className="flex-grow p-5">Description</div>
                            <div className="w-56 p-5 text-right">Price</div>
                        </div>
                        {quoteDetails.items.map((item, index) => (
                            <div key={index} className="flex border-b border-gray-200 last:border-0 items-center">
                                <div className="flex-grow p-5 text-gray-700">{item.name}</div>
                                <div className="w-56 p-5 text-right font-medium text-gray-800">{typeof item.price === 'number' ? `${item.price.toLocaleString()} AED` : item.price}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mb-16">
                        <div className="w-2/3 ml-auto">
                           <div className="flex justify-between items-center text-3xl font-bold py-8 bg-violet-100 text-violet-600 px-8 rounded-lg">
                                <span>Total Estimate</span>
                                <span>{quoteDetails.total.toLocaleString()} AED</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-gray-500 text-base mt-12 pt-8 border-t border-gray-200">
                        <h3 className="font-semibold mb-3 text-gray-800 text-lg">Terms &amp; Conditions</h3>
                        <p>50% advance payment required to confirm the booking. Balance due upon project completion.</p>
                        <p>This quote is valid for 30 days.</p>
                        <p className="mt-8 font-bold text-xl text-gray-800">Thank you for your business!</p>
                        <div className="mt-8 text-gray-600">
                            <p>hi@wrh.ae | +971586583939</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
