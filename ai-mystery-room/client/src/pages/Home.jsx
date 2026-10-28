import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          GenAI Interactive Deduction
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Step Into The Crime Scene.
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Solve dynamically generated, logically airtight whodunits synthesized by Gemini. 
          Interrogate suspects, uncover physical evidence, balance tactical hints, and name the culprit before they escape.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link 
            to="/create" 
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition transform hover:-translate-y-0.5 text-base"
          >
            Open Investigation Desk
          </Link>
        </div>
      </div>

      {/* Rules & Scoring Matrix */}
      <div className="grid md:grid-cols-2 gap-6 pt-6">
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-neutral-200 flex items-center gap-2">
            <span>⚖️</span> Detective Scoring Formula
          </h2>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
              <span>Correct Accusation (Easy)</span>
              <span className="font-semibold text-emerald-400">+100 pts</span>
            </li>
            <li className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
              <span>Correct Accusation (Medium)</span>
              <span className="font-semibold text-emerald-400">+150 pts</span>
            </li>
            <li className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
              <span>Correct Accusation (Hard)</span>
              <span className="font-semibold text-emerald-400">+200 pts</span>
            </li>
            <li className="flex items-center justify-between border-b border-neutral-800/60 pb-2">
              <span>Each Discovered Clue</span>
              <span className="font-semibold text-blue-400">+5 pts</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Tactical Hint Penalty</span>
              <span className="font-semibold text-rose-400">-10 pts</span>
            </li>
          </ul>
          <p className="text-xs text-neutral-500">Minimum score is anchored at 0. Scores are calculated deterministically on the secure backend.</p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-neutral-200 flex items-center gap-2">
            <span>🔍</span> Difficulty Tiers
          </h2>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-200">Easy</span>
                <p className="text-xs text-neutral-400">Direct clues and clear contradictions</p>
              </div>
              <span className="text-xs text-neutral-400">3 Suspects • 5 Clues • 2 Hints</span>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-200">Medium</span>
                <p className="text-xs text-neutral-400">Alibi overlaps and hidden motives</p>
              </div>
              <span className="text-xs text-neutral-400">4 Suspects • 7 Clues • 3 Hints</span>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-neutral-200">Hard</span>
                <p className="text-xs text-neutral-400">Intricate timelines, alibi webs & red herrings</p>
              </div>
              <span className="text-xs text-neutral-400">5 Suspects • 9 Clues • 3 Hints</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
