"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import jsPDF from "jspdf";
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
    }, []);

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
                        if (formData.photoEventHours > 0) {
                            basePrice = 600 + (formData.photoEventHours - 1) * 300;
                        } else {
                            basePrice = 0;
                        }
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
                        if (formData.videoEventHours > 0) {
                            basePrice = 800 + (formData.videoEventHours - 1) * 400;
                        } else {
                            basePrice = 0;
                        }
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
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let currentY = 0;
    
        // 1. PASTE YOUR BASE64 STRING HERE
        const logoDataUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6CAYAAACI7Fo9AAAACXBIWXMAAAdiAAAHYgE4epnbAAAExWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTA5LTEyPC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPjk0ODg4NTJiLTUyZjMtNGNhNS1iYjJjLTE1NzFkMzE1YTc0YzwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5Zb3VyIHBhcmFncmFwaCB0ZXh0IC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3Jp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";

        // Colors
        const primaryColor = [48, 25, 52]; // Deep dark purple
        const lightGray = [248, 248, 250];
        const darkGray = [100, 100, 100];
        const black = [0, 0, 0];
    
        // -- Header --
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);

        // 2. ADD LOGO IMAGE
        if (logoDataUri) {
            const imgProps = doc.getImageProperties(logoDataUri);
            const imgWidth = 20; // Adjust width as needed
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            doc.addImage(logoDataUri, 'PNG', margin, (30 - imgHeight) / 2, imgWidth, imgHeight);
        }
        
        // Adjust text position if logo is present
        const textX = logoDataUri ? margin + 25 : margin;
        
        doc.setFont('helvetica', 'bold');
        doc.setCharacterSpace(1.5);
        doc.text("WRH", textX, 18);
        
        const wrhWidth = doc.getTextWidth("WRH");
        doc.setCharacterSpace(0);
        doc.setFont('helvetica', 'normal');
        doc.text("Production", textX + wrhWidth, 18);
    
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("QUOTE", pageWidth - margin, 18, { align: 'right' });
        currentY = 45;

        // --- Heading Title & Project Brief ---
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(black[0], black[1], black[2]);
        const serviceName = formData.serviceType ? serviceOptions[formData.serviceType].name : 'Project';
        const subTypeKey = formData.photographySubType || formData.videoSubType || formData.timelapseSubType || formData.toursSubType || formData.postSubType;
        
        let subTypeName = '';
        if(formData.serviceType === 'photography' && formData.photographySubType) subTypeName = photographySubServices[formData.photographySubType].name;
        else if (formData.serviceType === 'video' && formData.videoSubType) subTypeName = videoSubServices[formData.videoSubType].name;
        else if (formData.serviceType === 'timelapse' && formData.timelapseSubType) subTypeName = timelapseSubServices[formData.timelapseSubType].name;
        else if (formData.serviceType === '360tours' && formData.toursSubType) subTypeName = toursSubServices[formData.toursSubType].name;
        else if (formData.serviceType === 'post' && formData.postSubType) subTypeName = postProductionSubServices[formData.postSubType].name;

        const headingTitle = subTypeName ? `${serviceName}: ${subTypeName}` : serviceName;
        doc.text(headingTitle, margin, currentY);
        currentY += 10;
        
        if (formData.message) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
            const briefLines = doc.splitTextToSize(formData.message, pageWidth - (margin * 2));
            doc.text("Project Brief:", margin, currentY);
            currentY += 6;
            doc.text(briefLines, margin, currentY);
            currentY += (briefLines.length * 5) + 5;
        }

        // -- Client & Quote Info --
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(black[0], black[1], black[2]);
        doc.text("BILLED TO", margin, currentY);
    
        const quoteDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const quoteInfoX = pageWidth / 2 + 10;
        doc.text("QUOTE #", quoteInfoX, currentY);
        doc.text("DATE", quoteInfoX, currentY + 7);
    
        doc.setFont('helvetica', 'normal');
        if (formData.name) doc.text(formData.name, margin, currentY + 7);
        if (formData.email) doc.text(formData.email, margin, currentY + 14);
        if (formData.phone) doc.text(formData.phone, margin, currentY + 21);
    
        doc.text("001", quoteInfoX + 30, currentY);
        doc.text(quoteDate, quoteInfoX + 30, currentY + 7);
    
        currentY += 35;
    
        // -- Table Header --
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 10, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.text('DESCRIPTION', margin + 5, currentY + 7);
        doc.text('AMOUNT', pageWidth - margin - 5, currentY + 7, { align: 'right' });
        currentY += 15;
    
        // -- Table Items --
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(black[0], black[1], black[2]);
        quoteDetails.items.forEach(item => {
            if (currentY > pageHeight - 80) { // Check for footer space
                doc.addPage();
                currentY = margin;
            }
            const price = typeof item.price === 'number' ? `${item.price.toLocaleString()} AED` : item.price;
            const itemLines = doc.splitTextToSize(item.name, (pageWidth / 2));
            doc.text(itemLines, margin + 5, currentY);
            doc.text(price, pageWidth - margin - 5, currentY, { align: 'right' });
            currentY += (itemLines.length * 5) + 5;
        });
    
        // -- Total Section --
        const totalSectionY = Math.max(currentY + 10, pageHeight - 80);
        if (totalSectionY > pageHeight - 80) {
            doc.addPage();
            currentY = margin;
        }

        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(pageWidth / 2, totalSectionY, pageWidth / 2, 20, 'F');
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(black[0], black[1], black[2]);
        doc.text('Total Estimate', pageWidth / 2 + 10, totalSectionY + 13);
        doc.text(`${quoteDetails.total.toLocaleString()} AED`, pageWidth - margin, totalSectionY + 13, { align: 'right' });
    
        // -- Footer --
        const footerY = pageHeight - 25;
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, footerY, pageWidth, 25, 'F');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('Terms & Conditions', margin, footerY + 8);
        doc.text('Contact', pageWidth - margin, footerY + 8, { align: 'right' });
    
        doc.setFont('helvetica', 'normal');
        doc.text('50% advance payment required to confirm the booking. Quote valid for 30 days.', margin, footerY + 15);
        doc.text('hi@wrh.ae | +971586583939', pageWidth - margin, footerY + 15, { align: 'right' });
    
        doc.save("wrh quote.pdf");
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
                {(step > 1 || (step === 1 && formData.serviceType)) && (
                    <CardFooter className="flex items-center justify-between gap-4 p-6 bg-transparent">
                        <div className="hidden sm:flex gap-2 w-full sm:w-auto">
                            {step > 1 && (
                                <Button variant="outline" onClick={prevStep} size="lg" className="w-full sm:w-auto"><ArrowLeft className="mr-2 h-5 w-5"/> Previous</Button>
                            )}
                            {step > 1 && step < 4 && (
                                <Button variant="ghost" onClick={handleReset} size="lg" className="text-muted-foreground"><RotateCcw className="mr-2 h-5 w-5" /> Reset</Button>
                            )}
                        </div>
        
                        <div className="fixed bottom-0 left-0 right-0 p-4 sm:static sm:p-0 flex items-center justify-center gap-2 w-full sm:w-auto z-20">
                             {step > 1 && (
                                <Button variant="outline" onClick={prevStep} size="lg" className="flex-1 sm:hidden shadow-lg"><ArrowLeft className="mr-2 h-5 w-5"/> Back</Button>
                            )}
                            {step < 4 ? (
                                <Button onClick={nextStep} size="lg" className={cn("btn-glow-primary sm:w-auto shadow-lg sm:shadow-none flex-1", step === 1 && 'sm:ml-auto')}>{step === 3 ? 'See Your Quote' : 'Next'} <ArrowRight className="ml-2 h-5 w-5"/></Button>
                            ) : (
                                <Button onClick={handleReset} size="lg" className="w-full sm:w-auto shadow-lg sm:shadow-none"><RotateCcw className="mr-2 h-5 w-5" /> Start New Quote</Button>
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

    