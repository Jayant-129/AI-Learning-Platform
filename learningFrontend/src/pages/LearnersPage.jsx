import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetLearners, useCreateLearner, useDeleteLearner, useUploadCsv } from '../hooks/useLearners';
import { useGetMentors } from '../hooks/useUsers';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useForm } from 'react-hook-form';

export default function LearnersPage() {
  const { user } = useAuth();
  const { data: allLearners, isLoading } = useGetLearners();
  
  const learners = user?.role === 'MENTOR' 
    ? allLearners?.filter(l => l.mentorId === user.id) 
    : allLearners;

  const { data: mentors } = useGetMentors();
  const createLearner = useCreateLearner();
  const deleteLearner = useDeleteLearner();
  const uploadCsv = useUploadCsv();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const fileRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const columns = [
    { header: 'Student ID', accessor: 'studentId' },
    { header: 'Name', accessor: 'name' },
    { header: 'Course', accessor: 'course' },
    {
      header: 'GPA',
      accessor: 'gpa',
      render: (row) => (
        <span className={`font-semibold ${row.gpa >= 8 ? 'text-emerald-400' : row.gpa >= 6 ? 'text-amber-400' : 'text-rose-400'}`}>
          {row.gpa?.toFixed(1) || '-'}
        </span>
      ),
    },
    { header: 'Semester', accessor: 'semester' },
    {
      header: 'Skills',
      accessor: 'skills',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {(row.skills || '').split(',').slice(0, 3).map((s) => s.trim()).filter(Boolean).map((skill) => (
            <span key={skill} className="badge-primary text-[10px]">{skill}</span>
          ))}
          {(row.skills || '').split(',').length > 3 && (
            <span className="badge text-[10px] bg-surface-700 text-surface-300">
              +{(row.skills || '').split(',').length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span className={row.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Mentor',
      accessor: 'mentorName',
      render: (row) => <span className="text-sm text-surface-300">{row.mentorName || 'Unassigned'}</span>,
    },
    ...(user?.role === 'ADMIN' ? [{
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/learners/${row.id}`); }}
            className="p-1.5 rounded-lg text-primary-400 hover:bg-primary-500/10 transition-colors"
            title="View details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm('Delete this learner?')) deleteLearner.mutate(row.id); }}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      ),
    }] : []),
  ];

  const onSubmit = (data) => {
    createLearner.mutate({
      ...data,
      semester: data.semester ? parseInt(data.semester) : null,
      gpa: data.gpa ? parseFloat(data.gpa) : null,
      experienceMonths: data.experienceMonths ? parseInt(data.experienceMonths) : null,
      mentorId: data.mentorId ? parseInt(data.mentorId) : null,
    }, {
      onSuccess: () => { setShowModal(false); reset(); },
    });
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCsv.mutate(file);
      e.target.value = '';
    }
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading learners..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Learners</h1>
          <p className="text-surface-400 mt-1">{learners?.length || 0} learners</p>
        </div>
        {user?.role === 'ADMIN' && (
          <div className="flex gap-3">
            <input ref={fileRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            <button onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Upload CSV
            </button>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Learner
            </button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={learners}
        onRowClick={(row) => navigate(`/learners/${row.id}`)}
        emptyMessage="No learners found. Add your first learner or upload a CSV."
      />

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Add New Learner">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Student ID *</label>
              <input {...register('studentId', { required: true })} className="input-field" placeholder="STU001" />
              {errors.studentId && <span className="text-xs text-rose-400">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Name *</label>
              <input {...register('name', { required: true })} className="input-field" placeholder="Full Name" />
              {errors.name && <span className="text-xs text-rose-400">Required</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Email</label>
              <input {...register('email')} type="email" className="input-field" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Course</label>
              <input {...register('course')} className="input-field" placeholder="Computer Science" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Semester</label>
              <input {...register('semester')} type="number" className="input-field" placeholder="1-8" min="1" max="12" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">GPA</label>
              <input {...register('gpa')} type="number" step="0.1" className="input-field" placeholder="0-10" min="0" max="10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Experience (months)</label>
              <input {...register('experienceMonths')} type="number" className="input-field" placeholder="0" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Skills (comma-separated)</label>
              <input {...register('skills')} className="input-field" placeholder="Java, Python, React" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Assign Mentor</label>
              <select {...register('mentorId')} className="input-field">
                <option value="">-- Unassigned --</option>
                {mentors?.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={createLearner.isPending} className="btn-primary flex-1">
              {createLearner.isPending ? 'Creating...' : 'Create Learner'}
            </button>
            <button type="button" onClick={() => { setShowModal(false); reset(); }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
