'use server';
/**
 * @fileOverview An AI flow to generate a friendly summary for a project quote.
 *
 * - summarizeQuote - A function that handles the quote summarization.
 * - SummarizeQuoteInput - The input type for the summarizeQuote function.
 * - SummarizeQuoteOutput - The return type for the summarizeQuote function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SummarizeQuoteInputSchema = z.object({
  name: z.string().optional().describe("The name of the customer."),
  serviceType: z.string().describe('The main service selected (e.g., Photography, Video Production).'),
  packageType: z.string().describe('The pricing model (perHour or perProject).'),
  hours: z.number().optional().describe('The number of hours, if perHour is selected.'),
  location: z.string().describe('The city/area for the service.'),
  locationType: z.string().describe('The type of location (e.g., Indoor, Studio).'),
  addons: z.array(z.string()).describe('A list of selected add-ons (e.g., Drone Footage, Scriptwriting).'),
});
type SummarizeQuoteInput = z.infer<typeof SummarizeQuoteInputSchema>;

const SummarizeQuoteOutputSchema = z.object({
  projectTitle: z.string().describe('A short, creative, and professional project title for the quote. Examples: "The Dubai Corporate Headshot Package", "Your Brand Vision Promotional Video", "Luxury Real Estate Photography".'),
  summary: z
    .string()
    .describe('A friendly, professional summary of the project quote, written as if from a media production company.'),
});
type SummarizeQuoteOutput = z.infer<typeof SummarizeQuoteOutputSchema>;

export async function summarizeQuote(input: SummarizeQuoteInput): Promise<SummarizeQuoteOutput> {
  return summarizeQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeQuotePrompt',
  input: { schema: SummarizeQuoteInputSchema },
  output: { schema: SummarizeQuoteOutputSchema },
  prompt: `You are a friendly and professional sales assistant for a creative media production company called WRH Enigma.
Your task is to generate a short, encouraging, and professional summary for a customer's price quote based on their selections.
You also need to generate a creative and professional project title for the quote.

First, generate the projectTitle. It should be concise and sound professional.
Then, generate the summary.
{{#if name}}
Start with a friendly opening addressing the customer, {{name}}, by name.
{{else}}
Start with a friendly opening.
{{/if}}
Briefly describe the core service they've chosen.
Mention the location and location type if applicable.
List any add-ons they've selected in a conversational way.
Keep the summary concise and positive, between 1-3 sentences.

Quote Details:
- Service: {{{serviceType}}}
- Package: {{#if hours}}{{{hours}}} hours (Per Hour){{else}}Per Project{{/if}}
- Location: {{{location}}}, {{{locationType}}}
- Add-ons: {{#if addons.length}}{{#each addons}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

Generate the projectTitle and the summary.`,
});

const summarizeQuoteFlow = ai.defineFlow(
  {
    name: 'summarizeQuoteFlow',
    inputSchema: SummarizeQuoteInputSchema,
    outputSchema: SummarizeQuoteOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
