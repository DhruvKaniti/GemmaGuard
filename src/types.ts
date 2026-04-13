export interface SafetyAnalysis {
  classification: 'SAFE' | 'UNSAFE' | 'BIASED' | 'UNKNOWN';
  riskLevel: 'Low' | 'Medium' | 'High';
  explanation: string; // 2-4 sentences
  detectedIssues: string[]; // List of bias, toxicity, or harmful patterns
  suggestedAction: 'allow' | 'review' | 'block' | 'rewrite';
  overallBiasScore: number; // 0 to 100
  objectivityScore: number; // 0 to 100
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface AnalysisResult {
  text: string;
  analysis: SafetyAnalysis;
  timestamp: number;
}
