import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  MessageSquare, 
  TrendingUp,
  RefreshCcw,
  ExternalLink,
  Scale,
  Zap,
  History,
  Trash2,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { analyzeText } from './lib/gemini';
import { AnalysisResult } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const saveToHistory = async (analysisResult: AnalysisResult) => {
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisResult)
      });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to save history:', err);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeText(inputText);
      const newResult = {
        text: inputText,
        analysis,
        timestamp: Date.now(),
      };
      setResult(newResult);
      saveToHistory(newResult);
    } catch (err) {
      console.error(err);
      setError('Analysis failed. Please try again with different text.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setInputText('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 selection:bg-indigo-100">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] bg-slate-100 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight leading-none">GemmaGuard</h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1">Gemma Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHistory(true)}
              className="text-slate-500 hover:text-indigo-600"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-indigo-600">
              Docs
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex border-slate-200">
              <ExternalLink className="w-4 h-4 mr-2" />
              API
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="input-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold border border-indigo-100"
                >
                  <Zap className="w-3 h-3" />
                  Gemma 4 Powered Analysis
                </motion.div>
                <h2 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight text-slate-900">
                  AI for Truth. <span className="italic text-indigo-600">Gemma Powered.</span>
                </h2>
                <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                  A specialized detection engine built to combat misinformation and expose propaganda using Gemma's advanced reasoning.
                </p>
              </div>

              <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <Textarea
                      placeholder="Paste text here (min 50 characters)..."
                      className="min-h-[300px] border-none focus-visible:ring-0 text-lg p-8 resize-none bg-white"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">
                        {inputText.length} chars
                      </span>
                      <Button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing || inputText.length < 50}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all active:scale-95"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Run Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                {[
                  { icon: Scale, title: "Bias Scoring", desc: "Quantifies the level of partiality in the text." },
                  { icon: ShieldAlert, title: "Propaganda Check", desc: "Identifies 20+ known manipulation techniques." },
                  { icon: MessageSquare, title: "Contextual Insight", desc: "Explains why certain phrases are problematic." }
                ].map((feature, i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                      <feature.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-snug">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={reset}
                    className="mb-2 -ml-2 text-slate-500 hover:text-indigo-600"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    New Analysis
                  </Button>
                  <h2 className="text-3xl font-serif font-medium text-slate-900">Analysis Dashboard</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-mono">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary Stats */}
                <div className="lg:col-span-1 space-y-6">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        Bias Intensity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center py-4">
                        <span className={cn(
                          "text-7xl font-serif font-bold",
                          result.analysis.overallBiasScore > 70 ? "text-red-500" : 
                          result.analysis.overallBiasScore > 40 ? "text-amber-500" : "text-emerald-500"
                        )}>
                          {result.analysis.overallBiasScore}
                        </span>
                        <span className="text-slate-300 text-2xl font-light ml-1">/100</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-500">Neutral</span>
                          <span className="text-slate-500">Highly Biased</span>
                        </div>
                        <Progress 
                          value={result.analysis.overallBiasScore} 
                          className="h-2 bg-slate-100"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Key Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-sm font-medium text-slate-600">Objectivity</span>
                          </div>
                          <span className="text-sm font-bold">{result.analysis.objectivityScore}%</span>
                        </div>
                        <Progress value={result.analysis.objectivityScore} className="h-1.5 bg-slate-100" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-sm font-medium text-slate-600">Sentiment</span>
                          </div>
                          <Badge className={cn(
                            "capitalize",
                            result.analysis.sentiment === 'positive' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" :
                            result.analysis.sentiment === 'negative' ? "bg-red-100 text-red-700 hover:bg-red-100" :
                            "bg-slate-100 text-slate-700 hover:bg-slate-100"
                          )}>
                            {result.analysis.sentiment}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-sm font-medium text-slate-600">Leaning</span>
                          </div>
                          <Badge variant="outline" className="capitalize border-slate-200">
                            {result.analysis.politicalLeaning || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm bg-indigo-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <CardHeader>
                      <CardTitle className="text-sm font-mono uppercase tracking-wider opacity-80 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed italic">
                        "{result.analysis.recommendation}"
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Detailed Analysis */}
                <div className="lg:col-span-2 space-y-6">
                  <Tabs defaultValue="techniques" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-slate-100/50 p-1 border border-slate-200/60">
                      <TabsTrigger value="techniques">Techniques</TabsTrigger>
                      <TabsTrigger value="findings">Findings</TabsTrigger>
                      <TabsTrigger value="source">Source</TabsTrigger>
                      <TabsTrigger value="impact">Impact</TabsTrigger>
                      <TabsTrigger value="local" className="text-indigo-600 font-semibold">Gemma 4 Code</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="techniques" className="mt-6 space-y-4">
                      {result.analysis.propagandaTechniques.length > 0 ? (
                        result.analysis.propagandaTechniques.map((tech, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card className="border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-lg font-semibold text-slate-900">{tech.name}</CardTitle>
                                    <CardDescription className="text-slate-500 mt-1">{tech.description}</CardDescription>
                                  </div>
                                  <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-50">
                                    {Math.round(tech.confidence * 100)}% Confidence
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Instances:</h4>
                                  <div className="space-y-2">
                                    {tech.examples.map((ex, i) => (
                                      <div key={i} className="p-3 bg-slate-50 rounded-lg border-l-2 border-indigo-400 text-sm text-slate-700 italic">
                                        "{ex}"
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-20 text-center space-y-4 bg-white border border-dashed border-slate-200 rounded-xl">
                          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                          </div>
                          <p className="text-slate-500 font-medium">No propaganda techniques detected.</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="findings" className="mt-6">
                      <Card className="border-slate-200 shadow-sm">
                        <CardContent className="p-8">
                          <ul className="space-y-6">
                            {result.analysis.keyFindings.map((finding, i) => (
                              <li key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                  {i + 1}
                                </div>
                                <p className="text-slate-700 leading-relaxed">{finding}</p>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="source" className="mt-6">
                      <Card className="border-slate-200 shadow-sm">
                        <CardContent className="p-8">
                          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-serif">
                            {result.text}
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="impact" className="mt-6">
                      <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                        <CardHeader>
                          <CardTitle className="text-lg font-serif">Social Impact & Gemma</CardTitle>
                          <CardDescription>How this project serves the public interest.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                              <h4 className="font-bold text-slate-900 mb-1">Democratic Integrity</h4>
                              <p className="text-sm text-slate-600">Protects voters from manipulative political rhetoric and foreign influence operations.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                              <h4 className="font-bold text-slate-900 mb-1">Media Literacy</h4>
                              <p className="text-sm text-slate-600">Educates users on common propaganda techniques to build long-term critical thinking skills.</p>
                            </div>
                          </div>
                          <div className="p-6 rounded-xl bg-indigo-50 border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Why Gemma 4?
                            </h4>
                            <p className="text-sm text-indigo-800 leading-relaxed">
                              Gemma 4's 26B parameter architecture provides the nuanced linguistic understanding required to detect "soft" propaganda—techniques like <i>Framing</i> and <i>Omission</i> that smaller models often miss. By leveraging Gemma 4, we provide production-grade analysis that was previously only available to state-level actors.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="local" className="mt-6">
                      <Card className="border-slate-200 shadow-sm bg-slate-900 text-slate-100 overflow-hidden">
                        <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                          <CardTitle className="text-sm font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Gemma 4 Implementation (Python)
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            Use this snippet to run the analysis locally on your own hardware.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <pre className="p-6 text-xs font-mono overflow-x-auto leading-relaxed text-indigo-300">
{`import kagglehub
import torch
from transformers import AutoProcessor, AutoModelForCausalLM

# Download Gemma 4 Model
MODEL_PATH = kagglehub.model_download(
    "google/gemma-4/transformers/gemma-4-26b-a4b"
)

# Load model and processor
processor = AutoProcessor.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    dtype=torch.bfloat16,
    device_map="auto"
)

# Note: Requires ~52GB VRAM for full precision
# or ~16GB for 4-bit quantized inference.`}
                          </pre>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Technique Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.analysis.propagandaTechniques}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#64748b' }}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: '#64748b' }}
                              domain={[0, 1]}
                            />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                              {result.analysis.propagandaTechniques.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 border-t border-slate-200/60 py-12 bg-white">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-tight">GemmaGuard</span>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Built to empower citizens with AI-driven truth detection.
          </p>
        </div>
      </footer>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-lg">Analysis History</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <History className="w-12 h-12 text-slate-200 mx-auto" />
                    <p className="text-slate-400">No history yet.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div 
                      key={item.id}
                      className="group relative p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all cursor-pointer"
                      onClick={() => {
                        setResult(item);
                        setShowHistory(false);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={cn(
                          "text-[10px] px-1.5 py-0",
                          item.analysis.overallBiasScore > 70 ? "bg-red-100 text-red-600" : 
                          item.analysis.overallBiasScore > 40 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                        )}>
                          Score: {item.analysis.overallBiasScore}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2 font-serif italic mb-3">
                        "{item.text}"
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {item.analysis.propagandaTechniques.slice(0, 2).map((t: any, i: number) => (
                            <span key={i} className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                              {t.name}
                            </span>
                          ))}
                          {item.analysis.propagandaTechniques.length > 2 && (
                            <span className="text-[9px] text-slate-400">+{item.analysis.propagandaTechniques.length - 2} more</span>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryItem(item.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
