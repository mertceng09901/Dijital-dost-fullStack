import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateAIResponse = async (prompt) => {
  try {
    // Use gemini-1.5-flash for faster, more reliable access instead of older/invalid pro strings
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("AI Generation Error:", error);
    
    // Instead of a hardcoded fallback string, throw a proper error to be handled by the controller
    throw new Error("Failed to communicate with AI service. Please try again later.");
  }
};