import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Quote } from '../types';

const API_KEY = process.env.API_KEY;

const getMockQuote = (category: string): Quote => ({
  id: `mock-${Date.now()}-${Math.random()}`,
  text: `This is a mock inspirational quote about ${category}. Stay positive and keep pushing forward!`,
  author: 'Zolffix AI',
  category,
  imageUrl: `https://source.unsplash.com/1080x1080/?dark,cinematic,${encodeURIComponent(category)},abstract&random=${Math.random()}`,
});

export const generateQuote = async (category: string): Promise<Quote> => {
  if (!API_KEY) {
    console.warn("API_KEY not found. Returning mock data.");
    return getMockQuote(category);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Generate an original, deeply thoughtful, one-sentence motivational quote about "${category}" in a poetic and non-cliche tone. The author should be "Zolffix AI". Also provide 3-5 specific, descriptive keywords for a cinematic, dark-themed background image that captures the quote's essence. Format the response as a single JSON object with keys: "text" (string), "author" (string), and "imageKeywords" (array of strings).`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    });

    const textResponse = response.text.trim();
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(textResponse);
    } catch (e) {
        console.error("Failed to parse JSON from Gemini:", textResponse);
        throw new Error("Invalid JSON response from Gemini API");
    }


    if (jsonResponse.text && jsonResponse.author && Array.isArray(jsonResponse.imageKeywords) && jsonResponse.imageKeywords.length > 0) {
      const keywords = [...jsonResponse.imageKeywords, 'dark', 'cinematic', 'abstract'].join(',');
      return {
        id: `gemini-${Date.now()}-${Math.random()}`,
        text: jsonResponse.text,
        author: jsonResponse.author,
        category,
        imageUrl: `https://source.unsplash.com/1080x1080/?${encodeURIComponent(keywords)}&random=${Math.random()}`,
      };
    } else {
        console.error("Invalid JSON structure from Gemini:", jsonResponse);
        throw new Error("Invalid JSON structure from Gemini API");
    }
  } catch (error) {
    console.error("Error generating quote with Gemini:", error);
    return getMockQuote(category); // Fallback to mock data on error
  }
};