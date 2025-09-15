"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, ArrowRight, ArrowLeft, Camera, Video, Wand2, Orbit, Hourglass } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { summarizeQuote } from "@/ai/flows/summarize-quote-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

// Base Services
const serviceOptions = {
    photography: { name: "Photography", icon: <Camera className="w-8 h-8 mb-2" /> },
    video: { name: "Video Production", icon: <Video className="w-8 h-8 mb-2" /> },
    post: { name: "Post Production", icon: <Wand2 className="w-8 h-8 mb-2" /> },
    '360tours': { name: "360 Tours", icon: <Orbit className="w-8 h-8 mb-2" /> },
    timelapse: { name: "Time Lapse", icon: <Hourglass className="w-8 h-8 mb-2" /> },
};

// Photography Sub-Services
const photographySubServices = {
    event: { name: "Event Photography" },
    real_estate: { name: "Real Estate Photography" },
    headshots: { name: "Corporate/Business Headshots" },
    product: { name: "Product Photography" },
    food: { name: "Food Photography" },
    fashion: { name: "Fashion/Lifestyle Photography" },
    wedding: { name: "Wedding Photography" },
}

const locationTypeOptions = ["Indoor", "Outdoor", "Studio", "Exhibition Center", "Hotel", "Other"];

type FormData = {
    // Step 1: Service Selection
    serviceType: keyof typeof serviceOptions | "";
    photographySubType: keyof typeof photographySubServices | "";

    // Step 1.5: Photography Details
    eventDuration: "perHour" | "halfDay" | "fullDay";
    eventHours: number;
    realEstatePropertyType: "studio" | "1-bedroom" | "2-bedroom" | "3-bedroom" | "villa";
    realEstateFurnished: boolean;
    headshotsPeople: number;
    productPhotos: number;
    foodPhotos: number;
    fashionPrice: number;
    weddingPrice: number;
    
    // Step 2: Location
    location: string;
    locationType: string;

    // Step 3: Add-ons
    secondCamera: boolean;
    additionalHours: number;

    // Step 4: Contact
    name: string;
    email: string;
    phone: string;
    message: string;
};

type SummarizeQuoteInput = {
  serviceType: string;
  packageType: string;
  hours?: number;
  location: string;
  locationType: string;
  addons: string[];
};


