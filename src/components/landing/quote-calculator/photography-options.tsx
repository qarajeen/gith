import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { FormData, RealEstateProperty } from './types';
import { photographySubServices } from './types';
import { PlusCircle, XCircle, Minus, Plus } from 'lucide-react';

type PhotographyOptionsProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
  handleRealEstateChange: (index: number, field: keyof RealEstateProperty, value: any) => void;
  addRealEstateProperty: () => void;
  removeRealEstateProperty: (index: number) => void;
  validationError: boolean;
};

export function PhotographyOptions({ 
    formData, 
    handleInputChange, 
    handleRealEstateChange,
    addRealEstateProperty,
    removeRealEstateProperty,
    validationError
}: PhotographyOptionsProps) {
  const isProduct = formData.photographySubType === 'product';
  const isFood = formData.photographySubType === 'food';
  const priceConfig = isProduct ? { min: 100, max: 400 } : { min: 150, max: 400 };

  const fashionPackages = {
    essential: { name: "Essential", price: "1,500 AED", description: "Half-day shoot, 1 location, basic edits." },
    standard: { name: "Standard", price: "3,000 AED", description: "Full-day shoot, 2 locations, advanced edits." },
    premium: { name: "Premium", price: "5,000 AED", description: "Full-day shoot, multiple locations, professional styling." },
  };

  const weddingPackages = {
    essential: { name: "Essential", price: "5,000 AED", description: "4 hours coverage, 1 photographer, edited photos." },
    standard: { name: "Standard", price: "12,000 AED", description: "8 hours coverage, 2 photographers, photo album." },
    premium: { name: "Premium", price: "25,000 AED", description: "Full-day coverage, video highlights, premium album." },
  };
  
  const sliderProps = {
    headshots: { field: 'photoHeadshotsPeople' as const, min: 1, max: 50, step: 1, unit: 'people' },
    product: { field: 'photoProductPhotos' as const, min: 1, max: 100, step: 1, unit: 'photos' },
    food: { field: 'photoFoodPhotos' as const, min: 1, max: 100, step: 1, unit: 'photos' },
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
       <div className={cn("p-4 border-2 rounded-lg transition-all card-glowing", validationError ? 'border-destructive' : 'border-transparent')}>
        <h3 className="font-semibold mb-4 text-lg">Select Photography Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(photographySubServices).map(([id, { name }]) => (
            <Button
                key={id}
                variant="outline"
                size="lg"
                onClick={() => handleInputChange("photographySubType", id)}
                className={cn(
                "h-auto min-h-[6rem] py-4 text-base transition-all hover:bg-accent/50 text-center justify-center whitespace-normal",
                formData.photographySubType === id ? 'border-primary bg-accent' : 'border-border'
                )}
            >
                {name}
            </Button>
            ))}
        </div>
      </div>

      {formData.photographySubType === 'event' && (
        <div className="pt-4 space-y-4 animate-fade-in-up">
          <h4 className="font-semibold">Event Details</h4>
          <RadioGroup value={formData.photoEventDuration} onValueChange={(v) => handleInputChange("photoEventDuration", v)} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['perHour', 'halfDay', 'fullDay'].map(dur => (
              <div className="flex-1" key={dur}>
                <RadioGroupItem value={dur} id={`photo-event-${dur}`} className="sr-only" />
                <Label htmlFor={`photo-event-${dur}`} className={cn("flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 text-base py-4",
                  formData.photoEventDuration === dur ? 'border-primary bg-accent' : 'border-border'
                )}>
                  {dur === 'perHour' ? 'Per Hour' : dur === 'halfDay' ? 'Half Day (4hrs)' : 'Full Day (8hrs)'}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {formData.photoEventDuration === 'perHour' && (
            <div>
              <Label>Hours</Label>
              <div className="flex items-center gap-4 mt-2">
                <Button variant="outline" size="icon" onClick={() => handleInputChange('photoEventHours', Math.max(1, formData.photoEventHours - 1))}><Minus /></Button>
                <Slider
                  value={[formData.photoEventHours]}
                  onValueChange={(v) => handleInputChange('photoEventHours', v[0])}
                  min={1}
                  max={24}
                  step={1}
                  className='flex-1'
                />
                <Button variant="outline" size="icon" onClick={() => handleInputChange('photoEventHours', Math.min(24, formData.photoEventHours + 1))}><Plus /></Button>
              </div>
              <div className="text-center font-semibold w-full mt-2">{formData.photoEventHours} hours</div>
            </div>
          )}
        </div>
      )}

      {formData.photographySubType === 'real_estate' && (
        <div className="pt-4 space-y-4 animate-fade-in-up">
          <h4 className="font-semibold">Real Estate Details</h4>
          <div className="space-y-4">
            {formData.photoRealEstateProperties.map((prop, index) => (
                <div key={prop.id} className="p-4 border rounded-lg space-y-4 relative bg-background/50">
                    <Label className='font-semibold'>Property #{index + 1}</Label>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <Label htmlFor={`prop-type-${prop.id}`}>Property Type</Label>
                            <Select value={prop.type} onValueChange={(v) => handleRealEstateChange(index, "type", v)}>
                            <SelectTrigger id={`prop-type-${prop.id}`} className="mt-2">
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
                        <div className="flex items-center justify-between p-4 border rounded-lg mt-auto h-[40px]">
                            <Label htmlFor={`prop-furnished-${prop.id}`}>Furnished / Staged</Label>
                            <Switch id={`prop-furnished-${prop.id}`} checked={prop.furnished} onCheckedChange={(v) => handleRealEstateChange(index, "furnished", v)} />
                        </div>
                    </div>
                     {formData.photoRealEstateProperties.length > 1 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRealEstateProperty(index)}
                            className="absolute -top-3 -right-3 text-muted-foreground hover:text-destructive"
                        >
                            <XCircle className="w-6 h-6" />
                        </Button>
                    )}
                </div>
            ))}
          </div>
           <Button variant="outline" onClick={addRealEstateProperty} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Another Property
          </Button>
        </div>
      )}
      {formData.photographySubType === 'headshots' && (
        <div className="pt-4 space-y-4 animate-fade-in-up">
          <h4 className="font-semibold">Headshot Details</h4>
          <div>
            <Label>Number of People</Label>
            <div className="flex items-center gap-4 mt-2">
              <Button variant="outline" size="icon" onClick={() => handleInputChange('photoHeadshotsPeople', Math.max(sliderProps.headshots.min, formData.photoHeadshotsPeople - sliderProps.headshots.step))}><Minus /></Button>
              <Slider
                value={[formData.photoHeadshotsPeople]}
                onValueChange={(v) => handleInputChange('photoHeadshotsPeople', v[0])}
                min={sliderProps.headshots.min}
                max={sliderProps.headshots.max}
                step={sliderProps.headshots.step}
                className='flex-1'
              />
              <Button variant="outline" size="icon" onClick={() => handleInputChange('photoHeadshotsPeople', Math.min(sliderProps.headshots.max, formData.photoHeadshotsPeople + sliderProps.headshots.step))}><Plus /></Button>
            </div>
            <div className="text-center font-semibold w-full mt-2">{formData.photoHeadshotsPeople} people</div>
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
                      <Button variant="outline" size="icon" onClick={() => handleInputChange(isProduct ? "photoProductPhotos" : "photoFoodPhotos", Math.max(1, (isProduct ? formData.photoProductPhotos : formData.photoFoodPhotos) - 1))}><Minus /></Button>
                     <Slider
                        value={[isProduct ? formData.photoProductPhotos : formData.photoFoodPhotos]}
                        onValueChange={(v) => handleInputChange(isProduct ? "photoProductPhotos" : "photoFoodPhotos", v[0])}
                        min={1}
                        max={100}
                        step={1}
                        className='flex-1'
                    />
                     <Button variant="outline" size="icon" onClick={() => handleInputChange(isProduct ? "photoProductPhotos" : "photoFoodPhotos", Math.min(100, (isProduct ? formData.photoProductPhotos : formData.photoFoodPhotos) + 1))}><Plus /></Button>
                </div>
                 <div className="text-center font-semibold w-full mt-2">{isProduct ? formData.photoProductPhotos : formData.photoFoodPhotos} photos</div>
            </div>
             <div>
                <Label>Complexity</Label>
                 <RadioGroup
                    value={isProduct ? formData.photoProductComplexity : formData.photoFoodComplexity}
                    onValueChange={(v) => handleInputChange(isProduct ? 'photoProductComplexity' : 'photoFoodComplexity', v)}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
                >
                    <div className="flex-1">
                        <RadioGroupItem value="simple" id={`${isProduct ? 'prod' : 'food'}-simple`} className="sr-only" />
                        <Label htmlFor={`${isProduct ? 'prod' : 'food'}-simple`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 text-base py-4",
                            (isProduct ? formData.photoProductComplexity : formData.photoFoodComplexity) === 'simple' ? 'border-primary bg-accent' : 'border-border'
                        )}>
                            Simple
                            <span className="text-xs text-muted-foreground">(Basic Lighting)</span>
                            <span className="font-bold text-sm mt-1">AED {priceConfig.min}/photo</span>
                        </Label>
                    </div>
                     <div className="flex-1">
                        <RadioGroupItem value="complex" id={`${isProduct ? 'prod' : 'food'}-complex`} className="sr-only" />
                        <Label htmlFor={`${isProduct ? 'prod' : 'food'}-complex`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 text-base py-4",
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
          <h4 className="font-semibold">{formData.photographySubType === 'fashion' ? 'Fashion/Lifestyle' : 'Wedding'} Package</h4>
           <RadioGroup
            value={formData.photographySubType === 'fashion' ? formData.photoFashionPackage : formData.photoWeddingPackage}
            onValueChange={(v) => handleInputChange(formData.photographySubType === 'fashion' ? 'photoFashionPackage' : 'photoWeddingPackage', v)}
            className="grid md:grid-cols-3 gap-4"
          >
            {Object.entries(formData.photographySubType === 'fashion' ? fashionPackages : weddingPackages).map(([id, { name, price, description }]) => (
              <div key={id}>
                <RadioGroupItem value={id} id={`pkg-${id}`} className="sr-only" />
                <Label htmlFor={`pkg-${id}`} className={cn("flex flex-col justify-between rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 h-full text-base",
                  (formData.photographySubType === 'fashion' ? formData.photoFashionPackage : formData.photoWeddingPackage) === id ? 'border-primary bg-accent' : 'border-border'
                )}>
                  <div>
                    <h5 className="font-semibold text-lg">{name}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  </div>
                  <p className="font-bold text-xl mt-4">{price}</p>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
