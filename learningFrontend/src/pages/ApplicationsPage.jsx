import { useGetApplications, useUpdateApplicationStatus } from '../hooks/usePlacements';
import DataTable from '../components/DataTable';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ApplicationsPage() {
  const { data: applications, isLoading } = useGetApplications();
  const updateStatus = useUpdateApplicationStatus();

  const handleStatusUpdate = (id, status, result) => {
    updateStatus.mutate({ id, status, result });
  };

  const columns = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Learner',
      accessor: 'learner',
      render: (row) => (
        <div>
          <p className="font-medium text-surface-100">{row.learner?.name || 'Unknown'}</p>
          <p className="text-xs text-surface-400">{row.learner?.studentId || ''}</p>
        </div>
      ),
    },
    {
      header: 'Company / Role',
      accessor: 'drive',
      render: (row) => (
        <div>
          <p className="font-medium text-surface-100">{row.drive?.companyName || 'Unknown'}</p>
          <p className="text-xs text-surface-400">{row.drive?.role || ''}</p>
        </div>
      ),
    },
    {
      header: 'Applied At',
      accessor: 'appliedAt',
      render: (row) => row.appliedAt ? new Date(row.appliedAt).toLocaleDateString() : '-',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const map = {
          APPLIED: 'badge-info',
          SHORTLISTED: 'badge-warning',
          SELECTED: 'badge-success',
          REJECTED: 'badge-danger',
          INTERVIEW: 'badge-primary',
        };
        return <span className={map[row.status] || 'badge-info'}>{row.status}</span>;
      },
    },
    { header: 'Result', accessor: 'result', render: (row) => (
      <span className={
        row.result === 'PLACED' ? 'text-emerald-400 font-semibold' :
        row.result === 'NOT_PLACED' ? 'text-rose-400' : 'text-surface-400'
      }>{row.result || '-'}</span>
    )},
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          {row.status !== 'SELECTED' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'SELECTED', 'PLACED')}
              className="px-2 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              Select
            </button>
          )}
          {row.status !== 'SHORTLISTED' && row.status !== 'SELECTED' && row.status !== 'REJECTED' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'SHORTLISTED', null)}
              className="px-2 py-1 text-xs rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              Shortlist
            </button>
          )}
          {row.status !== 'REJECTED' && (
            <button
              onClick={() => handleStatusUpdate(row.id, 'REJECTED', 'NOT_PLACED')}
              className="px-2 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              Reject
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading applications..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Applications</h1>
        <p className="text-surface-400 mt-1">{applications?.length || 0} applications</p>
      </div>

      <DataTable
        columns={columns}
        data={applications}
        emptyMessage="No applications found."
      />
    </div>
  );
}
