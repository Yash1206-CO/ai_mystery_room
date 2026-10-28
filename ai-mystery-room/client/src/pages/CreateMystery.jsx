import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../services/api';

const PREMISE_IDEAS = [
  "A priceless diamond necklace vanishes from a locked yacht safe in Monaco during a fireworks display.",
  "The lead quantum researcher at a deep-tech facility in Zurich is poisoned during a late-night server maintenance blackout.",
  "An eccentric vintage watch collector is found dead in his antique shop with all grandfather clocks stopped at exactly 11:14 PM.",
  "A Michelin-starred chef collapses in the kitchen moments before unveiling their final signature course at a private banquet."
];

export default function CreateMystery() {
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRandomize = () => {
    const random = PREMISE_IDEAS[Math.floor(Math.random() * PREMISE_IDEAS.length)];
    setPremise(random);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await createCase(premise, difficulty);
      if (res.success && res.caseId) {
        navigate(`/case/${res.caseId}`);
      } else {
        throw new Error('Case creation response did not return valid case ID.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to synthesize mystery. Please verify backend and Gemini API key.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create New Investigation</h2>
          <p className="text-sm text-neutral-400 mt-1">Configure your mystery premise and select your difficulty tier.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-neutral-300">Mystery Premise or Scenario</label>
              <button 
                type="button" 
                onClick={handleRandomize}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
              >
                🎲 Surprise Me
              </button>
            </div>
            <textarea
              rows={3}
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              placeholder="e.g. An eccentric antique collector vanishes from a sealed vault in Edinburgh..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { level: 'Easy', suspects: 3, clues: 5, hints: 2 },
                { level: 'Medium', suspects: 4, clues: 7, hints: 3 },
                { level: 'Hard', suspects: 5, clues: 9, hints: 3 }
              ].map(d => (
                <button
                  type="button"
                  key={d.level}
                  onClick={() => setDifficulty(d.level)}
                  className={`p-4 rounded-xl border text-left transition ${
                    difficulty === d.level 
                      ? 'border-amber-500 bg-amber-500/10 text-white' 
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="font-bold text-sm">{d.level}</div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    {d.suspects} Suspects<br/>{d.clues} Clues • {d.hints} Hints
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl text-base transition shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-neutral-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Synthesizing Mystery with Gemini AI...</span>
              </>
            ) : (
              <span>Dispatch Case to Investigation Room</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
