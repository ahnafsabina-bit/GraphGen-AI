import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DiagramResponse, Category } from '../types';
import { DiagramDisplay } from './DiagramDisplay';

const CATEGORIES: Category[] = ["General", "Biology", "Physics", "Chemistry", "Math"];

export const DiagramGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<Category>("General");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagram, setDiagram] = useState<DiagramResponse | null>(null);

  // Load cached result on mount
  useEffect(() => {
    const cached = localStorage.getItem('last_diagram');
    if (cached) {
      try {
        setDiagram(JSON.parse(cached));
      } catch (e) {
        localStorage.removeItem('last_diagram');
      }
    }
  }, []);

  const generateDiagram = async () => {
    if (!topic.trim()) {
      setError("Please enter a scientific topic");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-diagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate diagram';
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) {
            errorMessage = errJson.error;
          }
        } catch (_) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setDiagram(data);
      localStorage.setItem('last_diagram', JSON.stringify(data));
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      generateDiagram();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold tracking-widest uppercase rounded-full mb-4 border border-purple-100"
        >
          <Sparkles size={12} />
          AI-Powered Visualization
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          GenGraph <span className="text-purple-700">AI</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Convert complex scientific concepts into clear, beautiful diagrams in seconds.
        </p>
      </div>

      <div className="bg-white p-2 rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 mb-12">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Photosynthesis process, Internal combustion engine..."
              className="w-full pl-12 pr-4 py-4 bg-transparent text-slate-800 placeholder:text-slate-400 focus:outline-none text-lg"
            />
          </div>
          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="px-4 py-4 bg-slate-50 text-slate-600 font-medium rounded-2xl focus:outline-none border-none cursor-pointer hover:bg-slate-100 transition-colors"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={generateDiagram}
            disabled={loading}
            className="md:px-8 py-4 bg-purple-700 text-white font-bold rounded-2xl hover:bg-purple-800 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Diagram"
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
          >
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}

        {diagram && !loading && (
          <DiagramDisplay 
            key={diagram.title} 
            data={diagram} 
            onRegenerate={generateDiagram} 
          />
        )}

        {!diagram && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl"
          >
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-400 font-medium">Enter a topic above to generate a diagram</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
