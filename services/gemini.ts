import { GoogleGenAI, Type } from "@google/genai";
import { CheckResult } from '../types';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeHandwriting = async (
  imageBase64: string,
  targetText: string
): Promise<CheckResult> => {
  try {
    // Remove header from base64 if present
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const prompt = `
      Look at this image of handwriting. 
      The user is a child trying to write the Turkish syllable "${targetText}".
      
      Strictly evaluate if the handwriting legibly represents "${targetText}".
      Ignore minor imperfections typical of a child's handwriting.
      However, if it looks like a completely different letter, scribbles, or is empty, mark it as false.
      
      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: {
              type: Type.BOOLEAN,
              description: "True if the handwriting matches the target syllable, false otherwise."
            },
            reason: {
              type: Type.STRING,
              description: "A very short explanation (max 5 words) if wrong."
            }
          },
          required: ["isCorrect"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(resultText) as CheckResult;
    return result;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fail gracefully implies strictness on error, or you could return true for testing. 
    // We will return false with a generic error reason.
    return { isCorrect: false, reason: "Hata oluştu" };
  }
};
