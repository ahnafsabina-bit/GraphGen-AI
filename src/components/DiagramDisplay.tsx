import React from 'react';
import { Download, Copy, RefreshCw, FileJson } from 'lucide-react';
import { motion } from 'motion/react';
import { DiagramResponse } from '../types';

interface DiagramDisplayProps {
  data: DiagramResponse;
  onRegenerate: () => void;
}

export const DiagramDisplay: React.FC<DiagramDisplayProps> = ({ data, onRegenerate }) => {
  const downloadSVG = () => {
    const blob = new Blob([data.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.title.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert('JSON copied to clipboard!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden"
    >
      <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{data.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{data.short_explanation}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-white rounded-lg transition-all duration-200"
            title="Regenerate"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="p-8 flex justify-center bg-white min-h-[400px] items-center overflow-auto">
        <div 
          className="max-w-full h-auto"
          dangerouslySetInnerHTML={{ __html: data.svg }} 
        />
      </div>

      <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {data.labels.map((label, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-white border border-slate-100 text-slate-600 text-xs font-medium rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={copyJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <FileJson size={16} />
            Copy JSON
          </button>
          <button
            onClick={downloadSVG}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-700 rounded-xl hover:bg-purple-800 shadow-lg shadow-purple-200 transition-all active:scale-95"
          >
            <Download size={16} />
            Download SVG
          </button>
        </div>
      </div>
    </motion.div>
  );
};
