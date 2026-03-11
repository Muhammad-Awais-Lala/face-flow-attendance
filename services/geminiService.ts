
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { Employee, RecognitionResult } from "../types";
import { storageService } from "./storageService";

const MAX_RETRIES = 2;
const INITIAL_BACKOFF = 2000; // 2 seconds

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function recognizeEmployee(
  currentFrameBase64: string,
  employees: Employee[],
  retryCount = 0
): Promise<RecognitionResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const settings = storageService.getSettings();

  if (employees.length === 0) {
    return { matchId: null, confidence: 0, message: "No employees registered yet." };
  }

  const cleanBase64 = (str: string) => str.split(",")[1] || str;

  const prompt = `
    Identity Verification Protocol:
    1. IMAGE VALIDATION: Verify if a human face is clearly visible, centered, and facing forward in 'CURRENT_SCAN'.
    2. REJECTION CRITERIA: If the face is missing, partially out of frame, blurred, or obscured, return 'matchId': null and 'message': "ALIGNMENT FAILED: Face not detected within frame".
    3. BIOMETRIC MATCHING: If validation passes, compare the face to 'GALLERY'.
    4. CONFIDENCE: Only return a matchId if confidence is >${Math.round(settings.confidenceThreshold * 100)}%.
    
    Return pure JSON.
  `;

  const parameters: GenerateContentParameters = {
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: prompt },
        { text: "CURRENT_SCAN:" },
        { inlineData: { mimeType: "image/jpeg", data: cleanBase64(currentFrameBase64) } },
        { text: "GALLERY:" },
        ...employees.flatMap((emp, i) => [
          { text: `Ref ${i + 1}: ${emp.name} (ID: ${emp.id})` },
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64(emp.photoBase64) } }
        ])
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchId: { type: Type.STRING, description: "Matching ID or null" },
          confidence: { type: Type.NUMBER, description: "0 to 1" },
          message: { type: Type.STRING, description: "Status message" }
        },
        required: ["matchId", "confidence", "message"]
      }
    }
  };

  try {
    const response = await ai.models.generateContent(parameters);
    storageService.trackApiCall(false);
    const result = JSON.parse(response.text || "{}");
    return {
      matchId: result.matchId,
      confidence: result.confidence,
      message: result.message
    };
  } catch (error: any) {
    console.error("Recognition Error:", error);
    
    // Improved detection of 429 quota errors based on the structure provided by the user
    const errorStr = (error?.message || JSON.stringify(error) || "").toLowerCase();
    const isQuotaError = 
      error?.status === 429 || 
      error?.code === 429 ||
      errorStr.includes("429") || 
      errorStr.includes("quota") ||
      errorStr.includes("resource_exhausted") ||
      errorStr.includes("limit reached");

    if (isQuotaError && retryCount < MAX_RETRIES) {
      const waitTime = INITIAL_BACKOFF * Math.pow(2, retryCount);
      console.warn(`Gemini Quota limit hit. Retrying attempt ${retryCount + 1} in ${waitTime}ms...`);
      await sleep(waitTime);
      return recognizeEmployee(currentFrameBase64, employees, retryCount + 1);
    }

    storageService.trackApiCall(isQuotaError);
    
    if (isQuotaError) {
      return { 
        matchId: "QUOTA_EXCEEDED", 
        confidence: 0, 
        message: "API Quota Limit Exhausted. Please wait or upgrade your billing plan at ai.google.dev." 
      };
    }
    
    return { 
      matchId: null, 
      confidence: 0, 
      message: "Biometric service communication error. Check your connection." 
    };
  }
}
