import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCase, discoverClue, requestHint } from '../services/api';

export default function InvestigationRoom() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clues');
  const [discoveringClueId, setDiscoveringClueId] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await getCase(id);
      setCaseData(res.case);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoverClue = async (clueId) => {
    try {
      setDiscoveringClueId(clueId);
      const res = await discoverClue(id, clueId);
      if (res.success) {
        setCaseData(prev => ({
          ...prev,
          clues: prev.clues.map(c => c.id === clueId ? res.clue : c)
        }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to discover clue');
    } finally {
      setDiscoveringClueId(null);
    }
  };

  const handleRequestHint = async () => {
    try {
      setHintLoading(true);
      const res = await requestHint(id);
      if (res.success) {
        setCaseData(prev => ({
          ...prev,
          hints: prev.hints.map(h => h.id === res.hint.id ? res.hint : h)
        }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'No hints available');
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-neutral-400 space-y-3">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
        <p>Accessing secure police archives...</p>
      </div>
    );
  }

  if (error || !caseData) {
    return <div className="text-center py-20 text-rose-400">{error || 'Case file not found'}</div>;
  }

  const discoveredCount = caseData.clues.filter(c => c.isDiscovered).length;
  const hintsUnlocked = caseData.hints.filter(h => h.isUnlocked).length;
  const availableHints = caseData.hints.length - hintsUnlocked;

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Case Header Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-md uppercase tracking-wider">
                {caseData.difficulty} Tier
              </span>
              <span className="text-xs text-neutral-400">File ID: #{caseData._id.slice(-6)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{caseData.title}</h1>
          </div>
          <Link
            to={`/case/${id}/accuse`}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20 flex items-center space-x-2 text-sm"
          >
            <span>⚖️ Make Accusation</span>
          </Link>
        </div>

        {/* Story details */}
        <div className="grid md:grid-cols-3 gap-4 text-xs bg-neutral-950 p-4 rounded-2xl border border-neutral-800/80">
          <div>
            <span className="text-neutral-500 uppercase tracking-wider font-semibold">Victim:</span>
            <p className="text-neutral-200 font-medium text-sm mt-0.5">{caseData.story?.victim}</p>
          </div>
          <div>
            <span className="text-neutral-500 uppercase tracking-wider font-semibold">Crime Scene:</span>
            <p className="text-neutral-200 font-medium text-sm mt-0.5">{caseData.story?.crimeScene}</p>
          </div>
          <div>
            <span className="text-neutral-500 uppercase tracking-wider font-semibold">Time of Incident:</span>
            <p className="text-neutral-200 font-medium text-sm mt-0.5">{caseData.story?.timeOfIncident}</p>
          </div>
          <div className="md:col-span-3 pt-2 border-t border-neutral-800/60">
            <span className="text-neutral-500 uppercase tracking-wider font-semibold">Incident Overview:</span>
            <p className="text-neutral-300 text-sm mt-1 leading-relaxed">{caseData.story?.background}</p>
          </div>
        </div>

        {/* Live Investigation Tracker Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs bg-neutral-900 px-4 py-3 rounded-xl border border-neutral-800 gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-neutral-400">Clues Examined:</span>{' '}
              <span className="font-bold text-amber-400">{discoveredCount} / {caseData.clues.length}</span>
              <span className="text-neutral-500 ml-1">(+{discoveredCount * 5} pts)</span>
            </div>
            <div>
              <span className="text-neutral-400">Hints Unlocked:</span>{' '}
              <span className="font-bold text-rose-400">{hintsUnlocked} / {caseData.hints.length}</span>
              <span className="text-neutral-500 ml-1">(-{hintsUnlocked * 10} pts)</span>
            </div>
          </div>
          <button
            onClick={handleRequestHint}
            disabled={availableHints === 0 || hintLoading}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 font-semibold rounded-lg text-xs transition"
          >
            {hintLoading ? 'Decoding...' : `💡 Call Forensics for Hint (${availableHints} left)`}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 space-x-8">
        <button
          onClick={() => setActiveTab('clues')}
          className={`pb-3 font-semibold text-sm transition relative ${
            activeTab === 'clues' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          🔍 Physical Clues & Forensic Evidence ({discoveredCount}/{caseData.clues.length})
        </button>
        <button
          onClick={() => setActiveTab('suspects')}
          className={`pb-3 font-semibold text-sm transition relative ${
            activeTab === 'suspects' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          👥 Suspect Dossiers ({caseData.suspects.length})
        </button>
        <button
          onClick={() => setActiveTab('hints')}
          className={`pb-3 font-semibold text-sm transition relative ${
            activeTab === 'hints' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          💡 Unlocked Clues & Hints ({hintsUnlocked})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'clues' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {caseData.clues.map((clue) => (
            <div 
              key={clue.id} 
              className={`p-5 rounded-2xl border transition ${
                clue.isDiscovered 
                  ? 'bg-neutral-900 border-neutral-700' 
                  : 'bg-neutral-950 border-neutral-800/80 border-dashed'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  📍 {clue.location}
                </span>
                {clue.isDiscovered ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">✓ Discovered</span>
                ) : (
                  <span className="text-xs text-neutral-500 font-mono">Unexamined</span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-3">{clue.title}</h3>
              {clue.isDiscovered ? (
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
                  {clue.description}
                </p>
              ) : (
                <div className="mt-4">
                  <button
                    onClick={() => handleDiscoverClue(clue.id)}
                    disabled={discoveringClueId === clue.id}
                    className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold rounded-xl transition"
                  >
                    {discoveringClueId === clue.id ? 'Analyzing with Luminol...' : 'Examine Clue (+5 pts)'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'suspects' && (
        <div className="grid sm:grid-cols-2 gap-6">
          {caseData.suspects.map((suspect) => (
            <div key={suspect.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{suspect.name}</h3>
                  <span className="text-xs text-amber-400 font-medium">{suspect.role}</span>
                </div>
                <span className="text-xs bg-neutral-800 px-2.5 py-1 rounded-full text-neutral-400 font-mono">
                  {suspect.id}
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">{suspect.bio}</p>
              <div className="pt-2 border-t border-neutral-800 text-xs space-y-1">
                <div>
                  <strong className="text-neutral-300">Relationship:</strong>{' '}
                  <span className="text-neutral-400">{suspect.relationshipToVictim}</span>
                </div>
                <div>
                  <strong className="text-neutral-300">Stated Alibi:</strong>{' '}
                  <span className="text-neutral-400">{suspect.alibi}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'hints' && (
        <div className="space-y-4">
          {caseData.hints.filter(h => h.isUnlocked).length === 0 ? (
            <div className="text-center py-12 text-neutral-500 bg-neutral-900/40 rounded-2xl border border-neutral-800">
              No hints requested yet. Click "Call Forensics for Hint" above if you get stuck (-10 pts penalty each).
            </div>
          ) : (
            caseData.hints.filter(h => h.isUnlocked).map((hint, idx) => (
              <div key={hint.id} className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-4">
                <span className="text-xl">💡</span>
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tactical Hint #{idx + 1}</div>
                  <p className="text-sm text-neutral-200 mt-1">{hint.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
