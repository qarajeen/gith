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
import { videoSubServices } from './types';
import { Plus, Minus } from 'lucide-react';

type VideoOptionsProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
  validationError: boolean;
};

export function VideoOptions({ formData, handleInputChange, validationError }: VideoOptionsProps) {
  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className={cn("p-4 border-2 rounded-lg transition-all", validationError ? 'border-destructive' : 'border-transparent')}>
        <h3 className="font-semibold mb-4 text-lg">Select Video Production Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(videoSubServices).map(([id, { name }]) => (
            <Button
              key={id}
              variant="outline"
              size="lg"
              onClick={() => handleInputChange("videoSubType", id)}
              className={cn(
                "h-auto min-h-[6rem] py-4 text-base transition-all hover:bg-accent/50 text-center justify-center whitespace-normal",
                formData.videoSubType === id ? 'border-primary bg-accent' : 'border-border'
              )}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>

      {formData.videoSubType === 'event' && (
        <div className="pt-4 space-y-4 animate-fade-in-up">
          <h4 className="font-semibold">Event Details</h4>
          <RadioGroup value={formData.videoEventDuration} onValueChange={(v) => handleInputChange("videoEventDuration", v)} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['perHour', 'halfDay', 'fullDay'].map(dur => (
              <div className="flex-1" key={dur}>
                <RadioGroupItem value={dur} id={`video-event-${dur}`} className="sr-only" />
                <Label htmlFor={`video-event-${dur}`} className={cn("flex flex-col items-center justify-between rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 text-base py-4",
                  formData.videoEventDuration === dur ? 'border-primary bg-accent' : 'border-border'
                )}>
                  {dur === 'perHour' ? 'Per Hour' : dur === 'halfDay' ? 'Half Day (4hrs)' : 'Full Day (8hrs)'}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {formData.videoEventDuration === 'perHour' && (
            <div>
              <Label>Hours</Label>
              <div className="flex items-center gap-4 mt-2">
                <Button variant="outline" size="icon" onClick={() => handleInputChange('videoEventHours', Math.max(1, formData.videoEventHours - 1))}><Minus /></Button>
                <Slider
                  value={[formData.videoEventHours]}
                  onValueChange={(v) => handleInputChange('videoEventHours', v[0])}
                  min={1}
                  max={24}
                  step={1}
                  className='flex-1'
                />
                <Button variant="outline" size="icon" onClick={() => handleInputChange('videoEventHours', Math.min(24, formData.videoEventHours + 1))}><Plus /></Button>
              </div>
              <div className="text-center font-semibold w-full mt-2">{formData.videoEventHours} hours</div>
            </div>
          )}
        </div>
      )}

      {formData.videoSubType === 'corporate' && (
        <div className="pt-4 space-y-4 animate-fade-in-up">
          <h4 className="font-semibold">Corporate Video Details (Basic Package: AED 3,000)</h4>
          <div className="space-y-3">
            <div>
              <Label>Extended Filming</Label>
              <RadioGroup value={formData.videoCorporateExtendedFilming} onValueChange={(v) => handleInputChange("videoCorporateExtendedFilming", v)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                {[['none', 'None'], ['halfDay', 'Half-Day (+1,500)'], ['fullDay', 'Full-Day (+3,500)']].map(([val, label]) => (
                  <div className="flex-1" key={val}>
                    <RadioGroupItem value={val} id={`corp-film-${val}`} className="sr-only" />
                    <Label htmlFor={`corp-film-${val}`} className={cn("flex items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 text-base py-4 text-center",
                      formData.videoCorporateExtendedFilming === val ? 'border-primary bg-accent' : 'border-border'
                    )}>
                      {label as string}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoCorporateTwoCam ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoCorporateTwoCam" className="cursor-pointer flex-grow text-base">Two-Camera Interview Setup (+ AED 950)</Label>
              <Switch id="videoCorporateTwoCam" checked={formData.videoCorporateTwoCam} onCheckedChange={(v) => handleInputChange("videoCorporateTwoCam", v)} />
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoCorporateScripting ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoCorporateScripting" className="cursor-pointer flex-grow text-base">Full Scriptwriting & Storyboarding (+ AED 1,500)</Label>
              <Switch id="videoCorporateScripting" checked={formData.videoCorporateScripting} onCheckedChange={(v) => handleInputChange("videoCorporateScripting", v)} />
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoCorporateEditing ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoCorporateEditing" className="cursor-pointer flex-grow text-base">Advanced Editing & Color Grading (+ AED 1,000)</Label>
              <Switch id="videoCorporateEditing" checked={formData.videoCorporateEditing} onCheckedChange={(v) => handleInputChange("videoCorporateEditing", v)} />
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoCorporateGraphics ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoCorporateGraphics" className="cursor-pointer flex-grow text-base">Custom Motion Graphics (+ AED 800)</Label>
              <Switch id="videoCorporateGraphics" checked={formData.videoCorporateGraphics} onCheckedChange={(v) => handleInputChange("videoCorporateGraphics", v)} />
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoCorporateVoiceover ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoCorporateVoiceover" className="cursor-pointer flex-grow text-base">Professional Voice-over (+ AED 500)</Label>
              <Switch id="videoCorporateVoiceover" checked={formData.videoCorporateVoiceover} onCheckedChange={(v) => handleInputChange("videoCorporateVoiceover", v)} />
            </div>
          </div>
        </div>
      )}

      {formData.videoSubType === 'promo' && (
        <div className="pt-4 space-y-4 animate-fade-in-up">
          <h4 className="font-semibold">Promotional Video Details (Foundation Package: AED 8,000)</h4>
          <div className="space-y-3">
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoPromoFullDay ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoPromoFullDay" className="cursor-pointer flex-grow text-base">Additional Full-Day Production (+ AED 5,000)</Label>
              <Switch id="videoPromoFullDay" checked={formData.videoPromoFullDay} onCheckedChange={(v) => handleInputChange("videoPromoFullDay", v)} />
            </div>
            <div>
              <Label>Additional Locations (+ AED 2,000 each)</Label>
              <div className="flex items-center gap-4 mt-2">
                <Button variant="outline" size="icon" onClick={() => handleInputChange('videoPromoMultiLoc', Math.max(0, formData.videoPromoMultiLoc - 1))}><Minus /></Button>
                <Slider
                  value={[formData.videoPromoMultiLoc]}
                  onValueChange={(v) => handleInputChange('videoPromoMultiLoc', v[0])}
                  min={0}
                  max={10}
                  step={1}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={() => handleInputChange('videoPromoMultiLoc', Math.min(10, formData.videoPromoMultiLoc + 1))}><Plus /></Button>
              </div>
              <div className="text-center font-semibold w-full mt-2">{formData.videoPromoMultiLoc} locations</div>
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoPromoConcept ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoPromoConcept" className="cursor-pointer flex-grow text-base">Advanced Storyboarding & Concept (+ AED 3,000)</Label>
              <Switch id="videoPromoConcept" checked={formData.videoPromoConcept} onCheckedChange={(v) => handleInputChange("videoPromoConcept", v)} />
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoPromoGraphics ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoPromoGraphics" className="cursor-pointer flex-grow text-base">Advanced 2D/3D Motion Graphics (+ AED 4,000)</Label>
              <Switch id="videoPromoGraphics" checked={formData.videoPromoGraphics} onCheckedChange={(v) => handleInputChange("videoPromoGraphics", v)} />
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoPromoSound ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoPromoSound" className="cursor-pointer flex-grow text-base">Custom Sound Design & Mixing (+ AED 3,000)</Label>
              <Switch id="videoPromoSound" checked={formData.videoPromoSound} onCheckedChange={(v) => handleInputChange("videoPromoSound", v)} />
            </div>
            <div className={cn("flex items-center justify-between p-4 border rounded-lg", formData.videoPromoMakeup ? 'border-primary bg-accent' : 'border-border' )}>
              <Label htmlFor="videoPromoMakeup" className="cursor-pointer flex-grow text-base">Hair & Makeup Artist (+ AED 2,000)</Label>
              <Switch id="videoPromoMakeup" checked={formData.videoPromoMakeup} onCheckedChange={(v) => handleInputChange("videoPromoMakeup", v)} />
            </div>
          </div>
        </div>
      )}

      {formData.videoSubType === 'real_estate' && (
        <div className="pt-4 space-y-4 animate-fade-in-up">
          <h4 className="font-semibold">Real Estate Details</h4>
          <div>
            <Label htmlFor="videoRealEstatePropertyType">Property Type</Label>
            <Select value={formData.videoRealEstatePropertyType} onValueChange={(v) => handleInputChange("videoRealEstatePropertyType", v)}>
              <SelectTrigger id="videoRealEstatePropertyType" className="mt-2">
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="1-bedroom">1-Bedroom Apartment</SelectItem>
                <SelectItem value="2-bedroom">2-Bedroom Apartment</SelectItem>
                <SelectItem value="3-bedroom">3-Bedroom Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {formData.videoSubType === 'wedding' && (
        <div className="pt-4 space-y-4 animate-fade-in-up">
          <h4 className="font-semibold">Wedding Videography Details</h4>
          <div>
            <Label>Base Price (AED 3,000 - 10,000)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Button variant="outline" size="icon" onClick={() => handleInputChange('videoWeddingPrice', Math.max(3000, formData.videoWeddingPrice - 100))}><Minus /></Button>
              <Slider
                value={[formData.videoWeddingPrice]}
                onValueChange={(v) => handleInputChange('videoWeddingPrice', v[0])}
                min={3000}
                max={10000}
                step={100}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={() => handleInputChange('videoWeddingPrice', Math.min(10000, formData.videoWeddingPrice + 100))}><Plus /></Button>
            </div>
             <div className="text-center font-semibold w-full mt-2">{formData.videoWeddingPrice.toLocaleString()} AED</div>
          </div>
        </div>
      )}
    </div>
  );
}
