import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  RefreshCw, 
  ChevronRight,
  Layers,
  Palette,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { replaceBackground } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PRESET_BACKGROUNDS = [
  { id: 'luxury-office', name: 'Luxury Office', prompt: 'a high-end modern luxury office with large windows and city view, soft cinematic lighting', preview: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80' },
  { id: 'tropical-beach', name: 'Tropical Beach', prompt: 'a serene tropical beach at sunset with palm trees and turquoise water, golden hour lighting', preview: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80' },
  { id: 'cyberpunk', name: 'Cyberpunk City', prompt: 'a futuristic cyberpunk city street at night with neon signs and rain puddles, vibrant colors', preview: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=300&q=80' },
  { id: 'minimalist-studio', name: 'Minimalist Studio', prompt: 'a clean minimalist photo studio with soft grey background and professional studio lighting', preview: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80' },
  { id: 'mountain-lake', name: 'Mountain Lake', prompt: 'a breathtaking mountain lake with snow-capped peaks and crystal clear reflection, morning mist', preview: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80' },
  { id: 'vintage-library', name: 'Vintage Library', prompt: 'an old vintage library with floor-to-ceiling bookshelves and warm mahogany wood, cozy atmosphere', preview: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=300&q=80' },
];

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        setProcessedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  } as any);

  const handleProcess = async (prompt: string) => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const result = await replaceBackground(originalImage, prompt);
      setProcessedImage(result);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'enhanced-photo.png';
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setCustomPrompt('');
    setSelectedPreset(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wand2 className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Lumina</h1>
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Photo Enhancer</p>
            </div>
          </div>
          
          {originalImage && (
            <button 
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!originalImage ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                Transform your photos in seconds.
              </h2>
              <p className="text-lg text-white/40">
                Upload a photo and let AI replace the background with stunning, professional environments.
              </p>
            </div>

            <div 
              {...getRootProps()} 
              className={cn(
                "relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 aspect-[4/3] flex flex-col items-center justify-center gap-6",
                isDragActive ? "border-emerald-500 bg-emerald-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/5"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-white/40 group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-xl font-medium mb-1">Drop your photo here</p>
                <p className="text-sm text-white/40">or click to browse from your device</p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-white/10" />
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10" />
              <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-white/10" />
              <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-white/10" />
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left: Preview Area */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div 
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 animate-pulse" />
                      </div>
                      <p className="mt-6 text-lg font-medium tracking-tight">Enhancing your photo...</p>
                      <p className="text-sm text-white/40">This usually takes about 10-15 seconds</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <img 
                  src={processedImage || originalImage} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />

                {processedImage && !isProcessing && (
                  <div className="absolute bottom-6 right-6 flex gap-3">
                    <button 
                      onClick={handleDownload}
                      className="px-6 py-3 bg-white text-black rounded-xl font-semibold flex items-center gap-2 hover:bg-emerald-500 hover:text-black transition-all shadow-xl"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}
            </div>

            {/* Right: Controls Area */}
            <div className="lg:col-span-5 space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Palette className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Preset Backgrounds</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {PRESET_BACKGROUNDS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPreset(preset.id);
                        handleProcess(preset.prompt);
                      }}
                      disabled={isProcessing}
                      className={cn(
                        "group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300",
                        selectedPreset === preset.id ? "border-emerald-500 ring-4 ring-emerald-500/20" : "border-white/5 hover:border-white/20"
                      )}
                    >
                      <img 
                        src={preset.preview} 
                        alt={preset.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                        <span className="text-xs font-medium">{preset.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <div className="h-px bg-white/5" />

              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Custom AI Generation</h3>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe your dream background... (e.g., 'a cozy cabin in a snowy forest with northern lights')"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-h-[120px] resize-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPreset(null);
                      handleProcess(customPrompt);
                    }}
                    disabled={isProcessing || !customPrompt.trim()}
                    className="w-full py-4 bg-emerald-500 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Wand2 className="w-5 h-5" />
                    )}
                    Generate Custom Background
                  </button>
                </div>
              </section>

              <section className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-white/40" />
                  <h4 className="text-sm font-medium">How it works</h4>
                </div>
                <ul className="space-y-3 text-sm text-white/40">
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-mono">01</span>
                    AI detects the subject in your photo
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-mono">02</span>
                    It removes the existing background
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-500 font-mono">03</span>
                    Generates a new environment and blends it realistically
                  </li>
                </ul>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white/20">
            <Wand2 className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-widest">Powered by Gemini AI</span>
          </div>
          <div className="flex gap-8 text-xs font-medium uppercase tracking-widest text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
