import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetLearner, useUpdateLearner } from '../hooks/useLearners';
import { useGetMentors } from '../hooks/useUsers';
import { useGetApplicationsByLearner } from '../hooks/usePlacements';
import { mlAPI } from '../utils/api';
import PredictionGauge from '../components/Charts/PredictionGauge';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function LearnerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: learner, isLoading } = useGetLearner(id);
  const { data: mentors } = useGetMentors();
  const { data: applications } = useGetApplicationsByLearner(id);
  const updateLearner = useUpdateLearner();
  const [editModal, setEditModal] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const res = await mlAPI.predict(id);
      setPrediction(res.data);
      toast.success('Prediction completed!');
    } catch (error) {
      toast.error('Prediction failed. ML service may be unavailable.');
    } finally {
      setPredicting(false);
    }
  };

  const onEditSubmit = (data) => {
    updateLearner.mutate({
      id: parseInt(id),
      data: {
        ...data,
        semester: data.semester ? parseInt(data.semester) : null,
        gpa: data.gpa ? parseFloat(data.gpa) : null,
        experienceMonths: data.experienceMonths ? parseInt(data.experienceMonths) : null,
        mentorId: data.mentorId ? parseInt(data.mentorId) : null,
      },
    }, {
      onSuccess: () => { setEditModal(false); reset(); },
    });
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading learner..." />;
  if (!learner) return <div className="text-center py-12 text-surface-400">Learner not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button + Title */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/learners')} className="p-2 rounded-xl hover:bg-surface-800 transition-colors text-surface-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-100">{learner.name}</h1>
          <p className="text-surface-400">{learner.studentId} • {learner.course || 'No course'}</p>
        </div>
        <div className="ml-auto flex gap-3">
          <button onClick={() => { setEditModal(true); reset(learner); }} className="btn-secondary">Edit</button>
          <button onClick={handlePredict} disabled={predicting} className="btn-primary flex items-center gap-2">
            {predicting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Predicting...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg> Run AI Prediction</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-surface-100">Profile</h3>
          <div className="space-y-3">
            {[
              ['Email', learner.email],
              ['Course', learner.course],
              ['Semester', learner.semester],
              ['GPA', learner.gpa?.toFixed(1)],
              ['Experience', `${learner.experienceMonths || 0} months`],
              ['Status', learner.status],
              ['Mentor', learner.mentorName || 'Unassigned'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-surface-700/30">
                <span className="text-sm text-surface-400">{label}</span>
                <span className="text-sm font-medium text-surface-200">{value || '-'}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-sm text-surface-400 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {(learner.skills || '').split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                <span key={skill} className="badge-primary">{skill}</span>
              ))}
              {!learner.skills && <span className="text-surface-500 text-sm">No skills listed</span>}
            </div>
          </div>
        </div>

        {/* AI Prediction */}
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-surface-100 mb-4 self-start">AI Prediction</h3>
          {prediction ? (
            <div className="text-center">
              <PredictionGauge probability={prediction.probability} />
              <div className="mt-4 space-y-2">
                <span className={prediction.placeable ? 'badge-success text-sm' : 'badge-danger text-sm'}>
                  {prediction.placeable ? '✓ Placeable' : '✗ Needs Improvement'}
                </span>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-surface-400 font-medium">Top Factors:</p>
                  {prediction.topFactors?.map((f, i) => (
                    <p key={i} className="text-xs text-surface-300">• {f}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-surface-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm text-surface-400">Click &quot;Run AI Prediction&quot; to analyze</p>
            </div>
          )}
        </div>

        {/* Applications */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Applications</h3>
          {applications && applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/30">
                  <p className="text-sm font-medium text-surface-200">{app.drive?.companyName || 'Unknown Company'}</p>
                  <p className="text-xs text-surface-400">{app.drive?.role || ''}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={
                      app.status === 'SELECTED' ? 'badge-success' :
                      app.status === 'REJECTED' ? 'badge-danger' : 'badge-info'
                    }>{app.status}</span>
                    {app.result && <span className="text-xs text-surface-400">{app.result}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-400 py-8 text-center">No applications yet</p>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Learner">
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Name</label>
              <input {...register('name')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Email</label>
              <input {...register('email')} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Course</label>
              <input {...register('course')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">GPA</label>
              <input {...register('gpa')} type="number" step="0.1" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Semester</label>
              <input {...register('semester')} type="number" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Skills</label>
              <input {...register('skills')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Mentor</label>
              <select {...register('mentorId')} className="input-field">
                <option value="">-- Unassigned --</option>
                {mentors?.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1">{updateLearner.isPending ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" onClick={() => setEditModal(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
