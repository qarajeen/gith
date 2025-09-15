import * as React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { FormData } from './types';
import { timelapseSubServices } from './types';

type TimelapseOptionsProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
};

export function TimelapseOptions({ formData, handleInputChange }: TimelapseOptionsProps) {
    
  return (
    <div className="space-y-4 animate-fade-in-up">
      <h3 className="font-semibold mb-4 text-lg">Select Project Length</h3>
      <RadioGroup value={formData.timelapseSubType} onValueChange={(v) => handleInputChange("timelapseSubType", v)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

       {!formData.timelapseSubType && (
        <div className="text-center text-muted-foreground pt-10">
          Please select a project length to see pricing.
        </div>
      )}
    </div>
  );
}
