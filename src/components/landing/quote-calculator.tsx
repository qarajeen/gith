"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download } from "lucide-react";

const serviceOptions = {
  video: { name: "Video Production", price: 5000 },
  photo: { name: "Photography", price: 2500 },
  branding: { name: "Branding & Design", price: 3000 },
  motion: { name: "Motion Graphics", price: 4000 },
};

const videoAddons = {
  drone: { name: "Drone Footage", price: 1500 },
  "4k": { name: "4K Delivery", price: 1000 },
  script: { name: "Scriptwriting", price: 800 },
};

const photoAddons = {
  studio: { name: "Studio Rental", price: 1000 },
  retouching: { name: "Advanced Retouching", price: 500 },
};

type SelectedItems = {
  [key: string]: boolean;
};

export function QuoteCalculator() {
  const [selectedServices, setSelectedServices] = useState<SelectedItems>({ video: true });
  const [selectedVideoAddons, setSelectedVideoAddons] = useState<SelectedItems>({});
  const [selectedPhotoAddons, setSelectedPhotoAddons] = useState<SelectedItems>({});

  const handleServiceChange = (serviceId: string) => {
    setSelectedServices((prev) => ({ ...prev, [serviceId]: !prev[serviceId] }));
  };

  const handleVideoAddonChange = (addonId: string) => {
    setSelectedVideoAddons((prev) => ({ ...prev, [addonId]: !prev[addonId] }));
  };

  const handlePhotoAddonChange = (addonId: string) => {
    setSelectedPhotoAddons((prev) => ({ ...prev, [addonId]: !prev[addonId] }));
  };

  const quoteDetails = useMemo(() => {
    let total = 0;
    const items: { name: string; price: number }[] = [];

    Object.keys(selectedServices).forEach((serviceId) => {
      if (selectedServices[serviceId]) {
        const service = serviceOptions[serviceId as keyof typeof serviceOptions];
        items.push(service);
        total += service.price;
      }
    });

    if (selectedServices.video) {
        Object.keys(selectedVideoAddons).forEach((addonId) => {
            if (selectedVideoAddons[addonId]) {
                const addon = videoAddons[addonId as keyof typeof videoAddons];
                items.push(addon);
                total += addon.price;
            }
        });
    }

    if (selectedServices.photo) {
        Object.keys(selectedPhotoAddons).forEach((addonId) => {
            if (selectedPhotoAddons[addonId]) {
                const addon = photoAddons[addonId as keyof typeof photoAddons];
                items.push(addon);
                total += addon.price;
            }
        });
    }

    return { items, total };
  }, [selectedServices, selectedVideoAddons, selectedPhotoAddons]);
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="quote" className="container py-20 md:py-32">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-headline">Instant Quote</h2>
        <p className="mt-4 text-lg text-foreground/80">
          Select services to build your project quote.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <Card className="bg-card border-border/60">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Configure Your Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h3 className="font-semibold mb-4 text-lg">Core Services</h3>
              <div className="space-y-4">
                {Object.entries(serviceOptions).map(([id, { name, price }]) => (
                  <div key={id} className="flex items-center p-4 rounded-md border border-input bg-background/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary/30 transition-colors">
                    <Checkbox
                      id={id}
                      checked={selectedServices[id] || false}
                      onCheckedChange={() => handleServiceChange(id)}
                    />
                    <Label htmlFor={id} className="flex-1 cursor-pointer ml-4">
                      <div className="flex justify-between">
                        <span>{name}</span>
                        <span className="text-foreground/70">{price.toLocaleString()} AED</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            {selectedServices.video && (
            <div>
                <h3 className="font-semibold mb-4 text-lg">Video Add-ons</h3>
                <div className="space-y-4">
                    {Object.entries(videoAddons).map(([id, { name, price }]) => (
                        <div key={id} className="flex items-center p-4 rounded-md border border-input bg-background/50 has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent/10 transition-colors">
                            <Checkbox id={`vid-${id}`} checked={selectedVideoAddons[id] || false} onCheckedChange={() => handleVideoAddonChange(id)} />
                            <Label htmlFor={`vid-${id}`} className="flex-1 cursor-pointer ml-4 flex justify-between">
                                <span>{name}</span>
                                <span className="text-foreground/70">+{price.toLocaleString()} AED</span>
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
            )}
            
            {selectedServices.photo && (
            <div>
                <h3 className="font-semibold mb-4 text-lg">Photography Add-ons</h3>
                <div className="space-y-4">
                    {Object.entries(photoAddons).map(([id, { name, price }]) => (
                         <div key={id} className="flex items-center p-4 rounded-md border border-input bg-background/50 has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent/10 transition-colors">
                            <Checkbox id={`pho-${id}`} checked={selectedPhotoAddons[id] || false} onCheckedChange={() => handlePhotoAddonChange(id)} />
                            <Label htmlFor={`pho-${id}`} className="flex-1 cursor-pointer ml-4 flex justify-between">
                                <span>{name}</span>
                                <span className="text-foreground/70">+{price.toLocaleString()} AED</span>
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
            )}
          </CardContent>
        </Card>

        <div className="sticky top-24 self-start">
            <Card className="bg-card border-border/60" id="quote-preview">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Quote Preview</CardTitle>
                <CardDescription>Your estimated project cost.</CardDescription>
            </CardHeader>
            <CardContent>
                {quoteDetails.items.length > 0 ? (
                    <div className="space-y-4">
                    {quoteDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>{item.price.toLocaleString()} AED</span>
                        </div>
                    ))}
                    <Separator className="my-4" />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total Estimate</span>
                        <span>{quoteDetails.total.toLocaleString()} AED</span>
                    </div>
                    </div>
                ) : (
                    <p className="text-foreground/70 text-center py-8">Select a service to see your quote.</p>
                )}
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handlePrint} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Download className="mr-2 h-4 w-4" />
                    Download as PDF
                </Button>
            </CardFooter>
            </Card>
        </div>
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #quote-preview, #quote-preview * {
            visibility: visible;
          }
          #quote-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          #quote-preview button {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
