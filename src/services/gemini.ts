import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Client
// NOTE: In a production app, this should be handled via a backend proxy to hide the API key.
// For this demo, we assume the user provides the key or it's in an env var.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface IdentificationResult {
    name: string;
    set: string;
    code: string;
    rarity: string;
    price: number;
    image: string;
    description: string;
}

export const identifyCard = async (base64Image: string): Promise<IdentificationResult> => {
    if (!API_KEY) {
        throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const prompt = `
    You are an expert in the One Piece Card Game. Identify the card in this image.
    Look specifically for the card code (e.g., OP01-004, ST01-001, EB01-001) which is usually located at the bottom right or bottom left of the card.
    
    Use the googleSearch tool to find the current market price for a Raw/Near Mint version of this card. Prioritize prices from TCGPlayer or similar reputable sites.
    Also find a high-quality official image URL for this card.

    Return the result as a strictly parseable JSON object with the following keys:
    - Name: The name of the character or card.
    - Set: The set name (e.g., Romance Dawn).
    - Code: The card ID (e.g., OP01-001).
    - Rarity: The rarity (e.g., L, SR, SEC, Alt Art).
    - Price: The market price in USD as a number (e.g., 12.50).
    - Image: A URL to the official card image.
    - Description: A brief description or trivia about the character or scene (max 2 sentences).

    JSON Output:
  `;

    try {
        const imagePart = {
            inlineData: {
                data: base64Image.split(',')[1], // Remove 'data:image/jpeg;base64,' prefix
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up the response to ensure it's valid JSON
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonString);

        return {
            name: data.Name,
            set: data.Set,
            code: data.Code,
            rarity: data.Rarity,
            price: typeof data.Price === 'string' ? parseFloat(data.Price.replace('$', '')) : data.Price,
            image: data.Image,
            description: data.Description,
        };
    } catch (error) {
        console.error("Error identifying card:", error);
        throw new Error("Failed to identify card. Please try again.");
    }
};
