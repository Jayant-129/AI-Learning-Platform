import { useState } from 'react';
import { useGetUsers, useUpdateUserRole, useDeleteUser } from '../hooks/useUsers';
import LoadingSpinner from '../components/LoadingSpinner';

const ROLES = ['ADMIN', 'MENTOR', 'LEARNER'];

const ROLE_COLORS = {
  ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  MENTOR: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  LEARNER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

export default function UsersPage() {
  const { data: users, isLoading } = useGetUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = users?.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <LoadingSpinner size="lg" text="Loading users..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">User Management</h1>
          <p className="text-surface-400 mt-1">{users?.length || 0} registered accounts</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROLES.map((role) => {
          const count = users?.filter(u => u.role === role).length || 0;
          return (
            <div key={role} className="glass-card p-4 text-center">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-2 ${ROLE_COLORS[role]}`}>
                {role}
              </div>
              <p className="text-2xl font-bold text-surface-100">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-700/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Joined</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700/30">
            {filtered?.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-surface-500">No users found.</td>
              </tr>
            ) : (
              filtered?.map((user) => (
                <tr key={user.id} className="hover:bg-surface-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-surface-200 font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value })}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border bg-transparent cursor-pointer ${ROLE_COLORS[user.role]}`}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-surface-400 text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => { if (confirm(`Delete user ${user.name}?`)) deleteUser.mutate(user.id); }}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete user"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
