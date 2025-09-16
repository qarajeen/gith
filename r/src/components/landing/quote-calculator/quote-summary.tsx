import * as React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FormData, photographySubServices, videoSubServices, postProductionSubServices, timelapseSubServices, toursSubServices, serviceOptions } from './types';
import { CheckCircle2, Circle } from 'lucide-react';

type QuoteSummaryProps = {
  quoteDetails: {
    items: { name: string; price: string | number }[];
    total: number;
  };
  formData: FormData;
};

export function QuoteSummary({ quoteDetails, formData }: QuoteSummaryProps) {

  const getServiceName = (type: keyof typeof serviceOptions | '', subType: string) => {
    if (!type) return "No service selected";
    const baseName = serviceOptions[type].name;
    let subName = '';

    if (type === 'photography' && subType) subName = photographySubServices[subType]?.name;
    else if (type === 'video' && subType) subName = videoSubServices[subType]?.name;
    else if (type === 'post' && subType) subName = postProductionSubServices[subType]?.name;
    else if (type === 'timelapse' && subType) subName = timelapseSubServices[subType]?.name;
    else if (type === '360tours' && subType) subName = toursSubServices[subType]?.name;

    return subName ? `${baseName}: ${subName}` : baseName;
  }

  const renderSummaryItems = () => {
    const items: { label: string; value: string }[] = [];

    if (formData.serviceType) {
      const subType = formData.photographySubType || formData.videoSubType || formData.postSubType || formData.timelapseSubType || formData.toursSubType;
      items.push({ label: 'Service', value: getServiceName(formData.serviceType, subType) });
    }

    if(formData.location && formData.serviceType !== 'post') {
      items.push({ label: 'Location', value: `${formData.location.charAt(0).toUpperCase() + formData.location.slice(1)} (${formData.locationType})` });
    }

    // Add more specific details based on selections
    const addOns = [];
    if (formData.secondCamera) addOns.push('Second Camera');
    if (formData.timelapseExtraCamera) addOns.push('Extra Camera');
    if (formData.videoCorporateTwoCam) addOns.push('Two-Camera Setup');
    if (formData.videoCorporateScripting) addOns.push('Scriptwriting');
    if (formData.videoPromoConcept) addOns.push('Advanced Concept');
    if(formData.deliveryTimeline === 'rush' && formData.serviceType !== 'post') addOns.push('Rush Delivery');

    if (addOns.length > 0) {
      items.push({ label: 'Add-ons', value: addOns.join(', ') });
    }

    return items.map((item, index) => (
      <div key={index} className="flex items-start justify-between text-sm py-2">
        <span className="font-medium text-muted-foreground">{item.label}</span>
        <span className="text-right font-semibold text-foreground max-w-[60%]">{item.value}</span>
      </div>
    ));
  };


  return (
    <Card className="w-full bg-card/80 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle>Quote Summary</CardTitle>
        <CardDescription>Your estimated project total.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 pr-4 -mr-4">
            <div className="space-y-2">
                {quoteDetails.items.length > 0 ? (
                    quoteDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-white/10 text-sm">
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                {item.name}
                            </span>
                            <span className="font-medium">{typeof item.price === 'number' ? `${item.price.toLocaleString()} AED` : item.price}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <Circle className="mx-auto w-8 h-8 mb-2" />
                        <p>Your selections will appear here.</p>
                    </div>
                )}
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <div className='w-full'>
            <Separator className="my-4 bg-primary/30" />
            <div className="flex justify-between font-bold text-xl">
                <span>Total Estimate</span>
                <span>{quoteDetails.total.toLocaleString()} AED</span>
            </div>
        </div>
      </CardFooter>
    </Card>
  );
}

    