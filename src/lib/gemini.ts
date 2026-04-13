import { GoogleGenAI, Type } from "@google/genai";
import { SafetyAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    classification: {
      type: Type.STRING,
      enum: ["SAFE", "UNSAFE", "BIASED", "UNKNOWN"],
      description: "The safety classification of the text.",
    },
    riskLevel: {
      type: Type.STRING,
      enum: ["Low", "Medium", "High"],
      description: "The risk level associated with the content.",
    },
    explanation: {
      type: Type.STRING,
      description: "A short reasoning for the classification in 2-4 sentences.",
    },
    detectedIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of any bias, toxicity, or harmful patterns identified.",
    },
    suggestedAction: {
      type: Type.STRING,
      enum: ["allow", "review", "block", "rewrite"],
      description: "The recommended next step for the user.",
    },
    overallBiasScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing the overall bias level.",
    },
    objectivityScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 representing how objective the text is.",
    },
    sentiment: {
      type: Type.STRING,
      enum: ["positive", "negative", "neutral"],
      description: "The general sentiment of the text.",
    },
  },
  required: [
    "classification",
    "riskLevel",
    "explanation",
    "detectedIssues",
    "suggestedAction",
    "overallBiasScore",
    "objectivityScore",
    "sentiment",
  ],
};

export async function analyzeText(text: string): Promise<SafetyAnalysis> {
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
            text: `You are a professional AI safety and content moderation assistant powered by Gemma. 
            Your mission is to analyze text for safety, bias, and harmful patterns.
            
            Analyze the following text with extreme precision. Identify toxicity, hate speech, misinformation, political bias, and logical fallacies.
            
            Text to analyze:
            """
            ${text}
            """`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: "You are an expert AI safety tool. Your goal is to classify content as SAFE, UNSAFE, or BIASED. Provide a structured, consistent analysis in JSON format. Be objective, professional, and concise.",
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
    },
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("Failed to get analysis from AI");
  }

  return JSON.parse(resultText) as SafetyAnalysis;
}
