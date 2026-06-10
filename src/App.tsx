/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DiagramGenerator } from './components/DiagramGenerator';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-purple-100 selection:text-purple-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center text-white font-black text-xl">G</div>
            <span className="font-bold text-slate-800 tracking-tight">GenGraph AI</span>
          </div>
          <nav className="hidden sm:flex gap-6">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-500 hover:text-slate-900">About</a>
          </nav>
        </div>
      </header>

      <main>
        <DiagramGenerator />
        
        <section id="about" className="max-w-4xl mx-auto px-4 py-20 border-t border-slate-100">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">About GenGraph AI</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-slate-600 leading-relaxed mb-4">
                  GenGraph AI is a cutting-edge scientific visualization tool designed to bridge the gap between complex concepts and visual understanding.
                </p>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <p className="text-sm font-semibold text-purple-900 mb-1">Creator</p>
                  <p className="text-slate-700 font-medium">Ahnaf Muttaki</p>
                  <p className="text-xs text-slate-500">Class 10, Milestone School and College</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0 mt-1">
                    <span className="text-xs font-bold font-serif italic">M</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    This application is a proud component of the <span className="font-bold text-purple-900">MSC AI</span> ecosystem, dedicated to educational technological advancement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400">
            Powered by Gemini 3.5 Flash • Component of MSC AI
          </p>
        </div>
      </footer>
    </div>
  );
}
