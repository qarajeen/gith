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
};

// Video Production Sub-Services
const videoSubServices = {
    event: { name: "Event Videography" },
    corporate: { name: "Corporate Video" },
    promo: { name: "Promotional/Brand Video" },
    real_estate: { name: "Real Estate Videography" },
    wedding: { name: "Wedding Videography" },
};

// Time-Lapse Sub-Services
const timelapseSubServices = {
    short: { name: 'Short Term (1-10 hours)' },
    long: { name: 'Long Term (Days/Weeks)' },
    extreme: { name: 'Extreme Long Term (Months/Years)' },
};

// 360 Tours Sub-Services
const toursSubServices = {
    studio: { name: "Studio Apartment" },
    '1-bedroom': { name: "1-Bedroom Apartment" },
    '2-bedroom': { name: "2-Bedroom Apartment" },
    '3-bedroom': { name: "3-Bedroom Villa" },
};

// Post-Production Sub-Services
const postProductionSubServices = {
    video: { name: 'Video Editing' },
    photo: { name: 'Photo Editing (Retouching)' },
};

const locationTypeOptions = ["Indoor", "Outdoor", "Studio", "Exhibition Center", "Hotel", "Other"];

type FormData = {
    // Step 1: Service Selection
    serviceType: keyof typeof serviceOptions | "";
    photographySubType: keyof typeof photographySubServices | "";
    videoSubType: keyof typeof videoSubServices | "";
    timelapseSubType: keyof typeof timelapseSubServices | "";
    toursSubType: keyof typeof toursSubServices | "";
    postSubType: keyof typeof postProductionSubServices | '';

    // Step 1.5: Photography Details
    photoEventDuration: "perHour" | "halfDay" | "fullDay";
    photoEventHours: number;
    photoRealEstatePropertyType: "studio" | "1-bedroom" | "2-bedroom" | "3-bedroom" | "villa";
    photoRealEstateFurnished: boolean;
    photoHeadshotsPeople: number;
    photoProductPhotos: number;
    photoFoodPhotos: number;
    photoFashionPrice: number;
    photoWeddingPrice: number;
    
    // Step 1.6: Video Details
    videoEventDuration: "perHour" | "halfDay" | "fullDay";
    videoEventHours: number;
    videoCorporateExtendedFilming: "none" | "halfDay" | "fullDay";
    videoCorporateTwoCam: boolean;
    videoCorporateScripting: boolean;
    videoCorporateEditing: boolean;
    videoCorporateGraphics: boolean;
    videoCorporateVoiceover: boolean;
    videoPromoFullDay: boolean;
    videoPromoMultiLoc: number;
    videoPromoConcept: boolean;
    videoPromoGraphics: boolean;
    videoPromoSound: boolean;
    videoPromoMakeup: boolean;
    videoRealEstatePropertyType: "studio" | "1-bedroom" | "2-bedroom" | "3-bedroom" | "villa";
    videoWeddingPrice: number;

    // Step 1.7: Time-Lapse Details
    timelapsePrice: number;
    
    // Step 1.8: 360 Tours handled by sub-type
    
    // Step 1.9 Post-Production Details
    postVideoEditingType: 'perHour' | 'perMinute' | 'social';
    postVideoEditingHours: number;
    postVideoEditingMinutes: number;
    postVideoEditingPerMinutePrice: number;
    postVideoEditingSocialPrice: number;
    postPhotoEditingType: 'basic' | 'advanced' | 'restoration';
    postPhotoEditingQuantity: number;
    postPhotoEditingPrice: number;

    // Step 2: Location & Add-ons
    location: string;
    locationType: string;
    secondCamera: boolean;
    timelapseExtraCamera: boolean;
    deliveryTimeline: "standard" | "rush";


    // Step 3: Contact
    name: string;
    email: string;
    phone: string;
    message: string;
};

