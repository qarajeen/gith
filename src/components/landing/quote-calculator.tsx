"use client";

import * as React from "react";
import { useState, useMemo } from "react";
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

const serviceOptions = {
    photography: { name: "Photography", basePrice: 150, perHour: 150, perProject: 1500, icon: <Camera className="w-8 h-8 mb-2" /> },
    video: { name: "Video Production", basePrice: 300, perHour: 300, perProject: 3000, icon: <Video className="w-8 h-8 mb-2" /> },
    post: { name: "Post Production", basePrice: 100, perHour: 100, perProject: 1000, icon: <Wand2 className="w-8 h-8 mb-2" /> },
    '360tours': { name: "360 Tours", basePrice: 400, perHour: 400, perProject: 4000, icon: <Orbit className="w-8 h-8 mb-2" /> },
    timelapse: { name: "Time Lapse", basePrice: 250, perHour: 250, perProject: 2500, icon: <Hourglass className="w-8 h-8 mb-2" /> },
};

const locationTypeOptions = ["Indoor", "Outdoor", "Studio", "Exhibition Center", "Hotel", "Other"];

const addonOptions = {
    additionalHours: { name: "Additional Hours", price: 100, type: 'perUnit' },
    additionalCamera: { name: "Additional Camera", price: 500, type: 'perUnit' },
    drone: { name: "Drone Footage", price: 1500, type: 'toggle' },
    script: { name: "Scriptwriting", price: 800, type: 'toggle' },
    studio: { name: "Studio Rental", price: 1000, type: 'toggle' },
};

type FormData = {
    serviceType: keyof typeof serviceOptions;
    packageType: "perHour" | "perProject";
    hours: number;
    location: string;
    locationType: string;
    additionalHours: number;
    additionalCamera: number;
    drone: boolean;
    script: boolean;
    studio: boolean;
    name: string;
    email: string;
    message: string;
};

