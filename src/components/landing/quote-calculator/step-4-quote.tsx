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
             {/* Hidden printable version */}
            <div id="pdf-quote-preview-container" className="hidden">
                <div id="pdf-quote-preview" className="p-12 bg-white text-black w-[1200px] text-base">
                    <div className="flex justify-between items-start mb-12 border-b pb-8 border-gray-300">
                        <div className="flex items-center gap-4">
                             <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24.0002 4.68652L43.3137 14.3433L37.3137 17.3433L24.0002 11.3433L10.6867 17.3433L4.68672 14.3433L24.0002 4.68652Z" fill="#A78BFA"/>
                                <path d="M4.68672 24.0002L10.6867 27.0002L24.0002 21.0002L37.3137 27.0002L43.3137 24.0002L24.0002 14.3434L4.68672 24.0002Z" fill="#8B5CF6"/>
                                <path d="M10.6867 36.6569L24.0002 30.6569L37.3137 36.6569L24.0002 43.3136L10.6867 36.6569Z" fill="#7C3AED"/>
                            </svg>
                            <div>
                                <h1 className="text-4xl font-bold text-violet-600 mb-0">WRH Enigma</h1>
                                <p className="text-gray-500">Creative Media Production</p>
                            </div>
                        </div>
                        <div className="text-right text-gray-500">
                            <p>+971 50 123 4567</p>
                            <p>hello@wrhenigma.com</p>
                            <p>Dubai, United Arab Emirates</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <div>
                            <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Billed To</h2>
                            <p className="font-bold text-lg text-gray-900">{formData.name}</p>
                            <p className="text-gray-500">{formData.email}</p>
                            <p className="text-gray-500">{formData.phone}</p>
                        </div>
                        <div className="text-right">
                             <h2 className="text-sm font-semibold uppercase text-gray-500 mb-2">Quote Date</h2>
                             <p className="font-bold text-lg text-gray-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                     
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-1 text-gray-900">{aiProjectTitle}</h2>
                        <p className="text-gray-500">{aiSummary}</p>
                    </div>
                    
                    <div className="space-y-2 mb-12">
                        <div className="flex bg-gray-100 font-semibold rounded-t-lg text-gray-800">
                            <div className="flex-grow p-4">Description</div>
                            <div className="w-48 p-4 text-right">Price</div>
                        </div>
                        {quoteDetails.items.map((item, index) => (
                            <div key={index} className="flex border-b border-gray-200 last:border-0">
                                <div className="flex-grow p-4 text-gray-600">{item.name}</div>
                                <div className="w-48 p-4 text-right font-medium text-gray-800">{typeof item.price === 'number' ? `${item.price.toLocaleString()} AED` : item.price}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mb-16">
                        <div className="w-1/2">
                            <div className="flex justify-between py-4 border-b border-gray-200">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium text-gray-800">{quoteDetails.items.reduce((acc, item) => acc + (typeof item.price === 'number' ? item.price : 0), 0).toLocaleString()} AED</span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold py-6 bg-violet-100/50 px-4 rounded-b-lg">
                                <span className="text-violet-600">Total Estimate</span>
                                <span className="text-violet-600">{quoteDetails.total.toLocaleString()} AED</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-gray-500 text-sm">
                        <h3 className="font-semibold mb-2 text-gray-800">Terms & Conditions</h3>
                        <p>50% advance payment required to confirm the booking. Balance due upon project completion.</p>
                        <p>This quote is valid for 30 days.</p>
                        <p className="mt-8 font-bold text-lg text-gray-800">Thank you for your business!</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
