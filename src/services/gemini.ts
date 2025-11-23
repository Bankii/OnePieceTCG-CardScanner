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
    
    **Instructions:**
    1. **Analyze the Visuals**: First, look at the character, the scene, the colors, and the art style. Identify the character name and the specific version of the card (e.g., is it the Manga Rare, Alt Art, or standard?).
    2. **Locate the Code**: Try to find the card code (e.g., OP01-001, ST01-001) usually at the bottom. **If the code is unreadable or too small, rely entirely on the visual artwork to identify the card.**
    3. **Market Data**: Estimate the market price (USD) for a Raw/Near Mint copy.
    4. **Official Image**: Provide a URL to a high-quality official image.

    **Important**: Do NOT fail if you cannot read the code. Make your best guess based on the artwork.

    Return the result as a JSON object with the following keys:
    - "name": string
    - "set": string
    - "code": string (The card ID. If unreadable, infer it from the artwork or return "Unknown")
    - "rarity": string
    - "price": number
    - "image": string (URL)
    - "description": string

    If you absolutely cannot identify the character, only then return "Unknown".
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
        if (error instanceof Error) {
            throw new Error(error.message); // Pass the actual error message
        }
        throw new Error("Failed to parse the Log Pose (AI Error).");
    }
};