export function QuoteCalculator() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        serviceType: "photography",
        packageType: "perHour",
        hours: 1,
        location: "dubai",
        locationType: "Indoor",
        additionalHours: 0,
        additionalCamera: 0,
        drone: false,
        script: false,
        studio: false,
        name: "",
        email: "",
        message: "",
    });

    const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setStep((prev) => (prev < 5 ? prev + 1 : prev));
    const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));
    
    const quoteDetails = useMemo(() => {
        let total = 0;
        const items: { name: string; price: number | string }[] = [];
        const selectedService = serviceOptions[formData.serviceType];

        items.push({ name: `${selectedService.name} (${formData.packageType === 'perHour' ? `${formData.hours} ${formData.hours > 1 ? 'hrs' : 'hr'}` : 'Project'})`, price: 0 });

        if (formData.packageType === 'perHour') {
            total += selectedService.perHour * formData.hours;
            items[0].price = total;
        } else {
            total += selectedService.perProject;
            items[0].price = total;
        }

        if (formData.additionalHours > 0) {
            const price = formData.additionalHours * addonOptions.additionalHours.price;
            items.push({ name: `Additional Hours (x${formData.additionalHours})`, price });
            total += price;
        }
        if (formData.additionalCamera > 0) {
            const price = formData.additionalCamera * addonOptions.additionalCamera.price;
            items.push({ name: `Additional Camera (x${formData.additionalCamera})`, price });
            total += price;
        }
        if (formData.drone) {
            items.push({ name: "Drone Footage", price: addonOptions.drone.price });
            total += addonOptions.drone.price;
        }
        if (formData.script) {
            items.push({ name: "Scriptwriting", price: addonOptions.script.price });
            total += addonOptions.script.price;
        }
        if (formData.studio) {
            items.push({ name: "Studio Rental", price: addonOptions.studio.price });
            total += addonOptions.studio.price;
        }

        return { items, total };
    }, [formData]);

    const handlePrint = () => {
        const input = document.getElementById('quote-preview');
        if (input) {
            html2canvas(input, { scale: 2 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / canvasHeight;
                const width = pdfWidth - 20;
                const height = width / ratio;
                pdf.addImage(imgData, 'PNG', 10, 10, width, height);
                pdf.save("quote.pdf");
            });
        }
    };
    
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8">
                        <div>
                            <h3 className="font-semibold mb-4 text-lg">Select Service Type</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(serviceOptions).map(([id, { name, icon }]) => (
                                    <div key={id} onClick={() => handleInputChange("serviceType", id)}
                                         className={cn("p-4 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center",
                                         formData.serviceType === id ? 'border-primary bg-accent text-accent-foreground' : 'border-muted bg-popover hover:border-primary/50')}>
                                        {icon}
                                        <span className="font-medium text-center">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4 text-lg">Select Package</h3>
                            <RadioGroup value={formData.packageType} onValueChange={(v) => handleInputChange("packageType", v as "perHour" | "perProject")} className="flex gap-4">
                                <div className="flex-1">
                                    <RadioGroupItem value="perHour" id="perHour" className="sr-only" />
                                    <Label htmlFor="perHour" className={cn("flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer w-full transition-colors",
                                        formData.packageType === 'perHour' ? 'border-primary bg-accent text-accent-foreground' : 'border-muted bg-popover hover:border-primary/50'
                                    )}>
                                        Per Hour
                                    </Label>
                                </div>
                                <div className="flex-1">
                                    <RadioGroupItem value="perProject" id="perProject" className="sr-only" />
                                    <Label htmlFor="perProject" className={cn("flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer w-full transition-colors",
                                        formData.packageType === 'perProject' ? 'border-primary bg-accent text-accent-foreground' : 'border-muted bg-popover hover:border-primary/50'
                                    )}>
                                        Per Project
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                         {formData.packageType === 'perHour' && (
                            <div>
                                <Label htmlFor="hours" className="font-semibold text-lg">Hours</Label>
                                <Input id="hours" type="number" value={formData.hours} onChange={(e) => handleInputChange("hours", parseInt(e.target.value, 10) || 1)} min="1" className="mt-2" />
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8">
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
                                        className={cn("h-auto py-4",
                                            formData.locationType === type ? 'border-primary bg-accent text-accent-foreground' : 'border-muted bg-popover hover:border-primary/50'
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
                return (
                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg">Add-ons</h3>
                        <div className="space-y-4">
                            <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.additionalHours > 0 ? 'border-primary bg-accent/50' : 'border-muted')}>
                                <Label htmlFor="additionalHours">Additional Hours</Label>
                                <Input id="additionalHours" type="number" value={formData.additionalHours} onChange={(e) => handleInputChange("additionalHours", parseInt(e.target.value, 10) || 0)} min="0" className="w-24 text-center" />
                            </div>
                            <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.additionalCamera > 0 ? 'border-primary bg-accent/50' : 'border-muted')}>
                                <Label htmlFor="additionalCamera">Additional Cameras</Label>
                                <Input id="additionalCamera" type="number" value={formData.additionalCamera} onChange={(e) => handleInputChange("additionalCamera", parseInt(e.target.value, 10) || 0)} min="0" className="w-24 text-center" />
                            </div>
                            <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.drone ? 'border-primary bg-accent/50' : 'border-muted')}>
                                <Label htmlFor="drone" className="cursor-pointer">Drone Footage</Label>
                                <Switch id="drone" checked={formData.drone} onCheckedChange={(v) => handleInputChange('drone', v)} />
                            </div>
                             <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.script ? 'border-primary bg-accent/50' : 'border-muted')}>
                                <Label htmlFor="script" className="cursor-pointer">Scriptwriting</Label>
                                <Switch id="script" checked={formData.script} onCheckedChange={(v) => handleInputChange('script', v)} />
                            </div>
                             <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.studio ? 'border-primary bg-accent/50' : 'border-muted')}>
                                 <Label htmlFor="studio" className="cursor-pointer">Studio Rental</Label>
                                <Switch id="studio" checked={formData.studio} onCheckedChange={(v) => handleInputChange('studio', v)} />
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                     <div className="space-y-4">
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
                            <Label htmlFor="message">Message (Optional)</Label>
                            <Textarea id="message" placeholder="Tell us more about your project..." value={formData.message} onChange={(e) => handleInputChange("message", e.target.value)} />
                        </div>
                    </div>
                );
            case 5:
                return (
                     <div className="printable-area">
                         <div id="quote-preview" className="p-6 bg-background rounded-lg">
                            <CardTitle className="font-headline text-2xl text-center pb-4">Your Quote</CardTitle>
                             <CardDescription className="text-center">Your estimated project cost.</CardDescription>
                             <div className="mt-4 space-y-4">
                                {quoteDetails.items.map((item, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span>{item.name}</span>
                                        <span>{typeof item.price === 'number' ? `${item.price.toLocaleString()} AED` : item.price}</span>
                                    </div>
                                ))}
                                <Separator className="my-4" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total Estimate</span>
                                    <span>{quoteDetails.total.toLocaleString()} AED</span>
                                </div>
                            </div>
                        </div>
                         <div className="flex justify-end mt-6 gap-2">
                            <Button onClick={handlePrint} variant="outline" className="w-full">
                                <Download className="mr-2 h-4 w-4" />
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
        <Card className="max-w-4xl mx-auto w-full bg-card border-border/60">
            <CardHeader>
                <div className="flex justify-center items-center mb-4">
                    {stepTitles.map((title, index) => (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index + 1 <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                    {index + 1}
                                </div>
                                <p className={`mt-2 text-sm font-medium ${index + 1 <= step ? 'text-primary' : 'text-muted-foreground'}`}>{title}</p>
                            </div>
                            {index < stepTitles.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 ${index + 1 < step ? 'bg-primary' : 'bg-muted'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
                 <CardTitle className="font-headline text-2xl text-center pt-4">{stepTitles[step-1]}</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[300px]">
                {renderStep()}
            </CardContent>
            <CardFooter className="flex justify-between">
                {step > 1 ? (
                    <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4"/> Previous</Button>
                ) : <div />}
                {step < 5 && (
                    <Button onClick={nextStep}>{step === 4 ? 'See Your Quote' : 'Next'} <ArrowRight className="ml-2 h-4 w-4"/></Button>
                )}
            </CardFooter>
        </Card>
    );
}
