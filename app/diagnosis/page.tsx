"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, AlertCircle, Check, RefreshCw } from "lucide-react";
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

  const handleAnalyze = async () => {
    if (!file || !preview) return;

    setAnalyzing(true);
    setPrediction(null);
    setConfidence(null);
    setProgress(25);

    const maxRetries = 3;
    let attempt = 0;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    while (attempt < maxRetries) {
      try {
        const response = await fetch(`${backendUrl}/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            image: preview.split(',')[1], // Remove data:image/jpeg;base64, prefix
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
        setPrediction(data.prediction);
        setConfidence(data.confidence);
        setProgress(100);
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

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 mt-16">
      <motion.h1 
        className="text-3xl font-bold mb-6"
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
          <Card className="p-4 h-full">
            <div 
              className={cn(
                "h-full flex flex-col space-y-4",
                "transition-all duration-200"
              )}
            >
              <div
                className={cn(
                  "flex-1 border-2 border-dashed rounded-lg",
                  "transition-colors duration-200",
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
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
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className="text-center p-4"
                      animate={{ scale: isDragging ? 1.1 : 1 }}
                    >
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your MRI scan or click to upload
                      </p>
                    </motion.div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
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
          <Card className="p-4 h-full">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              Analysis Results
              {analyzing && <RefreshCw className="ml-2 w-4 h-4 animate-spin" />}
            </h2>

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
                  <p className="text-sm text-center text-muted-foreground">
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
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">Diagnosis Result:</h3>
                    </div>
                    <p className="text-lg font-medium text-primary">{prediction}</p>
                    {confidence && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={confidence * 100} className="flex-1" />
                        <span className="text-sm text-muted-foreground">
                          {(confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
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
                  className="h-[200px] flex items-center justify-center text-muted-foreground"
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