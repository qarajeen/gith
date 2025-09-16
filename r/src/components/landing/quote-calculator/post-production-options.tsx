import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { FormData } from './types';
import { postProductionSubServices } from './types';
import { Plus, Minus } from 'lucide-react';

type PostProductionOptionsProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
  validationError: boolean;
};

export function PostProductionOptions({ formData, handleInputChange, validationError }: PostProductionOptionsProps) {
    const photoEditingPrices = {
        basic: { min: 20, max: 50, label: "AED 20 - 50" },
        advanced: { min: 50, max: 250, label: "AED 50 - 250" },
        restoration: { min: 100, max: 300, label: "AED 100 - 300" },
    };

    return (
        <div className="space-y-4 animate-fade-in-up">
            <div className={cn("p-4 border-2 rounded-lg transition-all", validationError ? 'border-destructive' : 'border-transparent')}>
                <h3 className="font-semibold mb-4 text-lg">Select Post-Production Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(postProductionSubServices).map(([id, { name }]) => (
                        <Button
                            key={id}
                            variant="outline"
                            size="lg"
                            onClick={() => {
                                handleInputChange("postSubType", id)
                                // Reset prices on change
                                if (id === 'photo') {
                                    handleInputChange('postPhotoEditingPrice', photoEditingPrices.basic.min);
                                }
                            }}
                            className={cn("h-auto py-4 text-base transition-all hover:bg-accent/50 text-center justify-center",
                                formData.postSubType === id ? 'border-primary bg-accent' : 'border-border'
                            )}
                        >
                            {name}
                        </Button>
                    ))}
                </div>
            </div>

            {formData.postSubType === 'video' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">Video Editing Details</h4>
                    <RadioGroup value={formData.postVideoEditingType} onValueChange={(v) => handleInputChange('postVideoEditingType', v)} className="grid md:grid-cols-3 gap-4">
                         {['perHour', 'perMinute', 'social'].map(type => (
                             <div key={type}>
                                <RadioGroupItem value={type} id={`post-video-${type}`} className="sr-only" />
                                <Label htmlFor={`post-video-${type}`} className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 h-full text-base py-4",
                                    formData.postVideoEditingType === type ? 'border-primary bg-accent' : 'border-border'
                                )}>
                                    {type === 'perHour' ? 'Per Hour' : type === 'perMinute' ? 'Per Finished Minute' : 'Social Media Edit'}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {formData.postVideoEditingType === 'perHour' && (
                        <div>
                            <Label>Hours (AED 250/hr)</Label>
                             <div className="flex items-center gap-4 mt-2">
                                <Button variant="outline" size="icon" onClick={() => handleInputChange('postVideoEditingHours', Math.max(1, formData.postVideoEditingHours - 1))}><Minus /></Button>
                                <Slider
                                    value={[formData.postVideoEditingHours]}
                                    onValueChange={(v) => handleInputChange('postVideoEditingHours', v[0])}
                                    min={1}
                                    max={50}
                                    step={1}
                                    className="flex-1"
                                />
                                <Button variant="outline" size="icon" onClick={() => handleInputChange('postVideoEditingHours', Math.min(50, formData.postVideoEditingHours + 1))}><Plus /></Button>
                            </div>
                            <div className="text-center font-semibold w-full mt-2">{formData.postVideoEditingHours} hours</div>
                        </div>
                    )}
                    {formData.postVideoEditingType === 'perMinute' && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="postVideoEditingMinutes">Finished Minutes</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    <Button variant="outline" size="icon" onClick={() => handleInputChange('postVideoEditingMinutes', Math.max(1, formData.postVideoEditingMinutes - 1))}><Minus /></Button>
                                    <Slider
                                        value={[formData.postVideoEditingMinutes]}
                                        onValueChange={(v) => handleInputChange('postVideoEditingMinutes', v[0])}
                                        min={1} max={60} step={1}
                                        className='flex-1'
                                    />
                                    <Button variant="outline" size="icon" onClick={() => handleInputChange('postVideoEditingMinutes', Math.min(60, formData.postVideoEditingMinutes + 1))}><Plus /></Button>
                                </div>
                                <div className="text-center font-semibold w-full mt-2">{formData.postVideoEditingMinutes} minutes</div>
                            </div>
                            <div>
                                <Label>Price Per Minute (AED 500 - 1,500)</Label>
                                <div className="flex items-center gap-4 mt-2">
                                    <Button variant="outline" size="icon" onClick={() => handleInputChange('postVideoEditingPerMinutePrice', Math.max(500, formData.postVideoEditingPerMinutePrice - 50))}><Minus /></Button>
                                    <Slider
                                        value={[formData.postVideoEditingPerMinutePrice]}
                                        onValueChange={(v) => handleInputChange('postVideoEditingPerMinutePrice', v[0])}
                                        min={500} max={1500} step={50}
                                        className='flex-1'
                                    />
                                    <Button variant="outline" size="icon" onClick={() => handleInputChange('postVideoEditingPerMinutePrice', Math.min(1500, formData.postVideoEditingPerMinutePrice + 50))}><Plus /></Button>
                                </div>
                                <div className="text-center font-semibold w-full mt-2">{formData.postVideoEditingPerMinutePrice.toLocaleString()} AED</div>
                            </div>
                        </div>
                    )}
                     {formData.postVideoEditingType === 'social' && (
                         <div>
                            <Label>Price for 15-60s Edit (AED 500 - 1,500)</Label>
                            <div className="flex items-center gap-4 mt-2">
                                <Button variant="outline" size="icon" onClick={() => handleInputChange('postVideoEditingSocialPrice', Math.max(500, formData.postVideoEditingSocialPrice - 50))}><Minus /></Button>
                                <Slider
                                    value={[formData.postVideoEditingSocialPrice]}
                                    onValueChange={(v) => handleInputChange('postVideoEditingSocialPrice', v[0])}
                                    min={500} max={1500} step={50}
                                    className='flex-1'
                                />
                                <Button variant="outline" size="icon" onClick={() => handleInputChange('postVideoEditingSocialPrice', Math.min(1500, formData.postVideoEditingSocialPrice + 50))}><Plus /></Button>
                            </div>
                            <div className="text-center font-semibold w-full mt-2">{formData.postVideoEditingSocialPrice.toLocaleString()} AED</div>
                        </div>
                    )}
                </div>
            )}

            {formData.postSubType === 'photo' && (
                <div className="pt-4 space-y-4 animate-fade-in-up">
                    <h4 className="font-semibold">Photo Editing Details</h4>
                     <RadioGroup
                        value={formData.postPhotoEditingType}
                        onValueChange={(v) => {
                            const newType = v as keyof typeof photoEditingPrices;
                            handleInputChange('postPhotoEditingType', newType);
                            handleInputChange('postPhotoEditingPrice', photoEditingPrices[newType].min);
                        }}
                        className="grid md:grid-cols-3 gap-4"
                    >
                        {Object.entries(photoEditingPrices).map(([type, { label }]) => (
                            <div key={type}>
                                <RadioGroupItem value={type} id={`post-photo-${type}`} className="sr-only" />
                                <Label 
                                    htmlFor={`post-photo-${type}`} 
                                    className={cn("flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer w-full transition-colors hover:bg-accent/50 h-full text-base py-4",
                                    formData.postPhotoEditingType === type ? 'border-primary bg-accent' : 'border-border'
                                )}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)} Retouching
                                    <span className="text-xs text-muted-foreground">{label}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                     <div>
                        <Label htmlFor="postPhotoEditingQuantity">Number of Photos</Label>
                        <div className="flex items-center gap-4 mt-2">
                            <Button variant="outline" size="icon" onClick={() => handleInputChange('postPhotoEditingQuantity', Math.max(1, formData.postPhotoEditingQuantity - 1))}><Minus /></Button>
                            <Slider
                                value={[formData.postPhotoEditingQuantity]}
                                onValueChange={(v) => handleInputChange('postPhotoEditingQuantity', v[0])}
                                min={1}
                                max={200}
                                step={1}
                                className='flex-1'
                            />
                            <Button variant="outline" size="icon" onClick={() => handleInputChange('postPhotoEditingQuantity', Math.min(200, formData.postPhotoEditingQuantity + 1))}><Plus /></Button>
                        </div>
                        <div className="text-center font-semibold w-full mt-2">{formData.postPhotoEditingQuantity} photos</div>
                    </div>
                </div>
            )}
        </div>
    )
}
