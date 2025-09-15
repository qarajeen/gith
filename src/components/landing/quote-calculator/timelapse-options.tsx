import * as React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { FormData } from './types';
import { timelapseSubServices } from './types';

type TimelapseOptionsProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
};

export function TimelapseOptions({ formData, handleInputChange }: TimelapseOptionsProps) {
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
}
