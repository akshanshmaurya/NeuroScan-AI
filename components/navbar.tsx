"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b shadow-sm"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">NeuroScan AI</span>
          </motion.div>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <motion.div className="flex items-center space-x-6">
            {["Diagnosis", "Appointments", "Medical History", "Dashboard"].map((item) => (
              <Link 
                key={item}
                href={`/${item.toLowerCase().replace(' ', '-')}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <motion.span whileHover={{ y: -2 }} className="inline-block">
                  {item}
                </motion.span>
              </Link>
            ))}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="px-6">Sign In</Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}