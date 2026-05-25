import { useState } from 'react';
import { useGetAssessments, useCreateAssessment, useDeleteAssessment } from '../hooks/useAssessments';
import { useGetLearners } from '../hooks/useLearners';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useForm } from 'react-hook-form';

const TYPES = ['APTITUDE', 'CODING', 'COMMUNICATION', 'ATTENDANCE', 'MOCK_INTERVIEW'];

const TYPE_COLORS = {
  APTITUDE: 'bg-violet-500/20 text-violet-300',
  CODING: 'bg-blue-500/20 text-blue-300',
  COMMUNICATION: 'bg-emerald-500/20 text-emerald-300',
  ATTENDANCE: 'bg-amber-500/20 text-amber-300',
  MOCK_INTERVIEW: 'bg-rose-500/20 text-rose-300',
};

export default function AssessmentsPage() {
  const { user } = useAuth();
  const { data: allAssessments, isLoading } = useGetAssessments();
  const { data: allLearners } = useGetLearners();
  
  // Filter learners for mentor
  const learners = user?.role === 'MENTOR' 
    ? allLearners?.filter(l => l.mentorId === user.id) 
    : allLearners;

  // Optional: filter assessments so mentor only sees their assigned learners' assessments
  const assessments = user?.role === 'MENTOR' && learners
    ? allAssessments?.filter(a => learners.some(l => l.name === a.learner?.name || l.name === a.learnerName))
    : allAssessments;

  const createAssessment = useCreateAssessment();
  const deleteAssessment = useDeleteAssessment();
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const filtered = filterType === 'ALL'
    ? assessments
    : assessments?.filter(a => a.type === filterType);

  const onSubmit = (data) => {
    createAssessment.mutate({
      ...data,
      score: parseFloat(data.score),
      maxScore: parseFloat(data.maxScore || 100),
    }, {
      onSuccess: () => { setShowModal(false); reset(); },
    });
  };

  const getLearnerName = (assessment) => {
    return assessment?.learner?.name || assessment?.learnerName || '—';
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading assessments..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Assessments</h1>
          <p className="text-surface-400 mt-1">{filtered?.length || 0} assessments recorded</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Assessment
        </button>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', ...TYPES].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filterType === t
                ? 'bg-primary-600 text-white'
                : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-700/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Learner</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Score</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Assessed By</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Feedback</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700/30">
            {filtered?.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-surface-500">No assessments found. Add the first one.</td>
              </tr>
            ) : (
              filtered?.map((a) => {
                const pct = ((a.score / (a.maxScore || 100)) * 100).toFixed(0);
                return (
                  <tr key={a.id} className="hover:bg-surface-800/30 transition-colors">
                    <td className="px-6 py-4 text-surface-200 font-medium">{getLearnerName(a)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${TYPE_COLORS[a.type] || 'bg-surface-700 text-surface-300'}`}>
                        {a.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {a.score}/{a.maxScore || 100}
                      </span>
                      <span className="text-surface-500 text-xs ml-1">({pct}%)</span>
                    </td>
                    <td className="px-6 py-4 text-surface-300">{a.assessedBy || '—'}</td>
                    <td className="px-6 py-4 text-surface-400 text-sm max-w-xs truncate">{a.feedback || '—'}</td>
                    <td className="px-6 py-4 text-surface-400 text-sm">
                      {a.assessedAt ? new Date(a.assessedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { if (confirm('Delete this assessment?')) deleteAssessment.mutate(a.id); }}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Add Assessment">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Learner *</label>
            <select {...register('learnerId', { required: true })} className="input-field">
              <option value="">Select learner...</option>
              {learners?.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.studentId})</option>
              ))}
            </select>
            {errors.learnerId && <span className="text-xs text-rose-400">Required</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Type *</label>
              <select {...register('type', { required: true })} className="input-field">
                <option value="">Select type...</option>
                {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              {errors.type && <span className="text-xs text-rose-400">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Score *</label>
              <input {...register('score', { required: true })} type="number" step="0.1" className="input-field" placeholder="75" />
              {errors.score && <span className="text-xs text-rose-400">Required</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Max Score</label>
              <input {...register('maxScore')} type="number" defaultValue={100} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Assessed By</label>
              <input {...register('assessedBy')} className="input-field" placeholder="Mentor name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Feedback</label>
            <textarea {...register('feedback')} className="input-field" rows={3} placeholder="Add feedback..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={createAssessment.isPending} className="btn-primary flex-1">
              {createAssessment.isPending ? 'Saving...' : 'Add Assessment'}
            </button>
            <button type="button" onClick={() => { setShowModal(false); reset(); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
