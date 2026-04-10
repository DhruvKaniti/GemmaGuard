import { GoogleGenAI, Type } from "@google/genai";
import { BiasAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    overallBiasScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing the overall bias level.",
    },
    sentiment: {
      type: Type.STRING,
      description: "The general sentiment of the text.",
      enum: ["positive", "negative", "neutral"],
    },
    propagandaTechniques: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the technique (e.g., Loaded Language, Appeal to Fear)." },
          description: { type: Type.STRING, description: "Brief explanation of the technique." },
          confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1." },
          examples: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific snippets from the text." },
        },
        required: ["name", "description", "confidence", "examples"],
      },
    },
    politicalLeaning: {
      type: Type.STRING,
      description: "Detected political leaning if applicable.",
      enum: ["left", "right", "center", "unknown"],
    },
    objectivityScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing how objective the text is.",
    },
    keyFindings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key points identified during analysis.",
    },
    recommendation: {
      type: Type.STRING,
      description: "A recommendation for the reader to consider.",
    },
  },
  required: [
    "overallBiasScore",
    "sentiment",
    "propagandaTechniques",
    "objectivityScore",
    "keyFindings",
    "recommendation",
  ],
};

export async function analyzeText(text: string): Promise<BiasAnalysis> {
  if (!text.trim()) {
    throw new Error("Text is empty");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are a specialized Gemma-powered linguistic analyst. 
            Your mission is to detect bias and propaganda techniques in text to promote media literacy and democratic integrity.
            Analyze the following text with extreme precision, identifying subtle manipulation techniques like framing, loaded language, and logical fallacies.
            
            Text to analyze:
            """
            ${text}
            """`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: "You are an expert in media literacy, linguistics, and propaganda analysis. Your goal is to detect bias, logical fallacies, and propaganda techniques in provided text. Provide a structured analysis in JSON format.",
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("Failed to get analysis from AI");
  }

  return JSON.parse(resultText) as BiasAnalysis;
}
