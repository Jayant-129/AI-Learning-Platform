import { useState } from 'react';
import { useGetLearners } from '../hooks/useLearners';
import { mlAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import PredictionGauge from '../components/Charts/PredictionGauge';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

export default function PredictionsPage() {
  const { user } = useAuth();
  const { data: allLearners, isLoading } = useGetLearners();
  const learners = user?.role === 'MENTOR' ? allLearners?.filter(l => l.mentorId === user.id) : allLearners;
  const [predictions, setPredictions] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const handlePredict = async (learnerId) => {
    setLoadingId(learnerId);
    try {
      const res = await mlAPI.predict(learnerId);
      setPredictions((prev) => ({ ...prev, [learnerId]: res.data }));
      toast.success('Prediction completed!');
    } catch {
      toast.error('Prediction failed');
    } finally {
      setLoadingId(null);
    }
  };

  const handleBulkPredict = async () => {
    setBulkLoading(true);
    const results = {};
    for (const learner of (learners || []).slice(0, 20)) {
      try {
        const res = await mlAPI.predict(learner.id);
        results[learner.id] = res.data;
      } catch {
        // Skip failed predictions
      }
    }
    setPredictions((prev) => ({ ...prev, ...results }));
    setBulkLoading(false);
    toast.success(`${Object.keys(results).length} predictions completed!`);
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">AI Predictions</h1>
          <p className="text-surface-400 mt-1">Run ML-powered placement probability analysis</p>
        </div>
        <button
          onClick={handleBulkPredict}
          disabled={bulkLoading}
          className="btn-primary flex items-center gap-2"
        >
          {bulkLoading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
          ) : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg> Predict All</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(learners || []).map((learner) => {
          const pred = predictions[learner.id];
          return (
            <div key={learner.id} className="glass-card p-5 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-surface-100">{learner.name}</h3>
                  <p className="text-xs text-surface-400">{learner.studentId} • {learner.course || 'N/A'}</p>
                </div>
                <span className={`text-xs ${learner.gpa >= 8 ? 'text-emerald-400' : learner.gpa >= 6 ? 'text-amber-400' : 'text-rose-400'} font-semibold`}>
                  GPA: {learner.gpa?.toFixed(1) || '-'}
                </span>
              </div>

              {pred ? (
                <div className="flex flex-col items-center">
                  <PredictionGauge probability={pred.probability} size={140} />
                  <span className={`mt-2 ${pred.placeable ? 'badge-success' : 'badge-danger'}`}>
                    {pred.placeable ? 'Placeable' : 'Needs Work'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <button
                    onClick={() => handlePredict(learner.id)}
                    disabled={loadingId === learner.id}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    {loadingId === learner.id ? (
                      <><div className="w-3 h-3 border-2 border-surface-400/30 border-t-surface-400 rounded-full animate-spin" /> Running...</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                        Run Prediction
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
