import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Quote } from '../types';

const API_KEY = process.env.API_KEY;

const getUnsplashUrl = (keywords: string): string => {
  // Use a unique signature for each request to prevent browser caching of the same URL
  return `https://source.unsplash.com/featured/1080x1080/?${encodeURIComponent(keywords)}&sig=${Math.random()}`;
};

const getMockQuote = (category: string): Quote => {
  // Using a simpler, more reliable keyword combination for mock quotes
  const keywords = `${category},nature,dark`;
  return {
    id: `mock-${Date.now()}-${Math.random()}`,
    text: `This is a mock inspirational quote about ${category}. Stay positive and keep pushing forward!`,
    author: 'Zolffix AI',
    category,
    imageUrl: getUnsplashUrl(keywords),
  };
};

export const generateQuote = async (category: string): Promise<Quote> => {
  if (!API_KEY) {
    console.warn("API_KEY not found. Returning mock data.");
    return getMockQuote(category);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    // Updated prompt to request a single, more reliable keyword.
    const prompt = `Generate an original, deeply thoughtful, one-sentence motivational quote about "${category}" in a poetic and non-cliche tone. The author should be "Zolffix AI". Also provide a single, common, one-word keyword (e.g., 'ocean', 'forest', 'stars', 'rain', 'city') suitable for a search on Unsplash to find a cinematic, dark-themed background image that captures the quote's essence. Format the response as a single JSON object with keys: "text" (string), "author" (string), and "imageKeyword" (string).`;
    
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

    // Updated logic to use the new 'imageKeyword' string property.
    if (jsonResponse.text && jsonResponse.author && typeof jsonResponse.imageKeyword === 'string' && jsonResponse.imageKeyword.trim() !== '') {
      const keywords = `${jsonResponse.imageKeyword},dark,cinematic`;
      
      return {
        id: `gemini-${Date.now()}-${Math.random()}`,
        text: jsonResponse.text,
        author: jsonResponse.author,
        category,
        imageUrl: getUnsplashUrl(keywords),
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