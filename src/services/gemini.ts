import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Client
// NOTE: In a production app, this should be handled via a backend proxy to hide the API key.
// For this demo, we assume the user provides the key or it's in an env var.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

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
    
    1. **Locate the Card Code**: Look specifically for the card code (e.g., OP01-004, ST01-001, EB01-001, P-001) which is usually located at the bottom right or bottom left of the card.
    2. **Identify the Card**: Based on the visual art and the code, identify the Name, Set, and Rarity.
    3. **Estimate Price**: Estimate the current market price (USD) for a Raw/Near Mint copy.
    4. **Official Image**: Provide a URL to a high-quality official image of this card (e.g., from a card database).
    
    Return the result as a JSON object with the following keys:
    - "name": string
    - "set": string
    - "code": string (The card ID, e.g. OP01-001)
    - "rarity": string
    - "price": number (e.g. 12.50)
    - "image": string (URL)
    - "description": string (Brief trivia)

    If you cannot identify the card clearly, return "Unknown" for the name and 0 for the price.
  `;

    try {
        const imagePart = {
            inlineData: {
                data: base64Image.split(',')[1],
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini Raw Response:", text); // Debugging log

        const data = JSON.parse(text);

        return {
            name: data.name || "Unknown Card",
            set: data.set || "Unknown Set",
            code: data.code || "???",
            rarity: data.rarity || "Common",
            price: typeof data.price === 'string' ? parseFloat(data.price.replace('$', '')) : (data.price || 0),
            image: data.image || "",
            description: data.description || "No description available.",
        };
    } catch (error) {
        console.error("Error identifying card:", error);
        // Log the full error for debugging
        if (error instanceof Error) {
            console.error("Error details:", error.message);
        }
        throw new Error("Failed to identify card. Please try again.");
    }
};
