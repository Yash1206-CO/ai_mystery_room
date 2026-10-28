import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCaseResult } from '../services/api';

export default function Results() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getCaseResult(id);
        setResult(res);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-neutral-400">Compiling official police verdict...</div>;
  if (error || !result) return <div className="text-center py-20 text-rose-400">{error || 'Verdict not available'}</div>;

  const isCorrect = result.status === 'solved' || result.accusation?.isCorrect;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Verdict Banner */}
      <div className={`p-8 rounded-3xl border shadow-2xl text-center space-y-3 ${
        isCorrect 
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' 
          : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
      }`}>
        <div className="text-5xl">{isCorrect ? '🏆' : '🚨'}</div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          {isCorrect ? 'CASE SOLVED! MASTER DETECTIVE' : 'COLD CASE — THE CULPRIT ESCAPED'}
        </h1>
        <p className="text-sm max-w-xl mx-auto opacity-90">
          {isCorrect 
            ? 'Your forensic analysis and deductive reasoning decisively pinned the true culprit.' 
            : 'An innocent suspect was falsely accused while the true mastermind slipped away into the shadows.'}
        </p>
      </div>

      {/* Score Breakdown Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📊</span> Detective Scorecard
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-center">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Base Points</span>
            <div className="text-2xl font-black text-white mt-1">+{result.score?.basePoints || 0}</div>
            <span className="text-[10px] text-neutral-400">{isCorrect ? 'Correct Accusation' : 'Failed Accusation'}</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-center">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Clue Discoveries</span>
            <div className="text-2xl font-black text-blue-400 mt-1">+{result.score?.clueBonus || 0}</div>
            <span className="text-[10px] text-neutral-400">+5 pts per discovered clue</span>
          </div>
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-center">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Hint Deductions</span>
            <div className="text-2xl font-black text-rose-400 mt-1">-{result.score?.hintPenalty || 0}</div>
            <span className="text-[10px] text-neutral-400">-10 pts per tactical hint</span>
          </div>
          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 text-center">
            <span className="text-xs text-amber-400 uppercase tracking-wider font-bold">Total Final Score</span>
            <div className="text-3xl font-black text-amber-400 mt-1">{result.score?.totalScore || 0}</div>
            <span className="text-[10px] text-neutral-400">Min floor: 0 pts</span>
          </div>
        </div>
      </div>

      {/* Culprit & Solution Unveiled */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-md uppercase tracking-wider">
            Forensic Dossier Unsealed
          </span>
          <h2 className="text-2xl font-black text-white mt-2">The True Solution Revealed</h2>
        </div>

        <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="text-xs text-neutral-500 uppercase font-semibold">True Culprit:</span>
              <h3 className="text-lg font-bold text-amber-400">{result.solution?.culpritName}</h3>
            </div>
            <span className="text-xs font-mono bg-neutral-900 px-3 py-1 rounded text-neutral-400">
              ID: {result.solution?.culpritSuspectId}
            </span>
          </div>
          <div className="text-xs space-y-1 pt-2 border-t border-neutral-800">
            <div><strong className="text-neutral-300">Motive:</strong> <span className="text-neutral-400">{result.solution?.motive}</span></div>
            <div><strong className="text-neutral-300">Method/Weapon:</strong> <span className="text-neutral-400">{result.solution?.method}</span></div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-neutral-200 uppercase tracking-wider">Chronological Case Breakdown</h3>
          <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950 p-5 rounded-2xl border border-neutral-800 whitespace-pre-line">
            {result.solution?.fullExplanation}
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-4">
          <Link
            to="/create"
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20 text-sm"
          >
            Solve Another Mystery
          </Link>
          <Link
            to={`/case/${id}`}
            className="px-6 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl transition text-sm"
          >
            Review Evidence Board
          </Link>
        </div>
      </div>
    </div>
  );
}
