import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { FormData } from './types';
import { photographySubServices } from './types';

type PhotographyOptionsProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
};

export function PhotographyOptions({ formData, handleInputChange }: PhotographyOptionsProps) {
  const isProduct = formData.photographySubType === 'product';
  const isFood = formData.photographySubType === 'food';
  const priceConfig = isProduct ? { min: 100, max: 400 } : { min: 150, max: 400 };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <h3 className="font-semibold mb-4 text-lg">Select Photography Type</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(photographySubServices).map(([id, { name }]) => (
          <Button
            key={id}
            variant="outline"
            size="lg"
            onClick={() => handleInputChange("photographySubType", id)}
            className={cn(
              "h-auto py-4 text-base transition-all hover:bg-accent/50 text-center justify-center",
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
                <Label htmlFor="photoRealEstateProperties">Number of Properties</Label>
                <Input id="photoRealEstateProperties" type="number" value={formData.photoRealEstateProperties} onChange={(e) => handleInputChange("photoRealEstateProperties", Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className="mt-2" />
            </div>
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
            <Label>Number of People</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[formData.photoHeadshotsPeople]}
                onValueChange={(v) => handleInputChange('photoHeadshotsPeople', v[0])}
                min={1}
                max={50}
                step={1}
              />
              <span className="font-semibold w-24 text-center">{formData.photoHeadshotsPeople} people</span>
            </div>
          </div>
        </div>
      )}

      {(isProduct || isFood) && (
        <div className="pt-4 space-y-4 animate-fade-in-up">
          <h4 className="font-semibold">{isProduct ? 'Product' : 'Food'} Photography Details</h4>
          <div className="space-y-4">
            <div>
                <Label>Number of Photos</Label>
                 <div className="flex items-center gap-4 mt-2">
                     <Slider
                        value={[isProduct ? formData.photoProductPhotos : formData.photoFoodPhotos]}
                        onValueChange={(v) => handleInputChange(isProduct ? "photoProductPhotos" : "photoFoodPhotos", v[0])}
                        min={1}
                        max={100}
                        step={1}
                    />
                    <span className="font-semibold w-24 text-center">{isProduct ? formData.photoProductPhotos : formData.photoFoodPhotos} photos</span>
                </div>
            </div>
             <div>
                <Label>Complexity</Label>
                 <RadioGroup
                    value={isProduct ? formData.photoProductComplexity : formData.photoFoodComplexity}
                    onValueChange={(v) => handleInputChange(isProduct ? 'photoProductComplexity' : 'photoFoodComplexity', v)}
                    className="flex gap-4 mt-2"
                >
                    <div className="flex-1">
                        <RadioGroupItem value="simple" id={`${isProduct ? 'prod' : 'food'}-simple`} className="sr-only" />
                        <Label htmlFor={`${isProduct ? 'prod' : 'food'}-simple`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50",
                            (isProduct ? formData.photoProductComplexity : formData.photoFoodComplexity) === 'simple' ? 'border-primary bg-accent' : 'border-border'
                        )}>
                            Simple
                            <span className="text-xs text-muted-foreground">(Basic Lighting)</span>
                            <span className="font-bold text-sm mt-1">AED {priceConfig.min}/photo</span>
                        </Label>
                    </div>
                     <div className="flex-1">
                        <RadioGroupItem value="complex" id={`${isProduct ? 'prod' : 'food'}-complex`} className="sr-only" />
                        <Label htmlFor={`${isProduct ? 'prod' : 'food'}-complex`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50",
                             (isProduct ? formData.photoProductComplexity : formData.photoFoodComplexity) === 'complex' ? 'border-primary bg-accent' : 'border-border'
                        )}>
                            Complex
                            <span className="text-xs text-muted-foreground">(Advanced Styling/Lighting)</span>
                            <span className="font-bold text-sm mt-1">AED {priceConfig.max}/photo</span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>
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
              <span className="font-semibold w-24 text-center">
                {(formData.photographySubType === 'fashion' ? formData.photoFashionPrice : formData.photoWeddingPrice).toLocaleString()} AED
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
