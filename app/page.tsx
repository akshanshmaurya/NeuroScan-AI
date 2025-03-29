"use client";

import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, Activity, Users, Shield } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    { icon: <Activity className="w-6 h-6" />, title: "AI-Powered Analysis", description: "Upload brain MRI scans for instant AI analysis" },
    { icon: <Users className="w-6 h-6" />, title: "Expert Consultation", description: "Connect with specialized neurologists" },
    { icon: <Shield className="w-6 h-6" />, title: "Comprehensive Care", description: "Track your medical history" }
  ];

  return (
    <div 
      className="min-h-screen flex items-center pt-16 bg-cover bg-center" 
      style={{ backgroundImage: "url('/Background/Screenshot 2025-03-28 144806.png')" }}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center space-y-8"
        >
          <motion.div
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <Brain className="h-28 w-28 text-primary relative" />
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl font-bold tracking-tight leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NeuroScan AI Diagnostics
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Advanced brain MRI analysis powered by artificial intelligence
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/diagnosis">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto group text-lg px-8 py-6"
                >
                  Start Diagnosis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/appointment">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-lg px-8 py-6 hover:bg-primary/10"
                >
                  Book Appointment
                </Button>
              </Link>
            </motion.div>
          </div>
        
          <div className="grid md:grid-cols-3 gap-6 mt-12 w-full">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-card p-6 rounded-xl cursor-pointer border border-transparent hover:border-primary/50"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" 
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
              >
                <div className={`transition-colors duration-300 ${hoveredCard === index ? 'text-primary' : ''}`}>
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-md text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}