import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CreateMystery from './pages/CreateMystery';
import InvestigationRoom from './pages/InvestigationRoom';
import Accusation from './pages/Accusation';
import Results from './pages/Results';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col selection:bg-amber-500 selection:text-black">
        {/* Navigation Bar */}
        <header className="border-b border-neutral-800 bg-neutral-900/70 backdrop-blur px-6 py-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <span className="text-2xl">🕵️‍♂️</span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition">
                  AI Mystery Room
                </h1>
                <p className="text-xs text-neutral-400">Powered by Gemini & Node.js</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                to="/create" 
                className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold px-4 py-2 rounded-lg text-sm transition shadow-md shadow-amber-500/10"
              >
                + New Case
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateMystery />} />
            <Route path="/case/:id" element={<InvestigationRoom />} />
            <Route path="/case/:id/accuse" element={<Accusation />} />
            <Route path="/case/:id/result" element={<Results />} />
          </Routes>
        </main>

        <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-500">
          AI Mystery Room — Detective Deduction Engine • Built for AI Mystery Room Project
        </footer>
      </div>
    </BrowserRouter>
  );
}
