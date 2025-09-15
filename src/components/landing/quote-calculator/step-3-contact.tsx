import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { FormData } from './types';

type Step3ContactProps = {
  formData: FormData;
  handleInputChange: (field: keyof FormData, value: any) => void;
};

export function Step3Contact({ formData, handleInputChange }: Step3ContactProps) {
  return (
    <div className="space-y-4 animate-fade-in-up pb-20 sm:pb-0">
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
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" placeholder="Your Phone Number" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea id="message" placeholder="Tell us more about your project..." value={formData.message} onChange={(e) => handleInputChange("message", e.target.value)} />
      </div>
    </div>
  );
}
