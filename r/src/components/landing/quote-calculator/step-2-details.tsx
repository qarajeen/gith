import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { FormData } from './types';
import { locationTypeOptions } from './types';

type Step2DetailsProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
};

export function Step2Details({ formData, handleInputChange }: Step2DetailsProps) {
  const needsLocation = formData.serviceType !== 'post';
  const pSubType = formData.photographySubType;
  const vSubType = formData.videoSubType;
  const canHaveSecondCamera =
    (formData.serviceType === 'photography' && (pSubType === 'event' || pSubType === 'fashion' || pSubType === 'wedding')) ||
    (formData.serviceType === 'video' && (vSubType === 'event' || vSubType === 'wedding'));
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

      <div className="space-y-6 mb-20 sm:mb-0">
        <h3 className="font-semibold text-lg">Options & Modifiers</h3>
        <div className="space-y-4">
          {canHaveSecondCamera && (
            <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.secondCamera ? 'border-primary bg-accent' : 'border-border')}>
              <Label htmlFor="secondCamera" className="cursor-pointer flex-grow text-base">Second Camera (+100% of Base Price)</Label>
              <Switch id="secondCamera" checked={formData.secondCamera} onCheckedChange={(v) => handleInputChange('secondCamera', v)} />
            </div>
          )}
          {isTimelapse && (
            <div className={cn("flex items-center justify-between p-4 border rounded-lg transition-colors", formData.timelapseExtraCamera ? 'border-primary bg-accent' : 'border-border')}>
              <Label htmlFor="timelapseExtraCamera" className="cursor-pointer flex-grow text-base">Extra Camera (+100% of Base Price)</Label>
              <Switch id="timelapseExtraCamera" checked={formData.timelapseExtraCamera} onCheckedChange={(v) => handleInputChange('timelapseExtraCamera', v)} />
            </div>
          )}
          {!isPostProduction && (
            <div>
              <Label className="font-semibold text-base">Delivery Timeline</Label>
              <RadioGroup value={formData.deliveryTimeline} onValueChange={(v) => handleInputChange("deliveryTimeline", v)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {[
                  { value: 'standard', label: 'Standard Delivery' },
                  { value: 'rush', label: 'Rush Delivery (24h, +50%)' }
                ].map(({ value, label }) => (
                  <div className="flex-1" key={value}>
                    <RadioGroupItem value={value} id={`delivery-${value}`} className="sr-only" />
                    <Label htmlFor={`delivery-${value}`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 text-base py-4",
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
}