export function QuoteCalculator() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        serviceType: "",
        photographySubType: "",
        videoSubType: "",
        timelapseSubType: "",
        toursSubType: "",
        postSubType: '',

        photoEventDuration: "perHour",
        photoEventHours: 1,
        photoRealEstatePropertyType: "studio",
        photoRealEstateFurnished: false,
        photoHeadshotsPeople: 1,
        photoProductPhotos: 1,
        photoFoodPhotos: 1,
        photoFashionPrice: 1500,
        photoWeddingPrice: 5000,
        
        videoEventDuration: "perHour",
        videoEventHours: 1,
        videoCorporateExtendedFilming: "none",
        videoCorporateTwoCam: false,
        videoCorporateScripting: false,
        videoCorporateEditing: false,
        videoCorporateGraphics: false,
        videoCorporateVoiceover: false,
        videoPromoFullDay: false,
        videoPromoMultiLoc: 0,
        videoPromoConcept: false,
        videoPromoGraphics: false,
        videoPromoSound: false,
        videoPromoMakeup: false,
        videoRealEstatePropertyType: "studio",
        videoWeddingPrice: 3000,

        timelapsePrice: 2000,

        postVideoEditingType: 'perHour',
        postVideoEditingHours: 1,
        postVideoEditingMinutes: 1,
        postVideoEditingPerMinutePrice: 500,
        postVideoEditingSocialPrice: 500,
        postPhotoEditingType: 'basic',
        postPhotoEditingQuantity: 1,
        postPhotoEditingPrice: 20,

        location: "dubai",
        locationType: "Indoor",
        secondCamera: false,
        timelapseExtraCamera: false,
        deliveryTimeline: "standard",

        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [aiSummary, setAiSummary] = useState("");
    const [aiProjectTitle, setAiProjectTitle] = useState("");
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
        if (step === 1 && formData.serviceType === 'video' && formData.videoSubType === '') {
             toast({ title: "Video Type Required", description: "Please select a video sub-type to continue.", variant: "destructive" });
             return;
        }
        if (step === 1 && formData.serviceType === 'timelapse' && formData.timelapseSubType === '') {
            toast({ title: "Time-Lapse Type Required", description: "Please select a project length to continue.", variant: "destructive" });
            return;
       }
       if (step === 1 && formData.serviceType === '360tours' && formData.toursSubType === '') {
            toast({ title: "Property Type Required", description: "Please select a property type to continue.", variant: "destructive" });
            return;
        }
        if (step === 1 && formData.serviceType === 'post' && formData.postSubType === '') {
            toast({ title: "Post-Production Type Required", description: "Please select a post-production sub-type to continue.", variant: "destructive" });
            return;
        }
        if (step === 3) {
            if (!formData.name || !formData.email || !formData.phone) {
                toast({ title: "Missing Information", description: "Please fill out your name, email, and phone number.", variant: "destructive" });
                return;
            }
        }
        setStep((prev) => (prev < 4 ? prev + 1 : prev));
    }
    const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));
    
    useEffect(() => {
        if (step === 4 && !aiSummary) {
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
      }, [step, formData, aiSummary]);


    const quoteDetails = useMemo(() => {
        let subtotal = 0;
        let basePrice = 0;
        const items: { name: string; price: number | string }[] = [];
        
        if (!formData.serviceType) return { items, total: 0 };

        const serviceName = serviceOptions[formData.serviceType].name;
        let itemName = serviceName;

        if (formData.serviceType === 'photography' && formData.photographySubType) {
             const subTypeName = photographySubServices[formData.photographySubType].name;
             itemName = `${serviceName}: ${subTypeName}`;

            switch (formData.photographySubType) {
                case 'event':
                    if (formData.photoEventDuration === 'perHour') {
                        basePrice = formData.photoEventHours * 300;
                        itemName += ` (${formData.photoEventHours} hrs)`;
                    } else if (formData.photoEventDuration === 'halfDay') {
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
                    basePrice = prices[formData.photoRealEstatePropertyType][formData.photoRealEstateFurnished ? 1 : 0];
                    itemName += ` (${formData.photoRealEstatePropertyType}, ${formData.photoRealEstateFurnished ? 'Furnished' : 'Unfurnished'})`;
                    break;
                case 'headshots':
                    basePrice = formData.photoHeadshotsPeople * 350;
                    itemName += ` (${formData.photoHeadshotsPeople} people)`;
                    break;
                case 'product':
                    basePrice = formData.photoProductPhotos * 250; // Using average for simplicity
                    itemName += ` (${formData.photoProductPhotos} photos)`;
                    break;
                case 'food':
                    basePrice = formData.photoFoodPhotos * 275; // Using average
                    itemName += ` (${formData.photoFoodPhotos} photos)`;
                    break;
                case 'fashion':
                    basePrice = formData.photoFashionPrice;
                    itemName += ' (Half Day)';
                    break;
                case 'wedding':
                    basePrice = formData.photoWeddingPrice;
                    itemName += ' (Package)';
                    break;
            }
        } else if (formData.serviceType === 'video' && formData.videoSubType) {
            const subTypeName = videoSubServices[formData.videoSubType].name;
            itemName = `${serviceName}: ${subTypeName}`;

            switch(formData.videoSubType) {
                case 'event':
                     if (formData.videoEventDuration === 'perHour') {
                        basePrice = formData.videoEventHours * 400;
                        itemName += ` (${formData.videoEventHours} hrs)`;
                    } else if (formData.videoEventDuration === 'halfDay') {
                        basePrice = 1200;
                        itemName += ' (Half Day)';
                    } else { // fullDay
                        basePrice = 2200;
                        itemName += ' (Full Day)';
                    }
                    break;
                case 'corporate':
                    basePrice = 3000;
                    itemName += ' (The Basic Package)';
                    break;
                case 'promo':
                    basePrice = 8000;
                    itemName += ' (The Foundation Package)';
                    break;
                case 'real_estate':
                    const prices = { studio: 700, '1-bedroom': 1000, '2-bedroom': 1350, '3-bedroom': 1750, villa: 2500 };
                    basePrice = prices[formData.videoRealEstatePropertyType];
                    itemName += ` (${formData.videoRealEstatePropertyType})`;
                    break;
                case 'wedding':
                    basePrice = formData.videoWeddingPrice;
                    itemName += ' (Package)';
                    break;
            }
        } else if (formData.serviceType === 'timelapse' && formData.timelapseSubType) {
            const subTypeName = timelapseSubServices[formData.timelapseSubType].name;
            itemName = `${serviceName}: ${subTypeName}`;
            basePrice = formData.timelapsePrice;
        } else if (formData.serviceType === '360tours' && formData.toursSubType) {
            const subTypeName = toursSubServices[formData.toursSubType].name;
            itemName = `${serviceName}: ${subTypeName}`;
            const prices = { studio: 750, '1-bedroom': 1000, '2-bedroom': 1350, '3-bedroom': 1750 };
            basePrice = prices[formData.toursSubType];
        } else if (formData.serviceType === 'post' && formData.postSubType) {
            const subTypeName = postProductionSubServices[formData.postSubType].name;
            itemName = `${serviceName}: ${subTypeName}`;

            if (formData.postSubType === 'video') {
                switch(formData.postVideoEditingType) {
                    case 'perHour':
                        basePrice = formData.postVideoEditingHours * 250;
                        itemName += ` (${formData.postVideoEditingHours} hrs)`;
                        break;
                    case 'perMinute':
                        basePrice = formData.postVideoEditingMinutes * formData.postVideoEditingPerMinutePrice;
                        itemName += ` (${formData.postVideoEditingMinutes} min @ ${formData.postVideoEditingPerMinutePrice} AED/min)`;
                        break;
                    case 'social':
                        basePrice = formData.postVideoEditingSocialPrice;
                        itemName += ` (Social Media Edit)`;
                        break;
                }
            } else { // photo
                basePrice = formData.postPhotoEditingQuantity * formData.postPhotoEditingPrice;
                itemName += ` (${formData.postPhotoEditingQuantity} photos @ ${formData.postPhotoEditingPrice} AED/photo)`;
            }
        }

        subtotal += basePrice;
        items.push({ name: itemName, price: basePrice });
        
        // Photography Add-ons
        const p = formData.photographySubType;
        if (formData.serviceType === 'photography' && (p === 'event' || p === 'fashion' || p === 'wedding')) {
            if (formData.secondCamera) {
                const price = basePrice; // +100%
                items.push({ name: 'Second Camera', price });
                subtotal += price;
            }
        }

        // Video Add-ons
        const v = formData.videoSubType;
        if (formData.serviceType === 'video') {
            if (v === 'event' || v === 'wedding') {
                 if (formData.secondCamera) {
                    const price = basePrice; // +100%
                    items.push({ name: 'Second Camera', price });
                    subtotal += price;
                }
            }

            if (v === 'corporate') {
                if (formData.videoCorporateExtendedFilming === 'halfDay') { subtotal += 1500; items.push({ name: 'Extended Filming (Half-Day)', price: 1500 }); }
                if (formData.videoCorporateExtendedFilming === 'fullDay') { subtotal += 3500; items.push({ name: 'Extended Filming (Full-Day)', price: 3500 }); }
                if (formData.videoCorporateTwoCam) { subtotal += 950; items.push({ name: 'Two-Camera Interview Setup', price: 950 }); }
                if (formData.videoCorporateScripting) { subtotal += 1500; items.push({ name: 'Full Scriptwriting & Storyboarding', price: 1500 }); }
                if (formData.videoCorporateEditing) { subtotal += 1000; items.push({ name: 'Advanced Editing & Color Grading', price: 1000 }); }
                if (formData.videoCorporateGraphics) { subtotal += 800; items.push({ name: 'Custom Motion Graphics', price: 800 }); }
                if (formData.videoCorporateVoiceover) { subtotal += 500; items.push({ name: 'Professional Voice-over', price: 500 }); }
            }
            
            if (v === 'promo') {
                if (formData.videoPromoFullDay) { subtotal += 5000; items.push({ name: 'Full-Day Production', price: 5000 }); }
                if (formData.videoPromoMultiLoc > 0) { subtotal += formData.videoPromoMultiLoc * 2000; items.push({ name: `Multi-Location Shoot (x${formData.videoPromoMultiLoc})`, price: formData.videoPromoMultiLoc * 2000 }); }
                if (formData.videoPromoConcept) { subtotal += 3000; items.push({ name: 'Advanced Storyboarding & Concept', price: 3000 }); }
                if (formData.videoPromoGraphics) { subtotal += 4000; items.push({ name: 'Advanced 2D/3D Motion Graphics', price: 4000 }); }
                if (formData.videoPromoSound) { subtotal += 3000; items.push({ name: 'Custom Sound Design & Mixing', price: 3000 }); }
                if (formData.videoPromoMakeup) { subtotal += 2000; items.push({ name: 'Hair & Makeup Artist', price: 2000 }); }
            }
        }

        // Time-Lapse Add-ons
        if (formData.serviceType === 'timelapse') {
            if (formData.timelapseExtraCamera) {
                const price = basePrice; // +100%
                items.push({ name: 'Extra Camera', price });
                subtotal += price;
            }
        }
        
        let total = subtotal;

        // Universal Modifiers
        const travelFees = {
            dubai: 0,
            sharjah: 100,
            'abu-dhabi': 200,
            other: 200,
        };
        const travelFee = travelFees[formData.location as keyof typeof travelFees] || 0;
        if (travelFee > 0 && formData.serviceType !== 'post') {
            items.push({ name: `Logistics & Travel Fee (${formData.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())})`, price: travelFee });
            total += travelFee;
        }

        if (formData.deliveryTimeline === 'rush' && formData.serviceType !== 'post') {
            const rushFee = subtotal * 0.5;
            items.push({ name: 'Rush Delivery (24 hours)', price: rushFee });
            total += rushFee;
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
                    <RadioGroup value={formData.photoEventDuration} onValueChange={(v) => handleInputChange("photoEventDuration", v)} className="flex gap-4">
                        {['perHour', 'halfDay', 'fullDay'].map(dur => (
                             <div className="flex-1" key={dur}>
                                <RadioGroupItem value={dur} id={`photo-event-${dur}`} className="sr-only" />
                                <Label htmlFor={`photo-event-${dur}`} className={cn("flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50",
                                    formData.photoEventDuration === dur ? 'border-primary bg-accent' : 'border-border'
                                )}>
                                    {dur === 'perHour' ? 'Per Hour' : dur === 'halfDay' ? 'Half Day (4hrs)' : 'Full Day (8hrs)'}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {formData.photoEventDuration === 'perHour' && (
                         <div>
                            <Label htmlFor="photoEventHours">Hours</Label>
                            <Input id="photoEventHours" type="number" value={formData.photoEventHours} onChange={(e) => handleInputChange("photoEventHours", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
                        </div>
                    )}
                </div>
            )}

            {formData.photographySubType === 'real_estate' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                     <h4 className="font-semibold">Real Estate Details</h4>
                     <div>
                        <Label htmlFor="photoRealEstatePropertyType">Property Type</Label>
                        <Select value={formData.photoRealEstatePropertyType} onValueChange={(v) => handleInputChange("photoRealEstatePropertyType", v)}>
                            <SelectTrigger id="photoRealEstatePropertyType" className="mt-2">
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
                        <Label htmlFor="photoRealEstateFurnished">Property is Furnished / Staged</Label>
                        <Switch id="photoRealEstateFurnished" checked={formData.photoRealEstateFurnished} onCheckedChange={(v) => handleInputChange("photoRealEstateFurnished", v)} />
                     </div>
                </div>
            )}
             {formData.photographySubType === 'headshots' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">Headshot Details</h4>
                    <div>
                        <Label htmlFor="photoHeadshotsPeople">Number of People</Label>
                        <Input id="photoHeadshotsPeople" type="number" value={formData.photoHeadshotsPeople} onChange={(e) => handleInputChange("photoHeadshotsPeople", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
                    </div>
                </div>
            )}

            {(formData.photographySubType === 'product' || formData.photographySubType === 'food') && (
                 <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">{formData.photographySubType === 'product' ? 'Product' : 'Food'} Photography Details</h4>
                    <div>
                        <Label htmlFor="photosCount">Number of Photos</Label>
                        <Input id="photosCount" type="number" value={formData.photographySubType === 'product' ? formData.photoProductPhotos : formData.photoFoodPhotos}
                               onChange={(e) => handleInputChange(formData.photographySubType === 'product' ? "photoProductPhotos" : "photoFoodPhotos", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
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
                                value={[formData.photographySubType === 'fashion' ? formData.photoFashionPrice : formData.photoWeddingPrice]}
                                onValueChange={(v) => handleInputChange(formData.photographySubType === 'fashion' ? 'photoFashionPrice' : 'photoWeddingPrice', v[0])}
                                min={formData.photographySubType === 'fashion' ? 1500 : 5000}
                                max={formData.photographySubType === 'fashion' ? 5000 : 25000}
                                step={100}
                            />
                             <span className="font-semibold w-24 text-center">{
                                 (formData.photographySubType === 'fashion' ? formData.photoFashionPrice : formData.photoWeddingPrice).toLocaleString()
                             } AED</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
    
    const renderVideoOptions = () => (
        <div className="space-y-4 animate-fade-in-up">
            <h3 className="font-semibold mb-4 text-lg">Select Video Production Type</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(videoSubServices).map(([id, { name }]) => (
                    <Button key={id} variant="outline" size="lg"
                        onClick={() => handleInputChange("videoSubType", id)}
                        className={cn("h-auto py-4 text-base transition-all hover:bg-accent/50 text-center justify-center",
                            formData.videoSubType === id ? 'border-primary bg-accent' : 'border-border'
                        )}
                    >
                        {name}
                    </Button>
                ))}
            </div>

            {formData.videoSubType === 'event' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">Event Details</h4>
                    <RadioGroup value={formData.videoEventDuration} onValueChange={(v) => handleInputChange("videoEventDuration", v)} className="flex gap-4">
                        {['perHour', 'halfDay', 'fullDay'].map(dur => (
                             <div className="flex-1" key={dur}>
                                <RadioGroupItem value={dur} id={`video-event-${dur}`} className="sr-only" />
                                <Label htmlFor={`video-event-${dur}`} className={cn("flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50",
                                    formData.videoEventDuration === dur ? 'border-primary bg-accent' : 'border-border'
                                )}>
                                    {dur === 'perHour' ? 'Per Hour' : dur === 'halfDay' ? 'Half Day (4hrs)' : 'Full Day (8hrs)'}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {formData.videoEventDuration === 'perHour' && (
                         <div>
                            <Label htmlFor="videoEventHours">Hours</Label>
                            <Input id="videoEventHours" type="number" value={formData.videoEventHours} onChange={(e) => handleInputChange("videoEventHours", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
                        </div>
                    )}
                </div>
            )}
            
            {formData.videoSubType === 'corporate' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">Corporate Video Details (Basic Package: AED 3,000)</h4>
                    <div className="space-y-3">
                         <div>
                            <Label>Extended Filming</Label>
                            <RadioGroup value={formData.videoCorporateExtendedFilming} onValueChange={(v) => handleInputChange("videoCorporateExtendedFilming", v)} className="flex gap-4 mt-2">
                                {[['none', 'None'], ['halfDay', 'Half-Day (+1,500)'], ['fullDay', 'Full-Day (+3,500)']].map(([val, label]) => (
                                     <div className="flex-1" key={val}>
                                        <RadioGroupItem value={val} id={`corp-film-${val}`} className="sr-only" />
                                        <Label htmlFor={`corp-film-${val}`} className={cn("flex items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50",
                                            formData.videoCorporateExtendedFilming === val ? 'border-primary bg-accent' : 'border-border'
                                        )}>
                                            {label}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoCorporateTwoCam">Two-Camera Interview Setup (+ AED 950)</Label>
                            <Switch id="videoCorporateTwoCam" checked={formData.videoCorporateTwoCam} onCheckedChange={(v) => handleInputChange("videoCorporateTwoCam", v)} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoCorporateScripting">Full Scriptwriting & Storyboarding (+ AED 1,500)</Label>
                            <Switch id="videoCorporateScripting" checked={formData.videoCorporateScripting} onCheckedChange={(v) => handleInputChange("videoCorporateScripting", v)} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoCorporateEditing">Advanced Editing & Color Grading (+ AED 1,000)</Label>
                            <Switch id="videoCorporateEditing" checked={formData.videoCorporateEditing} onCheckedChange={(v) => handleInputChange("videoCorporateEditing", v)} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoCorporateGraphics">Custom Motion Graphics (+ AED 800)</Label>
                            <Switch id="videoCorporateGraphics" checked={formData.videoCorporateGraphics} onCheckedChange={(v) => handleInputChange("videoCorporateGraphics", v)} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoCorporateVoiceover">Professional Voice-over (+ AED 500)</Label>
                            <Switch id="videoCorporateVoiceover" checked={formData.videoCorporateVoiceover} onCheckedChange={(v) => handleInputChange("videoCorporateVoiceover", v)} />
                        </div>
                    </div>
                </div>
            )}

            {formData.videoSubType === 'promo' && (
                 <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">Promotional Video Details (Foundation Package: AED 8,000)</h4>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoPromoFullDay">Full-Day Production (+ AED 5,000)</Label>
                            <Switch id="videoPromoFullDay" checked={formData.videoPromoFullDay} onCheckedChange={(v) => handleInputChange("videoPromoFullDay", v)} />
                        </div>
                         <div>
                            <Label htmlFor="videoPromoMultiLoc">Additional Locations (+ AED 2,000 each)</Label>
                            <Input id="videoPromoMultiLoc" type="number" value={formData.videoPromoMultiLoc} onChange={(e) => handleInputChange("videoPromoMultiLoc", Math.max(0, parseInt(e.target.value, 10) || 0))} min="0" className="mt-2" />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoPromoConcept">Advanced Storyboarding & Concept (+ AED 3,000)</Label>
                            <Switch id="videoPromoConcept" checked={formData.videoPromoConcept} onCheckedChange={(v) => handleInputChange("videoPromoConcept", v)} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoPromoGraphics">Advanced 2D/3D Motion Graphics (+ AED 4,000)</Label>
                            <Switch id="videoPromoGraphics" checked={formData.videoPromoGraphics} onCheckedChange={(v) => handleInputChange("videoPromoGraphics", v)} />
                        </div>
                         <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoPromoSound">Custom Sound Design & Mixing (+ AED 3,000)</Label>
                            <Switch id="videoPromoSound" checked={formData.videoPromoSound} onCheckedChange={(v) => handleInputChange("videoPromoSound", v)} />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <Label htmlFor="videoPromoMakeup">Hair & Makeup Artist (+ AED 2,000)</Label>
                            <Switch id="videoPromoMakeup" checked={formData.videoPromoMakeup} onCheckedChange={(v) => handleInputChange("videoPromoMakeup", v)} />
                        </div>
                    </div>
                </div>
            )}

            {formData.videoSubType === 'real_estate' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                     <h4 className="font-semibold">Real Estate Details</h4>
                     <div>
                        <Label htmlFor="videoRealEstatePropertyType">Property Type</Label>
                        <Select value={formData.videoRealEstatePropertyType} onValueChange={(v) => handleInputChange("videoRealEstatePropertyType", v)}>
                            <SelectTrigger id="videoRealEstatePropertyType" className="mt-2">
                                <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="1-bedroom">1-Bedroom Apartment</SelectItem>
                                <SelectItem value="2-bedroom">2-Bedroom Apartment</SelectItem>
                                <SelectItem value="3-bedroom">3-Bedroom Apartment</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </div>
            )}
            
            {formData.videoSubType === 'wedding' && (
                 <div className="pt-4 space-y-4 animate-fade-in-up">
                     <h4 className="font-semibold">Wedding Videography Details</h4>
                    <div>
                        <Label>Base Price (AED 3,000 - 10,000)</Label>
                        <div className="flex items-center gap-4 mt-2">
                             <Slider
                                value={[formData.videoWeddingPrice]}
                                onValueChange={(v) => handleInputChange('videoWeddingPrice', v[0])}
                                min={3000}
                                max={10000}
                                step={100}
                            />
                             <span className="font-semibold w-24 text-center">{formData.videoWeddingPrice.toLocaleString()} AED</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderTimelapseOptions = () => {
        const timelapsePrices = {
            short: { min: 2000, max: 4000, label: "AED 2,000 - 4,000" },
            long: { min: 4000, max: 8000, label: "AED 4,000 - 8,000" },
            extreme: { min: 8000, max: 20000, label: "AED 8,000 - 20,000+" },
        };
        const selected = formData.timelapseSubType as keyof typeof timelapsePrices;
        const priceConfig = selected ? timelapsePrices[selected] : null;

        return (
            <div className="space-y-4 animate-fade-in-up">
                <h3 className="font-semibold mb-4 text-lg">Select Project Length</h3>
                <RadioGroup value={formData.timelapseSubType} onValueChange={(v) => {
                    const newSubType = v as keyof typeof timelapsePrices;
                    handleInputChange("timelapseSubType", newSubType);
                    handleInputChange("timelapsePrice", timelapsePrices[newSubType].min);
                }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(timelapseSubServices).map(([id, { name }]) => (
                        <div key={id}>
                            <RadioGroupItem value={id} id={`tl-${id}`} className="sr-only" />
                            <Label htmlFor={`tl-${id}`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 h-full",
                                formData.timelapseSubType === id ? 'border-primary bg-accent' : 'border-border'
                            )}>
                                {name}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>

                {formData.timelapseSubType && priceConfig && (
                    <div className="pt-4 space-y-4 animate-fade-in-up">
                        <h4 className="font-semibold">Project Base Price</h4>
                        <div>
                            <Label>({priceConfig.label})</Label>
                            <div className="flex items-center gap-4 mt-2">
                                <Slider
                                    value={[formData.timelapsePrice]}
                                    onValueChange={(v) => handleInputChange('timelapsePrice', v[0])}
                                    min={priceConfig.min}
                                    max={priceConfig.max}
                                    step={100}
                                />
                                <span className="font-semibold w-24 text-center">{formData.timelapsePrice.toLocaleString()} AED</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const render360ToursOptions = () => (
        <div className="space-y-4 animate-fade-in-up">
            <h3 className="font-semibold mb-4 text-lg">Select Property Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {Object.entries(toursSubServices).map(([id, { name }]) => (
                    <Button
                        key={id}
                        variant="outline"
                        size="lg"
                        onClick={() => handleInputChange("toursSubType", id)}
                        className={cn(
                            "h-auto py-4 text-base transition-all hover:bg-accent/50 text-center justify-center",
                            formData.toursSubType === id ? 'border-primary bg-accent' : 'border-border'
                        )}
                    >
                        {name}
                    </Button>
                ))}
            </div>
        </div>
    );
    
    const renderPostProductionOptions = () => {
        const photoEditingPrices = {
            basic: { min: 20, max: 50, label: "AED 20 - 50" },
            advanced: { min: 50, max: 250, label: "AED 50 - 250" },
            restoration: { min: 100, max: 300, label: "AED 100 - 300" },
        };
        const selectedPhotoType = formData.postPhotoEditingType;
        const photoPriceConfig = photoEditingPrices[selectedPhotoType];

        return (
            <div className="space-y-4 animate-fade-in-up">
                <h3 className="font-semibold mb-4 text-lg">Select Post-Production Type</h3>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(postProductionSubServices).map(([id, { name }]) => (
                        <Button
                            key={id}
                            variant="outline"
                            size="lg"
                            onClick={() => {
                                handleInputChange("postSubType", id)
                                // Reset prices on change
                                if (id === 'photo') {
                                    handleInputChange('postPhotoEditingPrice', photoEditingPrices.basic.min);
                                }
                            }}
                            className={cn("h-auto py-4 text-base transition-all hover:bg-accent/50 text-center justify-center",
                                formData.postSubType === id ? 'border-primary bg-accent' : 'border-border'
                            )}
                        >
                            {name}
                        </Button>
                    ))}
                </div>

                {formData.postSubType === 'video' && (
                    <div className="pt-4 space-y-4 animate-fade-in-up">
                        <h4 className="font-semibold">Video Editing Details</h4>
                        <RadioGroup value={formData.postVideoEditingType} onValueChange={(v) => handleInputChange('postVideoEditingType', v)} className="grid md:grid-cols-3 gap-4">
                             {['perHour', 'perMinute', 'social'].map(type => (
                                 <div key={type}>
                                    <RadioGroupItem value={type} id={`post-video-${type}`} className="sr-only" />
                                    <Label htmlFor={`post-video-${type}`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 h-full",
                                        formData.postVideoEditingType === type ? 'border-primary bg-accent' : 'border-border'
                                    )}>
                                        {type === 'perHour' ? 'Per Hour' : type === 'perMinute' ? 'Per Finished Minute' : 'Social Media Edit'}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        {formData.postVideoEditingType === 'perHour' && (
                            <div>
                                <Label htmlFor="postVideoEditingHours">Hours (AED 250/hr)</Label>
                                <Input id="postVideoEditingHours" type="number" value={formData.postVideoEditingHours} onChange={(e) => handleInputChange("postVideoEditingHours", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
                            </div>
                        )}
                        {formData.postVideoEditingType === 'perMinute' && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="postVideoEditingMinutes">Finished Minutes</Label>
                                    <Input id="postVideoEditingMinutes" type="number" value={formData.postVideoEditingMinutes} onChange={(e) => handleInputChange("postVideoEditingMinutes", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
                                </div>
                                <div>
                                    <Label>Price Per Minute (AED 500 - 1,500)</Label>
                                    <div className="flex items-center gap-4 mt-2">
                                        <Slider
                                            value={[formData.postVideoEditingPerMinutePrice]}
                                            onValueChange={(v) => handleInputChange('postVideoEditingPerMinutePrice', v[0])}
                                            min={500} max={1500} step={50}
                                        />
                                        <span className="font-semibold w-24 text-center">{formData.postVideoEditingPerMinutePrice.toLocaleString()} AED</span>
                                    </div>
                                </div>
                            </div>
                        )}
                         {formData.postVideoEditingType === 'social' && (
                             <div>
                                <Label>Price for 15-60s Edit (AED 500 - 1,500)</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    <Slider
                                        value={[formData.postVideoEditingSocialPrice]}
                                        onValueChange={(v) => handleInputChange('postVideoEditingSocialPrice', v[0])}
                                        min={500} max={1500} step={50}
                                    />
                                    <span className="font-semibold w-24 text-center">{formData.postVideoEditingSocialPrice.toLocaleString()} AED</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {formData.postSubType === 'photo' && (
                    <div className="pt-4 space-y-4 animate-fade-in-up">
                        <h4 className="font-semibold">Photo Editing Details</h4>
                        <RadioGroup value={formData.postPhotoEditingType} onValueChange={(v) => {
                            const newType = v as keyof typeof photoEditingPrices;
                            handleInputChange('postPhotoEditingType', newType);
                            handleInputChange('postPhotoEditingPrice', photoEditingPrices[newType].min);
                        }} className="grid md:grid-cols-3 gap-4">
                             {Object.entries(photoEditingPrices).map(([type, { label }]) => (
                                 <div key={type}>
                                    <RadioGroupItem value={type} id={`post-photo-${type}`} className="sr-only" />
                                    <Label htmlFor={`post-photo-${type}`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 h-full",
                                        formData.postPhotoEditingType === type ? 'border-primary bg-accent' : 'border-border'
                                    )}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)} Retouching
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                         <div>
                            <Label htmlFor="postPhotoEditingQuantity">Number of Photos</Label>
                            <Input id="postPhotoEditingQuantity" type="number" value={formData.postPhotoEditingQuantity} onChange={(e) => handleInputChange("postPhotoEditingQuantity", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
                        </div>
                        <div>
                            <Label>Price per Photo ({photoPriceConfig.label})</Label>
                            <div className="flex items-center gap-4 mt-2">
                                <Slider
                                    value={[formData.postPhotoEditingPrice]}
                                    onValueChange={(v) => handleInputChange('postPhotoEditingPrice', v[0])}
                                    min={photoPriceConfig.min} max={photoPriceConfig.max} step={5}
                                />
                                <span className="font-semibold w-24 text-center">{formData.postPhotoEditingPrice.toLocaleString()} AED</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    };


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
                        {formData.serviceType === 'video' && renderVideoOptions()}
                        {formData.serviceType === 'timelapse' && renderTimelapseOptions()}
                        {formData.serviceType === '360tours' && render360ToursOptions()}
                        {formData.serviceType === 'post' && renderPostProductionOptions()}
                    </div>
                );
            case 2:
                const needsLocation = formData.serviceType !== 'post';
                const pSubType = formData.photographySubType;
                const vSubType = formData.videoSubType;
                const canHaveSecondCamera = (formData.serviceType === 'photography' && (pSubType === 'event' || pSubType === 'fashion' || pSubType === 'wedding'))
                                         || (formData.serviceType === 'video' && (vSubType === 'event' || vSubType === 'wedding'));
                const isTimelapse = formData.serviceType === 'timelapse';
                const isPostProduction = formData.serviceType === 'post';

                return (
                    <div className="space-y-8 animate-fade-in-up">
                        {needsLocation ? (
                            <>
                                <div>
                                    <Label htmlFor="location" className="font-semibold text-lg">Location</Label>
                                    <Select value={formData.location} onValueChange={(v) => handleInputChange("location", v)}>
                                        <SelectTrigger id="location" className="mt-2">
                                            <SelectValue placeholder="Select a location" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dubai">Dubai</SelectItem>
                                            <SelectItem value="sharjah">Sharjah</SelectItem>
                                            <SelectItem value="abu-dhabi">Abu Dhabi</SelectItem>
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
                            </>
                        ) : (
                            <p className="text-muted-foreground text-center py-10">No location or add-ons required for this service.</p>
                        )}
                        
                        <div className="space-y-6">
                            <h3 className="font-semibold text-lg">Options & Modifiers</h3>
                             <div className="space-y-4">
                                 {canHaveSecondCamera && (
                                    <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.secondCamera ? 'border-primary bg-accent' : 'border-border')}>
                                        <Label htmlFor="secondCamera" className="cursor-pointer flex-grow">Second Camera (+100% of Base Price)</Label>
                                        <Switch id="secondCamera" checked={formData.secondCamera} onCheckedChange={(v) => handleInputChange('secondCamera', v)} />
                                    </div>
                                )}
                                {isTimelapse && (
                                    <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.timelapseExtraCamera ? 'border-primary bg-accent' : 'border-border')}>
                                        <Label htmlFor="timelapseExtraCamera" className="cursor-pointer flex-grow">Extra Camera (+100% of Base Price)</Label>
                                        <Switch id="timelapseExtraCamera" checked={formData.timelapseExtraCamera} onCheckedChange={(v) => handleInputChange('timelapseExtraCamera', v)} />
                                    </div>
                                )}
                                {!isPostProduction && (
                                    <div>
                                        <Label className="font-semibold text-base">Delivery Timeline</Label>
                                        <RadioGroup value={formData.deliveryTimeline} onValueChange={(v) => handleInputChange("deliveryTimeline", v)} className="flex gap-4 mt-2">
                                            {[
                                                { value: 'standard', label: 'Standard Delivery' },
                                                { value: 'rush', label: 'Rush Delivery (24h, +50%)' }
                                            ].map(({ value, label }) => (
                                                <div className="flex-1" key={value}>
                                                    <RadioGroupItem value={value} id={`delivery-${value}`} className="sr-only" />
                                                    <Label htmlFor={`delivery-${value}`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50",
                                                        formData.deliveryTimeline === value ? 'border-primary bg-accent' : 'border-border'
                                                    )}>
                                                        {label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                 )}
                            </div>
                        </div>
                    </div>
                );
            case 3:
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
            case 4:
                return (
                     <div className="printable-area animate-fade-in-up">
                         <div id="quote-preview" className="p-8 bg-card rounded-lg border-2 border-primary/20">
                            {isGeneratingSummary ? (
                                <div className="space-y-6">
                                    <div className="text-center space-y-2">
                                        <Skeleton className="h-8 w-2/3 mx-auto" />
                                        <Skeleton className="h-4 w-3/4 mx-auto" />
                                        <Skeleton className="h-4 w-1/2 mx-auto" />
                                    </div>
                                    <div className="space-y-4">
                                        <Skeleton className="h-6 w-full" />
                                        <Skeleton className="h-6 w-full" />
                                        <Skeleton className="h-6 w-2/3" />
                                    </div>
                                    <Separator />
                                    <Skeleton className="h-8 w-1/2 ml-auto" />
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
                    </div>
                )
            default:
                return null;
        }
    };
    
    const stepTitles = ["Service", "Details", "Contact", "Quote"];

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
                {step < 4 && (
                    <Button onClick={nextStep} size="lg">{step === 3 ? 'See Your Quote' : 'Next'} <ArrowRight className="ml-2 h-5 w-5"/></Button>
                )}
            </CardFooter>
        </Card>
    );
}
