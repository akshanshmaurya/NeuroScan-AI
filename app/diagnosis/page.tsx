"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, AlertCircle, Check, RefreshCw, Lightbulb, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DiagnosisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const handleAnalyze = async () => {
    if (!file || !preview) return;

    setAnalyzing(true);
    setPrediction(null);
    setConfidence(null);
    setSuggestions(null);
    setProgress(25);

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const base64Image = preview.split(',')[1];
        if (!base64Image) {
          throw new Error('Invalid image format. Please upload a valid image.');
        }

        const response = await fetch(`${backendUrl}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
          }),
        });

        setProgress(75);

        if (!response.ok) {
          throw new Error(
            response.status === 404 ? 'Backend service not found' :
            response.status === 500 ? 'Internal server error' :
            'Failed to get prediction'
          );
        }

        const data = await response.json();
        const diagnosisResult = data?.prediction || 'No prediction available';
        setPrediction(diagnosisResult);
        setConfidence(data?.confidence || 0);
        setProgress(100);

        // Get suggestions after successful diagnosis
        if (diagnosisResult !== 'No prediction available') {
          await getSuggestionsFromBackend(diagnosisResult);
        }

        break;
      } catch (error: any) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        attempt++;

        if (attempt === maxRetries) {
          setPrediction(
            error.message === 'Failed to fetch' 
              ? 'Cannot connect to server. Please ensure the backend is running.'
              : `Analysis failed: ${error.message}`
          );
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
        }
      }
    }

    setAnalyzing(false);
  };

  const getSuggestionsFromBackend = async (diagnosisResult: string) => {
    setLoadingSuggestions(true);
    setSuggestions(null);

    try {
      const response = await fetch(`${backendUrl}/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ diagnosis: diagnosisResult }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data?.suggestions || 'No suggestions available.');
    } catch (error: any) {
      console.error('Error getting suggestions:', error);
      setSuggestions('Unable to retrieve suggestions at this time. Please try again later.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleDownloadReport = () => {
    if (!prediction || !confidence) return;

    const reportContent = `
      MRI Analysis Report
      ===================
      Prediction: ${prediction}
      Confidence: ${(confidence * 100).toFixed(1)}%
      Suggestions: ${suggestions || "No suggestions available."}
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "MRI_Analysis_Report.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 mt-16">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center text-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        MRI Analysis Dashboard
      </motion.h1>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div 
          className="md:col-span-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-6 shadow-lg h-[400px]">
            <div 
              className={cn(
                "flex flex-col space-y-4 h-full",
                "transition-all duration-200"
              )}
            >
              <div
                className={cn(
                  "flex-1 border-2 border-dashed rounded-lg p-4",
                  "transition-colors duration-200",
                  isDragging ? "border-primary bg-primary/10" : "border-gray-300",
                  "relative overflow-hidden"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {preview ? (
                  <motion.img 
                    src={preview} 
                    alt="MRI Preview" 
                    className="w-full h-full object-contain rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center h-full">
                    <motion.div 
                      className="text-center p-4"
                      animate={{ scale: isDragging ? 1.1 : 1 }}
                    > 
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Drag and drop your MRI scan or click to upload
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="mri-upload"
                />
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById('mri-upload')?.click()}
                >
                  Select File
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAnalyze}
                  disabled={!file || analyzing}
                >
                  {analyzing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="p-6 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Analysis Results</h2>
            <p className="text-sm text-gray-500 mb-4">Date: {currentDate}</p>
            <AnimatePresence mode="wait">
              {analyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-gray-500">
                    Processing scan... {progress}%
                  </p>
                </motion.div>
              ) : prediction ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">Diagnosis Result:</h3>
                    </div>
                    <p className="text-lg font-medium text-primary">{prediction}</p>
                    {confidence && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={confidence * 100} className="flex-1" />
                        <span className="text-sm text-gray-500">
                          {(confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Gemini AI Suggestions Section */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">AI Suggestions:</h3>
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {loadingSuggestions ? (
                        <motion.div
                          key="loading-suggestions"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 py-2"
                        >
                          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                          <p className="text-sm text-gray-500">
                            Getting personalized suggestions...
                          </p>
                        </motion.div>
                      ) : suggestions ? (
                        <motion.div
                          key="suggestions"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <p className="text-sm text-gray-700 whitespace-pre-line">{suggestions}</p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="no-suggestions"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <p className="text-sm text-gray-500">
                            No suggestions available.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleDownloadReport}
                  >
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                  
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500">
                      This is an AI-assisted analysis. Please consult with a healthcare professional for accurate medical advice.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center text-gray-500"
                >
                  Upload an MRI scan to begin analysis
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}