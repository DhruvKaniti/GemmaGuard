export interface BiasAnalysis {
  overallBiasScore: number; // 0 to 100
  sentiment: 'positive' | 'negative' | 'neutral';
  propagandaTechniques: {
    name: string;
    description: string;
    confidence: number;
    examples: string[];
  }[];
  politicalLeaning?: 'left' | 'right' | 'center' | 'unknown';
  objectivityScore: number; // 0 to 100
  keyFindings: string[];
  recommendation: string;
}

export interface AnalysisResult {
  text: string;
  analysis: BiasAnalysis;
  timestamp: number;
}
