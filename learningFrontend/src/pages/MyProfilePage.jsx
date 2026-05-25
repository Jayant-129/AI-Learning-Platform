import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI, mlAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await profileAPI.getMe();
      return res.data;
    },
  });

  const { data: prediction, isLoading: predLoading } = useQuery({
    queryKey: ['prediction', profile?.id],
    queryFn: async () => {
      const res = await mlAPI.getHistory(profile.id);
      return res.data?.[0] || null;
    },
    enabled: !!profile?.id,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => profileAPI.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Profile updated!');
      setEditing(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const onSubmit = (data) => {
    updateMutation.mutate({
      ...data,
      semester: data.semester ? parseInt(data.semester) : null,
      gpa: data.gpa ? parseFloat(data.gpa) : null,
      experienceMonths: data.experienceMonths ? parseInt(data.experienceMonths) : null,
    });
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading your profile..." />;

  const placementPct = prediction ? (prediction.placementProbability * 100).toFixed(0) : null;
  const skills = profile?.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">My Profile</h1>
        <p className="text-surface-400 mt-1">View and update your learner profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-surface-100">{profile?.name || user?.name}</h2>
                <p className="text-surface-400 text-sm">{profile?.email}</p>
                <span className="badge-primary text-xs mt-1 inline-block">{profile?.studentId}</span>
              </div>
            </div>
            <button
              onClick={() => { setEditing(!editing); reset(profile); }}
              className={editing ? 'btn-secondary' : 'btn-primary'}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Course</label>
                  <input {...register('course')} defaultValue={profile?.course} className="input-field" placeholder="Computer Science" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Semester</label>
                  <input {...register('semester')} type="number" defaultValue={profile?.semester} className="input-field" min={1} max={12} placeholder="1-12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">GPA</label>
                  <input {...register('gpa')} type="number" step="0.1" defaultValue={profile?.gpa} className="input-field" min={0} max={10} placeholder="0–10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1">Experience (months)</label>
                  <input {...register('experienceMonths')} type="number" defaultValue={profile?.experienceMonths} className="input-field" min={0} placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Skills (comma-separated)</label>
                <input {...register('skills')} defaultValue={profile?.skills} className="input-field" placeholder="Java, Python, React" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1">Resume URL</label>
                <input {...register('resumeUrl')} defaultValue={profile?.resumeUrl} className="input-field" placeholder="https://..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex-1">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Course', value: profile?.course || '—' },
                { label: 'Semester', value: profile?.semester ? `Semester ${profile.semester}` : '—' },
                { label: 'GPA', value: profile?.gpa?.toFixed(2) || '—' },
                { label: 'Experience', value: profile?.experienceMonths ? `${profile.experienceMonths} months` : '—' },
                { label: 'Status', value: profile?.status || '—' },
                { label: 'Resume', value: profile?.resumeUrl ? 'Uploaded' : 'Not uploaded' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-surface-500 uppercase tracking-wider">{label}</p>
                  <p className="text-surface-200 font-medium mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {!editing && skills.length > 0 && (
            <div>
              <p className="text-xs text-surface-500 uppercase tracking-wider mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="badge-primary text-sm">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Placement Prediction Card */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-surface-100">Placement Readiness</h3>
          {predLoading ? (
            <LoadingSpinner size="sm" text="Loading..." />
          ) : prediction ? (
            <>
              <div className="text-center py-4">
                <div className={`text-5xl font-black ${
                  placementPct >= 70 ? 'text-emerald-400' :
                  placementPct >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {placementPct}%
                </div>
                <div className={`mt-2 text-sm font-semibold ${
                  prediction.placeable ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {prediction.placeable ? '✓ Placement Ready' : '⚠ Not Ready Yet'}
                </div>
              </div>
              <div className="w-full bg-surface-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    placementPct >= 70 ? 'bg-emerald-500' :
                    placementPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${placementPct}%` }}
                />
              </div>
              {prediction.topFactors && (
                <div>
                  <p className="text-xs text-surface-500 uppercase tracking-wider mb-2">Key Factors</p>
                  <ul className="space-y-1">
                    {prediction.topFactors.split(',').map((f) => (
                      <li key={f} className="text-sm text-surface-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-surface-500">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm">No prediction yet.</p>
              <p className="text-xs mt-1">Complete your profile to get an AI prediction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
