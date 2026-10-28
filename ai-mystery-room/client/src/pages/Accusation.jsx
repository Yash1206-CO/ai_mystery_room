import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCase, submitAccusation } from '../services/api';

export default function Accusation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getCase(id);
        if (res.case.status !== 'active') {
          navigate(`/case/${id}/result`);
        }
        setCaseData(res.case);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSuspectId) {
      alert('Please select a suspect to accuse.');
      return;
    }

    if (!confirm('Are you sure you want to finalize this accusation? This will permanently close the case and reveal the solution.')) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitAccusation(id, selectedSuspectId, notes);
      if (res.success) {
        navigate(`/case/${id}/result`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Accusation failed');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-neutral-400">Loading accusation chamber...</div>;
  if (error || !caseData) return <div className="text-center py-20 text-rose-400">Case not found</div>;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="border-b border-neutral-800 pb-4">
          <div className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            Critical Decision Point
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Formal Case Accusation</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Review the evidence carefully. Once submitted, the case file is permanently sealed, the true culprit is unmasked, and your final score is recorded.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-200">Select the Prime Suspect</label>
            <div className="grid gap-3">
              {caseData.suspects.map((suspect) => (
                <label
                  key={suspect.id}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition ${
                    selectedSuspectId === suspect.id
                      ? 'border-rose-500 bg-rose-500/10 text-white'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="suspect"
                      value={suspect.id}
                      checked={selectedSuspectId === suspect.id}
                      onChange={() => setSelectedSuspectId(suspect.id)}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <div>
                      <div className="font-bold text-white text-sm">{suspect.name}</div>
                      <div className="text-xs text-neutral-400">{suspect.role} — {suspect.relationshipToVictim}</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-neutral-500">{suspect.id}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-200">Detective Deduction Notes (Optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State your conclusive reasoning: which clue dismantled their alibi? What was their weapon/motive?"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-4">
            <Link
              to={`/case/${id}`}
              className="px-5 py-3 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-sm font-semibold transition"
            >
              ← Back to Investigation
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-rose-600/20"
            >
              {submitting ? 'Verifying Accusation with Forensics...' : 'Deliver Final Verdict'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
