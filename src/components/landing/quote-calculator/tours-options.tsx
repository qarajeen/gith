import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { FormData } from './types';
import { toursSubServices } from './types';

type ToursOptionsProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
  validationError: boolean;
};

export function ToursOptions({ formData, handleInputChange, validationError }: ToursOptionsProps) {
  return (
    <div className="space-y-4 animate-fade-in-up">
       <div className={cn("p-4 border-2 rounded-lg transition-all", validationError ? 'border-destructive' : 'border-transparent')}>
        <h3 className="font-semibold mb-4 text-lg">Select Property Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(toursSubServices).map(([id, { name }]) => (
            <Button
              key={id}
              variant="outline"
              size="lg"
              onClick={() => handleInputChange("toursSubType", id)}
              className={cn(
                "h-auto min-h-[6rem] py-4 text-base transition-all hover:bg-accent/50 text-center justify-center whitespace-normal",
                formData.toursSubType === id ? 'border-primary bg-accent' : 'border-border'
              )}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
