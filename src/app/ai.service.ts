import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private themeService = inject(ThemeService);

  async suggestThemes(businessType: string) {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const themes = this.themeService.getThemes()();
    const themeList = themes.map(t => `ID: ${t.id}, Name: ${t.name}, Category: ${t.category}, Description: ${t.description}`).join('\n');

    const prompt = `User business description: "${businessType}"`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: `
            You are an expert web consultant for AJR Digital HUB.
            Your task is to suggest the best website themes for a user based on their business description.
            
            Available themes:
            ${themeList}

            Suggest the top 2 most suitable themes.
            Return ONLY a JSON object with this structure:
            {
              "suggestions": [
                {
                  "themeId": "the exact ID from the list",
                  "reason": "a compelling 1-sentence explanation of why this theme is perfect for them"
                }
              ]
            }
          `,
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from AI');
      }

      return JSON.parse(text);
    } catch (error) {
      console.error('AI Suggestion Error:', error);
      return { suggestions: [] };
    }
  }
}
