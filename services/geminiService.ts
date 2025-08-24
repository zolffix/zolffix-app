import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Quote } from '../types';

// The API key is accessed via process.env.API_KEY as per guidelines.
// It is assumed to be set in the deployment environment.

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getImageUrl = (keywords: string): string => {
  // Use Unsplash for high-quality, relevant images.
  // Keywords are comma-separated for better search results.
  const processedKeywords = keywords.replace(/[^a-zA-Z0-9\s,]/g, '').replace(/\s+/g, ',');
  return `https://source.unsplash.com/1080x1080/?${encodeURIComponent(processedKeywords)}`;
};

const getMockQuotes = (category: string, count: number): Quote[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${Date.now()}-${Math.random()}-${i}`,
    text: `This is a mock inspirational quote about ${category}. Stay positive and keep pushing forward!`,
    author: 'Zolffix AI',
    category,
    imageUrl: getImageUrl(`${category},nature,dark`),
    imageKeyword: category,
  }));
};

// New function to generate multiple quotes in a single API call with retry logic
export const generateQuotes = async (category: string, count: number): Promise<Quote[]> => {
  if (count <= 0) return [];
  
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Generate ${count} original, deeply thoughtful, and emotionally resonant one-sentence quotes about "${category}". The tone must be poetic, profound, and avoid clichés. The author for all quotes must be "Zolffix AI". For each quote, also provide a single, powerful, one-word English keyword (e.g., 'solitude', 'resilience', 'journey', 'ocean', 'forest') that is highly suitable for finding a matching cinematic, dark, moody, and beautiful background image. Format the response as a single JSON array, where each object in the array has keys: "text" (string), "author" (string), and "imageKeyword" (string).`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                author: { type: Type.STRING },
                imageKeyword: { type: Type.STRING }
              },
              required: ["text", "author", "imageKeyword"]
            }
          }
        },
      });

      let textResponse = response.text.trim();
      if (textResponse.startsWith("```json")) {
        textResponse = textResponse.slice(7, -3).trim();
      } else if (textResponse.startsWith("```")) {
        textResponse = textResponse.slice(3, -3).trim();
      }

      let jsonResponseArray;
      try {
        jsonResponseArray = JSON.parse(textResponse);
      } catch (e) {
        console.error("Failed to parse JSON array from Gemini:", textResponse);
        throw new Error("Invalid JSON array response from Gemini API");
      }

      if (!Array.isArray(jsonResponseArray)) {
        console.error("Gemini response is not an array:", jsonResponseArray);
        throw new Error("Invalid data structure from Gemini API: Expected an array.");
      }

      const quotes: Quote[] = jsonResponseArray.map((item): Quote | null => {
        if (item.text && item.author && typeof item.imageKeyword === 'string' && item.imageKeyword.trim() !== '') {
          const keywords = `${item.imageKeyword},dark,cinematic,realistic,beautiful`;
          return {
            id: `gemini-${Date.now()}-${Math.random()}`,
            text: item.text,
            author: item.author,
            category,
            imageUrl: getImageUrl(keywords),
            imageKeyword: item.imageKeyword,
          };
        }
        return null;
      }).filter((q): q is Quote => q !== null);

      return quotes; // Success! Exit the loop and return.

    } catch (error: any) {
      const errorMessage = JSON.stringify(error); // Error object might be complex.
      const isRateLimitError = errorMessage.includes('"code":429') || errorMessage.includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimitError && attempt < MAX_RETRIES - 1) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Exponential backoff with jitter
        console.warn(`Rate limit exceeded. Retrying in ${Math.round(delay / 1000)}s... (Attempt ${attempt})`);
        await sleep(delay);
      } else {
        // For non-rate-limit errors or if max retries are exhausted
        console.error(`Error generating ${count} quotes with Gemini (final attempt):`, error);
        return getMockQuotes(category, count); // Fallback to mock data on final error
      }
    }
  }

  // Fallback if the loop somehow completes without returning
  console.warn("generateQuotes loop completed without success, falling back to mock quotes.");
  return getMockQuotes(category, count);
};


export const generateQuote = async (category: string): Promise<Quote> => {
    // This now uses the batch function for efficiency, fetching just one quote.
    const quotes = await generateQuotes(category, 1);
    if (quotes && quotes.length > 0) {
        return quotes[0];
    }
    // Fallback if generateQuotes returns an empty array for some reason
    return getMockQuotes(category, 1)[0];
};

export const generateImage = async (prompt: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return base64ImageBytes;
        } else {
            throw new Error("No image was generated by the API.");
        }
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw error; // Re-throw to be handled by the caller
    }
};