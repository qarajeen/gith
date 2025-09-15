"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { FormData, RealEstateProperty, serviceOptions, photographySubServices, videoSubServices, timelapseSubServices, toursSubServices, postProductionSubServices } from './quote-calculator/types';
import { Step1Service } from "./quote-calculator/step-1-service";
import { Step2Details } from "./quote-calculator/step-2-details";
import { Step3Contact } from "./quote-calculator/step-3-contact";
import { Step4Quote } from "./quote-calculator/step-4-quote";
import { QuoteSummary } from "./quote-calculator/quote-summary";

const initialFormData: FormData = {
    serviceType: "",
    photographySubType: "",
    videoSubType: "",
    timelapseSubType: "",
    toursSubType: "",
    postSubType: '',

    photoEventDuration: "perHour",
    photoEventHours: 1,
    photoRealEstateProperties: [{ id: 1, type: "studio", furnished: false }],
    photoHeadshotsPeople: 1,
    photoProductPhotos: 10,
    photoProductComplexity: 'simple',
    photoFoodPhotos: 10,
    photoFoodComplexity: 'simple',
    photoFashionPackage: 'essential',
    photoWeddingPackage: 'essential',
    
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
};


export function QuoteCalculator() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [aiSummary, setAiSummary] = useState("");
    const [aiProjectTitle, setAiProjectTitle] = useState("");
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [validationError, setValidationError] = useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);
    
    React.useEffect(() => {
        if (validationError) {
            const timer = setTimeout(() => setValidationError(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [validationError]);


    const handleInputChange = useCallback((field: keyof FormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Reset AI summary if selections change
        if (step === 4) {
            setAiSummary("");
            setAiProjectTitle("");
        }
    }, [step]);

    const handleRealEstateChange = useCallback((index: number, field: keyof RealEstateProperty, value: any) => {
        setFormData(prev => {
            const newProperties = [...prev.photoRealEstateProperties];
            newProperties[index] = { ...newProperties[index], [field]: value };
            return { ...prev, photoRealEstateProperties: newProperties };
        });
    }, []);
    
    const addRealEstateProperty = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            photoRealEstateProperties: [
                ...prev.photoRealEstateProperties,
                { id: Date.now(), type: 'studio', furnished: false }
            ]
        }));
    }, []);

    const removeRealEstateProperty = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            photoRealEstateProperties: prev.photoRealEstateProperties.filter((_, i) => i !== index)
        }));
    }, []);

    const handleReset = () => {
        setFormData(initialFormData);
        setAiSummary("");
        setAiProjectTitle("");
        setStep(1);
    };

    const nextStep = () => {
        const triggerValidationError = (message: string, title: string) => {
            toast({ title: title, description: message, variant: "destructive" });
            setValidationError(true);
        };
    
        if (step === 1) {
            if (formData.serviceType === '') {
                triggerValidationError("Please select a service type to continue.", "Service Required");
                return;
            }
            const subTypeFields = {
                photography: 'photographySubType',
                video: 'videoSubType',
                timelapse: 'timelapseSubType',
                '360tours': 'toursSubType',
                post: 'postSubType'
            };
            const subTypeKey = subTypeFields[formData.serviceType as keyof typeof subTypeFields];
            if (subTypeKey && !formData[subTypeKey as keyof FormData]) {
                const serviceName = serviceOptions[formData.serviceType]?.name || "Service";
                triggerValidationError(`Please select a ${serviceName.toLowerCase()} sub-type to continue.`, `${serviceName} Type Required`);
                return;
            }
        }
        if (step === 3) {
            if (!formData.name || !formData.email || !formData.phone) {
                toast({ title: "Missing Information", description: "Please fill out your name, email, and phone number.", variant: "destructive" });
                return;
            }
        }
        if (step === 4) {
            // This would be the submission logic
            console.log("Form Submitted", formData);
        } else {
            setStep((prev) => prev + 1);
        }
    }
    const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

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
                case 'real_estate': {
                    const propPrices = {
                        studio: [500, 800],
                        '1-bedroom': [700, 1100],
                        '2-bedroom': [900, 1400],
                        '3-bedroom': [1100, 1600],
                        villa: [1500, 3000],
                    };
                    let totalRealEstatePrice = 0;
                    const propertyCounts: { [key: string]: { count: number, furnished: number } } = {};
            
                    formData.photoRealEstateProperties.forEach(prop => {
                        const price = propPrices[prop.type][prop.furnished ? 1 : 0];
                        totalRealEstatePrice += price;

                        const key = `${prop.type} (${prop.furnished ? 'Furnished' : 'Unfurnished'})`;
                        if (!propertyCounts[key]) {
                            propertyCounts[key] = { count: 0, furnished: prop.furnished ? 1 : 0 };
                        }
                        propertyCounts[key].count++;
                    });
            
                    basePrice = totalRealEstatePrice;
                    const summary = Object.entries(propertyCounts)
                        .map(([desc, { count }]) => `${count} x ${desc.replace(/\b\w/g, l => l.toUpperCase())}`)
                        .join(', ');
                    itemName += ` (${summary})`;
                    break;
                }
                case 'headshots':
                    basePrice = formData.photoHeadshotsPeople * 350;
                    itemName += ` (${formData.photoHeadshotsPeople} people)`;
                    break;
                case 'product':
                    const productPricePerPhoto = formData.photoProductComplexity === 'simple' ? 100 : 400;
                    basePrice = formData.photoProductPhotos * productPricePerPhoto;
                    itemName += ` (${formData.photoProductPhotos} photos @ ${productPricePerPhoto} AED/photo, ${formData.photoProductComplexity})`;
                    break;
                case 'food':
                    const foodPricePerPhoto = formData.photoFoodComplexity === 'simple' ? 150 : 400;
                    basePrice = formData.photoFoodPhotos * foodPricePerPhoto;
                    itemName += ` (${formData.photoFoodPhotos} photos @ ${foodPricePerPhoto} AED/photo, ${formData.photoFoodComplexity})`;
                    break;
                case 'fashion':
                    const fashionPrices = { essential: 1500, standard: 3000, premium: 5000 };
                    basePrice = fashionPrices[formData.photoFashionPackage];
                    itemName += ` (${formData.photoFashionPackage.charAt(0).toUpperCase() + formData.photoFashionPackage.slice(1)} Package)`;
                    break;
                case 'wedding':
                    const weddingPrices = { essential: 5000, standard: 12000, premium: 25000 };
                    basePrice = weddingPrices[formData.photoWeddingPackage];
                    itemName += ` (${formData.photoWeddingPackage.charAt(0).toUpperCase() + formData.photoWeddingPackage.slice(1)} Package)`;
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
                    itemName += ` (${formData.videoRealEstatePropertyType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())})`;
                    break;
                case 'wedding':
                    basePrice = formData.videoWeddingPrice;
                    itemName += ' (Package)';
                    break;
            }
        } else if (formData.serviceType === 'timelapse' && formData.timelapseSubType) {
            const subTypeName = timelapseSubServices[formData.timelapseSubType].name;
            itemName = `${serviceName}: ${subTypeName}`;
            const prices = { short: 3000, long: 6000, extreme: 15000 };
            basePrice = prices[formData.timelapseSubType];
        } else if (formData.serviceType === '360tours' && formData.toursSubType) {
            const subTypeName = toursSubServices[formData.toursSubType].name;
            itemName = `${serviceName}: ${subTypeName}`;
            const prices = { studio: 750, '1-bedroom': 1000, '2-bedroom': 1350, '3-bedroom': 1750, 'villa': 3000 };
            basePrice = prices[formData.toursSubType as keyof typeof prices];
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
        if (basePrice > 0) {
            items.push({ name: itemName, price: basePrice });
        }
        
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
                if (formData.videoPromoFullDay) { subtotal += 5000; items.push({ name: 'Additional Full-Day Production', price: 5000 }); }
                if (formData.videoPromoMultiLoc > 0) { subtotal += formData.videoPromoMultiLoc * 2000; items.push({ name: `Additional Locations (x${formData.videoPromoMultiLoc})`, price: formData.videoPromoMultiLoc * 2000 }); }
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

        // Studio Rental Fee
        if (formData.locationType === 'Studio' && formData.serviceType !== 'post') {
            let studioFee = 0;
            let studioItemName = 'Studio Rental';
            let duration = '';
            
            if (formData.serviceType === 'photography' && formData.photographySubType === 'event') {
                duration = formData.photoEventDuration;
            } else if (formData.serviceType === 'video' && formData.videoSubType === 'event') {
                duration = formData.videoEventDuration;
            }

            switch(duration) {
                case 'perHour':
                    const hours = formData.serviceType === 'photography' ? formData.photoEventHours : formData.videoEventHours;
                    studioFee = hours * 700;
                    studioItemName += ` (${hours} hrs)`;
                    break;
                case 'halfDay':
                    studioFee = 2000;
                    studioItemName += ' (Half Day)';
                    break;
                case 'fullDay':
                    studioFee = 3000;
                    studioItemName += ' (Full Day)';
                    break;
            }

            if (studioFee > 0) {
                items.push({ name: studioItemName, price: studioFee });
                total += studioFee;
            }
        }


        // Universal Modifiers
        const travelFees: { [key: string]: number } = {
            dubai: 0,
            sharjah: 100,
            'abu-dhabi': 200,
            other: 200,
        };
        const travelFee = travelFees[formData.location] || 0;
        if (travelFee > 0 && formData.serviceType !== 'post') {
            items.push({ name: `Logistics & Travel Fee (${formData.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())})`, price: travelFee });
            total += travelFee;
        }

        if (formData.deliveryTimeline === 'rush' && formData.serviceType !== 'post') {
            const rushFee = subtotal * 0.5;
            if (rushFee > 0) {
              items.push({ name: 'Rush Delivery (24 hours)', price: rushFee });
              total += rushFee;
            }
        }

        return { items, total };
    }, [formData]);

    const handlePrint = () => {
        const input = document.getElementById('quote-preview');
        if (input) {
            const pdfQuote = document.getElementById('pdf-quote-preview-container');
            if (pdfQuote) {
                pdfQuote.classList.remove('hidden');
                pdfQuote.classList.add('block');
            }

            html2canvas(document.getElementById('pdf-quote-preview')!, { scale: 1, backgroundColor: '#ffffff', windowWidth: 1200 }).then((canvas) => {
                if (pdfQuote) {
                    pdfQuote.classList.remove('block');
                    pdfQuote.classList.add('hidden');
                }

                const imgData = canvas.toDataURL('image/jpeg', 0.8);
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                let width = pdfWidth;
                let height = width / ratio;

                if (height > pdfHeight) {
                    height = pdfHeight;
                    width = height * ratio;
                }

                const x = (pdfWidth - width) / 2;
                const y = 0;

                pdf.addImage(imgData, 'JPEG', x, y, width, height);
                pdf.save("wrh-enigma-quote.pdf");
            });
        }
    };
    
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Step1Service
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleRealEstateChange={handleRealEstateChange}
                        addRealEstateProperty={addRealEstateProperty}
                        removeRealEstateProperty={removeRealEstateProperty}
                        validationError={validationError}
                    />
                );
            case 2:
                return (
                    <Step2Details
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                );
            case 3:
                return (
                     <Step3Contact
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                );
            case 4:
                return (
                     <Step4Quote
                        formData={formData}
                        quoteDetails={quoteDetails}
                        handlePrint={handlePrint}
                        aiProjectTitle={aiProjectTitle}
                        setAiProjectTitle={setAiProjectTitle}
                        aiSummary={aiSummary}
                        setAiSummary={setAiSummary}
                        isGeneratingSummary={isGeneratingSummary}
                        setIsGeneratingSummary={setIsGeneratingSummary}
                    />
                )
            default:
                return null;
        }
    };
    
    const stepTitles = ["Service", "Details", "Contact", "Quote"];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 w-full">
            <Card className="w-full bg-card/80 backdrop-blur-sm border-white/10 relative">
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
                                        `mt-2 text-xs md:text-sm font-medium transition-colors hidden md:block`,
                                        index + 1 <= step ? 'text-primary-foreground' : 'text-muted-foreground'
                                    )}>{title}</p>
                                </div>
                                {index < stepTitles.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${index + 1 < step ? 'bg-primary' : 'bg-border'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-bold text-center pt-8">{step === 4 ? 'Your Quote is Ready' : `Step ${step}: ${stepTitles[step-1]}`}</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[350px] sm:pb-6">
                    {renderStep()}
                </CardContent>
                {step > 1 && (
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 fixed bottom-0 left-0 w-full bg-card border-t border-border p-4 sm:static sm:border-t-0 sm:p-6 sm:bg-transparent z-10">
                        <div className="flex gap-2 w-full sm:w-auto">
                            {step > 1 && (
                                <Button variant="outline" onClick={prevStep} size="lg" className="w-full sm:w-auto"><ArrowLeft className="mr-2 h-5 w-5"/> Previous</Button>
                            )}
                            {step > 1 && step < 4 && (
                                <Button variant="ghost" onClick={handleReset} size="lg" className="text-muted-foreground"><RotateCcw className="mr-2 h-5 w-5" /> Reset</Button>
                            )}
                        </div>
        
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            {step < 4 ? (
                                <Button onClick={nextStep} size="lg" className="w-full sm:w-auto">{step === 3 ? 'See Your Quote' : 'Next'} <ArrowRight className="ml-2 h-5 w-5"/></Button>
                            ) : (
                                <Button onClick={handleReset} size="lg" className="w-full sm:w-auto"><RotateCcw className="mr-2 h-5 w-5" /> Start New Quote</Button>
                            )}
                        </div>
                    </CardFooter>
                )}
            </Card>
        </div>
        <div className="hidden lg:block lg:col-span-1">
            <QuoteSummary quoteDetails={quoteDetails} formData={formData} />
        </div>
      </div>
    );
}
