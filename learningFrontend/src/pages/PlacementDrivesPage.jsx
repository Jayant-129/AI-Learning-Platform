import { useState } from 'react';
import { useGetDrives, useCreateDrive, useDeleteDrive } from '../hooks/usePlacements';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useForm } from 'react-hook-form';

export default function PlacementDrivesPage() {
  const { user } = useAuth();
  const { data: drives, isLoading } = useGetDrives();
  const createDrive = useCreateDrive();
  const deleteDrive = useDeleteDrive();
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const statusBadge = (status) => {
    const map = { UPCOMING: 'badge-info', ONGOING: 'badge-warning', COMPLETED: 'badge-success', CANCELLED: 'badge-danger' };
    return <span className={map[status] || 'badge-info'}>{status}</span>;
  };

  const columns = [
    { header: 'Company', accessor: 'companyName', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-primary-400 font-bold text-sm">
          {row.companyName?.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-surface-100">{row.companyName}</p>
          <p className="text-xs text-surface-400">{row.role}</p>
        </div>
      </div>
    )},
    { header: 'Location', accessor: 'location' },
    { header: 'Package', accessor: 'packageOffered', render: (row) => (
      <span className="font-semibold text-emerald-400">{row.packageOffered || '-'}</span>
    )},
    { header: 'Min GPA', accessor: 'minimumGpa', render: (row) => row.minimumGpa?.toFixed(1) || '-' },
    { header: 'Date', accessor: 'driveDate', render: (row) => row.driveDate ? new Date(row.driveDate).toLocaleDateString() : '-' },
    { header: 'Status', accessor: 'status', render: (row) => statusBadge(row.status) },
    ...(user?.role === 'ADMIN' ? [{
      header: 'Actions', render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); if (confirm('Delete this drive?')) deleteDrive.mutate(row.id); }}
          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      )
    }] : []),
  ];

  const onSubmit = (data) => {
    createDrive.mutate({
      ...data,
      minimumGpa: data.minimumGpa ? parseFloat(data.minimumGpa) : null,
      maxApplications: data.maxApplications ? parseInt(data.maxApplications) : null,
    }, {
      onSuccess: () => { setShowModal(false); reset(); },
    });
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading drives..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Placement Drives</h1>
          <p className="text-surface-400 mt-1">{drives?.length || 0} drives total</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Drive
          </button>
        )}
      </div>

      <DataTable columns={columns} data={drives} emptyMessage="No placement drives found." />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Create Placement Drive" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Company Name *</label>
              <input {...register('companyName', { required: true })} className="input-field" placeholder="Google" />
              {errors.companyName && <span className="text-xs text-rose-400">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Role *</label>
              <input {...register('role', { required: true })} className="input-field" placeholder="Software Engineer" />
              {errors.role && <span className="text-xs text-rose-400">Required</span>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} placeholder="Drive description..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Location</label>
              <input {...register('location')} className="input-field" placeholder="Bangalore" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Package</label>
              <input {...register('packageOffered')} className="input-field" placeholder="25 LPA" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Min GPA</label>
              <input {...register('minimumGpa')} type="number" step="0.1" className="input-field" placeholder="7.0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Drive Date</label>
              <input {...register('driveDate')} type="date" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1">Status</label>
              <select {...register('status')} className="input-field">
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1">Eligibility Criteria</label>
            <input {...register('eligibilityCriteria')} className="input-field" placeholder="CS/IT with GPA >= 8.0" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={createDrive.isPending} className="btn-primary flex-1">{createDrive.isPending ? 'Creating...' : 'Create Drive'}</button>
            <button type="button" onClick={() => { setShowModal(false); reset(); }} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