export function QuoteCalculator() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        serviceType: "",
        photographySubType: "",
        eventDuration: "perHour",
        eventHours: 1,
        realEstatePropertyType: "studio",
        realEstateFurnished: false,
        headshotsPeople: 1,
        productPhotos: 1,
        foodPhotos: 1,
        fashionPrice: 1500,
        weddingPrice: 5000,
        location: "dubai",
        locationType: "Indoor",
        secondCamera: false,
        additionalHours: 0,
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [aiSummary, setAiSummary] = useState("");
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const { toast } = useToast();

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const nextStep = () => {
        if (step === 1 && formData.serviceType === '') {
             toast({ title: "Service Required", description: "Please select a service type to continue.", variant: "destructive" });
             return;
        }
        if (step === 1 && formData.serviceType === 'photography' && formData.photographySubType === '') {
             toast({ title: "Photography Type Required", description: "Please select a photography sub-type to continue.", variant: "destructive" });
             return;
        }
        if (step === 4) {
            if (!formData.name || !formData.email || !formData.phone) {
                toast({ title: "Missing Information", description: "Please fill out your name, email, and phone number.", variant: "destructive" });
                return;
            }
        }
        setStep((prev) => (prev < 5 ? prev + 1 : prev));
    }
    const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));
    
    useEffect(() => {
        if (step === 5 && !aiSummary) {
          const generateSummary = async () => {
            setIsGeneratingSummary(true);
            try {
              const serviceName = formData.serviceType ? serviceOptions[formData.serviceType].name : '';
              const subTypeName = formData.photographySubType ? photographySubServices[formData.photographySubType].name : '';
              
              const selectedAddons: string[] = [];
              if (formData.secondCamera) selectedAddons.push("Second Camera");
              if (formData.additionalHours > 0) selectedAddons.push(`${formData.additionalHours} Additional Hours`);
              
              const input = {
                serviceType: `${serviceName}${subTypeName ? `: ${subTypeName}` : ''}`,
                packageType: 'Custom', // Simplified for AI
                location: formData.location,
                locationType: formData.locationType,
                addons: selectedAddons,
              };
              const result = await summarizeQuote(input);
              setAiSummary(result.summary);
            } catch (error) {
              console.error("Error generating AI summary:", error);
              setAiSummary("Here is a summary of your quote selections.");
            } finally {
              setIsGeneratingSummary(false);
            }
          };
          generateSummary();
        }
      }, [step, formData, aiSummary]);


    const quoteDetails = useMemo(() => {
        let total = 0;
        let basePrice = 0;
        const items: { name: string; price: number | string }[] = [];
        
        if (!formData.serviceType) return { items, total };

        const serviceName = serviceOptions[formData.serviceType].name;
        let itemName = serviceName;

        if (formData.serviceType === 'photography' && formData.photographySubType) {
             const subTypeName = photographySubServices[formData.photographySubType].name;
             itemName = `${serviceName}: ${subTypeName}`;

            switch (formData.photographySubType) {
                case 'event':
                    if (formData.eventDuration === 'perHour') {
                        basePrice = formData.eventHours * 300;
                        itemName += ` (${formData.eventHours} hrs)`;
                    } else if (formData.eventDuration === 'halfDay') {
                        basePrice = 1200;
                        itemName += ' (Half Day)';
                    } else { // fullDay
                        basePrice = 2000;
                        itemName += ' (Full Day)';
                    }
                    break;
                case 'real_estate':
                    const prices = {
                        studio: [500, 8000],
                        '1-bedroom': [700, 1100],
                        '2-bedroom': [900, 1400],
                        '3-bedroom': [1100, 1600],
                        villa: [1500, 3000],
                    };
                    basePrice = prices[formData.realEstatePropertyType][formData.realEstateFurnished ? 1 : 0];
                    itemName += ` (${formData.realEstatePropertyType}, ${formData.realEstateFurnished ? 'Furnished' : 'Unfurnished'})`;
                    break;
                case 'headshots':
                    basePrice = formData.headshotsPeople * 350;
                    itemName += ` (${formData.headshotsPeople} people)`;
                    break;
                case 'product':
                    basePrice = formData.productPhotos * 250; // Using average for simplicity
                    itemName += ` (${formData.productPhotos} photos)`;
                    break;
                case 'food':
                    basePrice = formData.foodPhotos * 275; // Using average
                    itemName += ` (${formData.foodPhotos} photos)`;
                    break;
                case 'fashion':
                    basePrice = formData.fashionPrice;
                    itemName += ' (Half Day)';
                    break;
                case 'wedding':
                    basePrice = formData.weddingPrice;
                    itemName += ' (Package)';
                    break;
            }
        } else if (formData.serviceType !== 'photography') {
            // Placeholder for other services
            const otherServicePrices = { video: 3000, post: 1000, '360tours': 4000, timelapse: 2500 };
            basePrice = otherServicePrices[formData.serviceType as keyof typeof otherServicePrices] || 0;
        }

        total += basePrice;
        items.push({ name: itemName, price: basePrice });
        
        // Add-ons
        const p = formData.photographySubType;
        if (p === 'event' || p === 'fashion' || p === 'wedding') {
            if (formData.secondCamera) {
                const price = basePrice; // +100%
                items.push({ name: 'Second Camera', price });
                total += price;
            }
        }
        if (p === 'event' && formData.additionalHours > 0) {
            const price = formData.additionalHours * 300;
            items.push({ name: `Additional Hours (x${formData.additionalHours})`, price });
            total += price;
        }


        return { items, total };
    }, [formData]);

    const handlePrint = () => {
        const input = document.getElementById('quote-preview');
        if (input) {
            html2canvas(input, { scale: 2, backgroundColor: null }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                let width = pdfWidth - 20;
                let height = width / ratio;
                 if (height > pdfHeight - 20) {
                    height = pdfHeight - 20;
                    width = height * ratio;
                }
                const x = (pdfWidth - width) / 2;
                const y = (pdfHeight - height) / 2;

                pdf.addImage(imgData, 'PNG', x, y, width, height);
                pdf.save("quote.pdf");
            });
        }
    };
    
    const renderPhotographyOptions = () => (
        <div className="space-y-4 animate-fade-in-up">
            <h3 className="font-semibold mb-4 text-lg">Select Photography Type</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(photographySubServices).map(([id, { name }]) => (
                    <Button key={id} variant="outline" size="lg"
                        onClick={() => handleInputChange("photographySubType", id)}
                        className={cn("h-auto py-4 text-base transition-all hover:bg-accent/50 text-center justify-center",
                            formData.photographySubType === id ? 'border-primary bg-accent' : 'border-border'
                        )}
                    >
                        {name}
                    </Button>
                ))}
            </div>

            {formData.photographySubType === 'event' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">Event Details</h4>
                    <RadioGroup value={formData.eventDuration} onValueChange={(v) => handleInputChange("eventDuration", v)} className="flex gap-4">
                        {['perHour', 'halfDay', 'fullDay'].map(dur => (
                             <div className="flex-1" key={dur}>
                                <RadioGroupItem value={dur} id={`event-${dur}`} className="sr-only" />
                                <Label htmlFor={`event-${dur}`} className={cn("flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50",
                                    formData.eventDuration === dur ? 'border-primary bg-accent' : 'border-border'
                                )}>
                                    {dur === 'perHour' ? 'Per Hour' : dur === 'halfDay' ? 'Half Day (4hrs)' : 'Full Day (8hrs)'}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {formData.eventDuration === 'perHour' && (
                         <div>
                            <Label htmlFor="eventHours">Hours</Label>
                            <Input id="eventHours" type="number" value={formData.eventHours} onChange={(e) => handleInputChange("eventHours", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
                        </div>
                    )}
                </div>
            )}

            {formData.photographySubType === 'real_estate' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                     <h4 className="font-semibold">Real Estate Details</h4>
                     <div>
                        <Label htmlFor="realEstatePropertyType">Property Type</Label>
                        <Select value={formData.realEstatePropertyType} onValueChange={(v) => handleInputChange("realEstatePropertyType", v)}>
                            <SelectTrigger id="realEstatePropertyType" className="mt-2">
                                <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="1-bedroom">1-Bedroom</SelectItem>
                                <SelectItem value="2-bedroom">2-Bedroom</SelectItem>
                                <SelectItem value="3-bedroom">3-Bedroom</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="realEstateFurnished">Property is Furnished / Staged</Label>
                        <Switch id="realEstateFurnished" checked={formData.realEstateFurnished} onCheckedChange={(v) => handleInputChange("realEstateFurnished", v)} />
                     </div>
                </div>
            )}
             {formData.photographySubType === 'headshots' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">Headshot Details</h4>
                    <div>
                        <Label htmlFor="headshotsPeople">Number of People</Label>
                        <Input id="headshotsPeople" type="number" value={formData.headshotsPeople} onChange={(e) => handleInputChange("headshotsPeople", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
                    </div>
                </div>
            )}

            {(formData.photographySubType === 'product' || formData.photographySubType === 'food') && (
                 <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">{formData.photographySubType === 'product' ? 'Product' : 'Food'} Photography Details</h4>
                    <div>
                        <Label htmlFor="photosCount">Number of Photos</Label>
                        <Input id="photosCount" type="number" value={formData.photographySubType === 'product' ? formData.productPhotos : formData.foodPhotos}
                               onChange={(e) => handleInputChange(formData.photographySubType === 'product' ? "productPhotos" : "foodPhotos", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
                        <p className="text-sm text-muted-foreground mt-2">{formData.photographySubType === 'product' ? 'AED 100 - 400 per photo' : 'AED 150 - 400 per photo'}. Final price depends on complexity.</p>
                    </div>
                </div>
            )}

            {(formData.photographySubType === 'fashion' || formData.photographySubType === 'wedding') && (
                 <div className="pt-4 space-y-4 animate-fade-in-up">
                     <h4 className="font-semibold">{formData.photographySubType === 'fashion' ? 'Fashion/Lifestyle' : 'Wedding'} Details</h4>
                    <div>
                        <Label>Base Price (AED {formData.photographySubType === 'fashion' ? '1,500 - 5,000' : '5,000 - 25,000'})</Label>
                        <div className="flex items-center gap-4 mt-2">
                             <Slider
                                value={[formData.photographySubType === 'fashion' ? formData.fashionPrice : formData.weddingPrice]}
                                onValueChange={(v) => handleInputChange(formData.photographySubType === 'fashion' ? 'fashionPrice' : 'weddingPrice', v[0])}
                                min={formData.photographySubType === 'fashion' ? 1500 : 5000}
                                max={formData.photographySubType === 'fashion' ? 5000 : 25000}
                                step={100}
                            />
                             <span className="font-semibold w-24 text-center">{
                                 (formData.photographySubType === 'fashion' ? formData.fashionPrice : formData.weddingPrice).toLocaleString()
                             } AED</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div>
                            <h3 className="font-semibold mb-4 text-lg">Select Service Type</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(serviceOptions).map(([id, { name, icon }]) => (
                                    <div key={id} onClick={() => handleInputChange("serviceType", id)}
                                         className={cn("p-4 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center hover:bg-accent/50",
                                         formData.serviceType === id ? 'border-primary bg-accent text-primary-foreground' : 'border-border')}>
                                        {icon}
                                        <span className="font-medium text-center">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {formData.serviceType === 'photography' && renderPhotographyOptions()}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-fade-in-up">
                        <div>
                            <Label htmlFor="location" className="font-semibold text-lg">Location</Label>
                            <Select value={formData.location} onValueChange={(v) => handleInputChange("location", v)}>
                                <SelectTrigger id="location" className="mt-2">
                                    <SelectValue placeholder="Select a location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dubai">Dubai</SelectItem>
                                    <SelectItem value="abu-dhabi">Abu Dhabi</SelectItem>
                                    <SelectItem value="sharjah">Sharjah</SelectItem>
                                    <SelectItem value="other">Other UAE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4 text-lg">Location Type</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {locationTypeOptions.map((type) => (
                                    <Button
                                        key={type}
                                        variant="outline"
                                        onClick={() => handleInputChange("locationType", type)}
                                        className={cn("h-auto py-4 text-base transition-all hover:bg-accent/50",
                                            formData.locationType === type ? 'border-primary bg-accent' : 'border-border'
                                        )}
                                    >
                                        {type}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 3:
                const p = formData.photographySubType;
                const canHaveSecondCamera = p === 'event' || p === 'fashion' || p === 'wedding';
                const canHaveAdditionalHours = p === 'event';

                if (!canHaveSecondCamera && !canHaveAdditionalHours) {
                    return <p className="text-muted-foreground text-center py-10 animate-fade-in-up">No add-ons available for this service.</p>;
                }

                return (
                    <div className="space-y-6 animate-fade-in-up">
                        <h3 className="font-semibold text-lg">Add-ons</h3>
                         <div className="space-y-4">
                            {canHaveAdditionalHours && (
                                <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.additionalHours > 0 ? 'border-primary bg-accent' : 'border-border')}>
                                    <Label htmlFor="additionalHours">Additional Hours (AED 300/hr)</Label>
                                    <Input id="additionalHours" type="number" value={formData.additionalHours} onChange={(e) => handleInputChange("additionalHours", parseInt(e.target.value, 10) || 0)} min="0" className="w-24 text-center" />
                                </div>
                            )}
                             {canHaveSecondCamera && (
                                <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.secondCamera ? 'border-primary bg-accent' : 'border-border')}>
                                    <Label htmlFor="secondCamera" className="cursor-pointer flex-grow">Second Camera (+100% of Base Price)</Label>
                                    <Switch id="secondCamera" checked={formData.secondCamera} onCheckedChange={(v) => handleInputChange('secondCamera', v)} />
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 4:
                return (
                     <div className="space-y-4 animate-fade-in-up">
                        <h3 className="font-semibold text-lg">Contact Information</h3>
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="Your Name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" type="tel" placeholder="Your Phone Number" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="message">Message (Optional)</Label>
                            <Textarea id="message" placeholder="Tell us more about your project..." value={formData.message} onChange={(e) => handleInputChange("message", e.target.value)} />
                        </div>
                    </div>
                );
            case 5:
                return (
                     <div className="printable-area animate-fade-in-up">
                         <div id="quote-preview" className="p-8 bg-card rounded-lg border-2 border-primary/20">
                            <CardTitle className="text-3xl font-bold text-center pb-4">Your Quote</CardTitle>
                             <CardDescription className="text-center pb-6 min-h-[40px] text-lg">
                                {isGeneratingSummary ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-3/4 mx-auto" />
                                        <Skeleton className="h-4 w-1/2 mx-auto" />
                                    </div>
                                ) : (
                                    aiSummary
                                )}
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
                        </div>
                         <div className="flex justify-end mt-6 gap-2">
                            <Button onClick={handlePrint} size="lg" className="w-full">
                                <Download className="mr-2 h-5 w-5" />
                                Download as PDF
                            </Button>
                        </div>
                    </div>
                )
            default:
                return null;
        }
    };
    
    const stepTitles = ["Service", "Details", "Add-ons", "Contact", "Quote"];

    return (
        <Card className="w-full bg-card/80 backdrop-blur-sm border-white/10">
            <CardHeader>
                <div className="flex justify-center items-center mb-4">
                    {stepTitles.map((title, index) => (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center text-center">
                                <div className={cn(
                                    `w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2`,
                                    index + 1 <= step ? 'bg-primary border-primary text-primary-foreground' : 'bg-secondary border-border'
                                )}>
                                    {index + 1}
                                </div>
                                <p className={cn(
                                    `mt-2 text-xs md:text-sm font-medium transition-colors`,
                                    index + 1 <= step ? 'text-primary-foreground' : 'text-muted-foreground'
                                )}>{title}</p>
                            </div>
                            {index < stepTitles.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${index + 1 < step ? 'bg-primary' : 'bg-border'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <CardTitle className="text-3xl md:text-4xl font-bold text-center pt-8">{stepTitles[step-1]}</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[350px]">
                {renderStep()}
            </CardContent>
            <CardFooter className="flex justify-between">
                {step > 1 ? (
                    <Button variant="outline" onClick={prevStep} size="lg"><ArrowLeft className="mr-2 h-5 w-5"/> Previous</Button>
                ) : <div />}
                {step < 5 && (
                    <Button onClick={nextStep} size="lg">{step === 4 ? 'See Your Quote' : 'Next'} <ArrowRight className="ml-2 h-5 w-5"/></Button>
                )}
            </CardFooter>
        </Card>
    );
}
