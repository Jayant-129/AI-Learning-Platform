import { useDashboardStats } from '../hooks/useDashboard';
import { useGetLearners } from '../hooks/useLearners';
import { useGetAssessments } from '../hooks/useAssessments';
import { useGetDrives, useGetApplicationsByLearner } from '../hooks/usePlacements';
import { useQuery } from '@tanstack/react-query';
import { profileAPI } from '../utils/api';
import StatsCard from '../components/StatsCard';
import CourseDistChart from '../components/Charts/CourseDistChart';
import PlacementTrendChart from '../components/Charts/PlacementTrendChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// ─── ADMIN Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ stats, user }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">
          Welcome back, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-surface-400 mt-1">Platform-wide overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Learners" value={stats?.totalLearners || 0} color="primary"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
        />
        <StatsCard title="Active Learners" value={stats?.activeLearners || 0} color="emerald"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatsCard title="Placement Drives" value={stats?.totalDrives || 0} color="violet"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>}
        />
        <StatsCard title="Students Placed" value={stats?.placedCount || 0} color="amber"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Upcoming Drives" value={stats?.upcomingDrives || 0} color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
        />
        <StatsCard title="Total Applications" value={stats?.totalApplications || 0} color="rose"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
        />
        <StatsCard title="Average GPA" value={stats?.averageGpa ? stats.averageGpa.toFixed(2) : '0.00'} color="emerald"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Course Distribution</h3>
          <CourseDistChart data={stats?.courseDistribution} />
        </div>
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-surface-100 mb-4">Placement Trends</h3>
          <PlacementTrendChart data={stats?.placementTrend} />
        </div>
      </div>
    </div>
  );
}

// ─── MENTOR Dashboard ─────────────────────────────────────────────────────────
function MentorDashboard({ user }) {
  const { data: allLearners, isLoading: learnersLoading } = useGetLearners();
  const { data: assessments, isLoading: assessmentsLoading } = useGetAssessments();

  // Filter learners to only those assigned to this mentor
  const learners = allLearners?.filter(l => l.mentorId === user.id) || [];
  const activeLearners = learners.filter(l => l.status === 'ACTIVE');
  const recentAssessments = assessments
    ? [...assessments].sort((a, b) => new Date(b.assessedAt) - new Date(a.assessedAt)).slice(0, 5)
    : [];

  // Score breakdown across all assessments
  const avgScore = assessments?.length
    ? (assessments.reduce((sum, a) => sum + (a.score / (a.maxScore || 100)) * 100, 0) / assessments.length).toFixed(1)
    : null;

  const SCORE_COLOR = (pct) =>
    pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400';

  const GPA_COLOR = (gpa) =>
    gpa >= 8 ? 'text-emerald-400' : gpa >= 6.5 ? 'text-amber-400' : 'text-rose-400';

  if (learnersLoading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">
          Welcome, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-surface-400 mt-1">Your learner overview</p>
      </div>

      {/* Mentor quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <p className="text-surface-400 text-sm">Total Learners</p>
            <p className="text-2xl font-bold text-surface-100">{learners?.length || 0}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-surface-400 text-sm">Active Learners</p>
            <p className="text-2xl font-bold text-surface-100">{activeLearners.length}</p>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <div>
            <p className="text-surface-400 text-sm">Assessments Given</p>
            <p className="text-2xl font-bold text-surface-100">{assessments?.length || 0}</p>
            {avgScore && <p className="text-xs text-surface-500">Avg score: {avgScore}%</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learner List */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700/50">
            <h3 className="text-lg font-semibold text-surface-100">All Learners</h3>
            <Link to="/learners" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-surface-700/30 max-h-80 overflow-y-auto">
            {learners?.length === 0 ? (
              <p className="text-center py-10 text-surface-500 text-sm">No learners found.</p>
            ) : (
              learners?.slice(0, 10).map((l) => (
                <Link
                  key={l.id}
                  to={`/learners/${l.id}`}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-surface-800/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {l.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-surface-200 font-medium text-sm truncate">{l.name}</p>
                    <p className="text-surface-500 text-xs truncate">{l.course} · Sem {l.semester}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${GPA_COLOR(l.gpa)}`}>{l.gpa?.toFixed(1)}</p>
                    <p className="text-xs text-surface-500">GPA</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Assessments */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700/50">
            <h3 className="text-lg font-semibold text-surface-100">Recent Assessments</h3>
            <Link to="/assessments" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Manage →
            </Link>
          </div>
          <div className="divide-y divide-surface-700/30 max-h-80 overflow-y-auto">
            {assessmentsLoading ? (
              <div className="py-8 flex justify-center"><LoadingSpinner size="sm" /></div>
            ) : recentAssessments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-surface-500 text-sm">No assessments yet.</p>
                <Link to="/assessments" className="text-primary-400 text-xs hover:underline mt-1 inline-block">
                  Add the first assessment →
                </Link>
              </div>
            ) : (
              recentAssessments.map((a) => {
                const pct = Math.round((a.score / (a.maxScore || 100)) * 100);
                return (
                  <div key={a.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-surface-200 text-sm font-medium truncate">
                        {a.learner?.name || a.learnerName || '—'}
                      </p>
                      <p className="text-surface-500 text-xs">{a.type?.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm ${SCORE_COLOR(pct)}`}>{a.score}/{a.maxScore || 100}</p>
                      <p className="text-xs text-surface-500">{pct}%</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <Link to="/assessments" className="btn-primary text-sm">+ Add Assessment</Link>
          <Link to="/learners" className="btn-secondary text-sm">Browse Learners</Link>
          <Link to="/predictions" className="btn-secondary text-sm">View AI Predictions</Link>
        </div>
      </div>
    </div>
  );
}

// ─── LEARNER Dashboard ────────────────────────────────────────────────────────
function LearnerDashboard({ user }) {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await profileAPI.getMe();
      return res.data;
    },
  });

  const { data: drives, isLoading: drivesLoading } = useGetDrives();
  const { data: myApplications, isLoading: appsLoading } = useGetApplicationsByLearner(profile?.id);
  const { data: myAssessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['assessments', 'learner', profile?.id],
    queryFn: async () => {
      const { assessmentsAPI } = await import('../utils/api');
      const res = await assessmentsAPI.getByLearner(profile.id);
      return res.data;
    },
    enabled: !!profile?.id,
  });

  const upcomingDrives = drives?.filter(d => d.status === 'UPCOMING') || [];
  const appliedDriveIds = new Set(myApplications?.map(a => a.driveId || a.drive?.id));

  const avgScore = myAssessments?.length
    ? (myAssessments.reduce((s, a) => s + (a.score / (a.maxScore || 100)) * 100, 0) / myAssessments.length).toFixed(1)
    : null;

  const SCORE_COLOR = (pct) =>
    pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400';

  const STATUS_STYLE = (status) => ({
    APPLIED: 'bg-blue-500/20 text-blue-300',
    SHORTLISTED: 'bg-amber-500/20 text-amber-300',
    OFFERED: 'bg-emerald-500/20 text-emerald-300',
    REJECTED: 'bg-rose-500/20 text-rose-300',
  }[status] || 'bg-surface-700 text-surface-300');

  if (profileLoading) return <LoadingSpinner size="lg" text="Loading your dashboard..." />;

  const skills = profile?.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-surface-400 mt-1">
            {profile?.course ? `${profile.course} · Semester ${profile.semester}` : 'Complete your profile to get started'}
          </p>
          {profile?.mentorName && (
            <p className="text-sm text-primary-400 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Mentor: {profile.mentorName}
            </p>
          )}
        </div>
        <Link to="/my-profile" className="btn-primary text-sm">Edit Profile</Link>
      </div>

      {/* Personal stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <p className={`text-3xl font-black ${profile?.gpa >= 8 ? 'text-emerald-400' : profile?.gpa >= 6.5 ? 'text-amber-400' : 'text-rose-400'}`}>
            {profile?.gpa?.toFixed(2) || '—'}
          </p>
          <p className="text-surface-400 text-xs mt-1">My GPA</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-black text-primary-400">{myAssessments?.length || 0}</p>
          <p className="text-surface-400 text-xs mt-1">Assessments</p>
          {avgScore && <p className="text-xs text-surface-500">Avg: {avgScore}%</p>}
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-black text-violet-400">{myApplications?.length || 0}</p>
          <p className="text-surface-400 text-xs mt-1">Applications</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-black text-amber-400">{upcomingDrives.length}</p>
          <p className="text-surface-400 text-xs mt-1">Open Drives</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Assessments */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700/50">
            <h3 className="text-lg font-semibold text-surface-100">My Assessment Scores</h3>
          </div>
          <div className="divide-y divide-surface-700/30 max-h-72 overflow-y-auto">
            {assessmentsLoading ? (
              <div className="py-8 flex justify-center"><LoadingSpinner size="sm" /></div>
            ) : !myAssessments?.length ? (
              <div className="py-10 text-center">
                <svg className="w-10 h-10 mx-auto mb-2 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
                <p className="text-surface-500 text-sm">No assessments recorded yet.</p>
                <p className="text-surface-600 text-xs mt-1">Your mentor will add scores here.</p>
              </div>
            ) : (
              myAssessments.map((a) => {
                const pct = Math.round((a.score / (a.maxScore || 100)) * 100);
                return (
                  <div key={a.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-surface-200 text-sm font-medium">{a.type?.replace('_', ' ')}</p>
                      {a.feedback && <p className="text-surface-500 text-xs truncate">{a.feedback}</p>}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-20 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className={`font-bold text-sm w-12 text-right ${SCORE_COLOR(pct)}`}>{pct}%</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* My Applications + Upcoming Drives */}
        <div className="space-y-4">
          {/* My Applications */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700/50">
              <h3 className="text-base font-semibold text-surface-100">My Applications</h3>
              <Link to="/placements" className="text-xs text-primary-400 hover:text-primary-300">Browse →</Link>
            </div>
            <div className="divide-y divide-surface-700/30 max-h-36 overflow-y-auto">
              {appsLoading ? (
                <div className="py-4 flex justify-center"><LoadingSpinner size="sm" /></div>
              ) : !myApplications?.length ? (
                <div className="py-6 text-center">
                  <p className="text-surface-500 text-sm">No applications yet.</p>
                  <Link to="/placements" className="text-primary-400 text-xs hover:underline mt-1 inline-block">
                    Browse placement drives →
                  </Link>
                </div>
              ) : (
                myApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between px-6 py-2.5">
                    <div>
                      <p className="text-surface-200 text-sm font-medium">
                        {app.drive?.companyName || app.companyName || 'Drive'}
                      </p>
                      <p className="text-surface-500 text-xs">{app.drive?.role || app.role || '—'}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE(app.status)}`}>
                      {app.status || 'APPLIED'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Drives */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700/50">
              <h3 className="text-base font-semibold text-surface-100">Upcoming Drives</h3>
              <Link to="/placements" className="text-xs text-primary-400 hover:text-primary-300">All drives →</Link>
            </div>
            <div className="divide-y divide-surface-700/30 max-h-40 overflow-y-auto">
              {drivesLoading ? (
                <div className="py-4 flex justify-center"><LoadingSpinner size="sm" /></div>
              ) : upcomingDrives.length === 0 ? (
                <p className="text-center py-6 text-surface-500 text-sm">No upcoming drives.</p>
              ) : (
                upcomingDrives.slice(0, 4).map((drive) => (
                  <div key={drive.id} className="flex items-center justify-between px-6 py-2.5">
                    <div>
                      <p className="text-surface-200 text-sm font-medium">{drive.companyName}</p>
                      <p className="text-surface-500 text-xs">{drive.role} · {drive.packageOffered}</p>
                    </div>
                    {appliedDriveIds.has(drive.id) ? (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">Applied</span>
                    ) : (
                      <Link to="/placements" className="text-xs bg-primary-600/20 text-primary-300 hover:bg-primary-600/30 px-2 py-0.5 rounded-full transition-colors">
                        Apply
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="glass-card p-5">
          <p className="text-xs text-surface-500 uppercase tracking-wider mb-3">Your Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="badge-primary text-sm">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root Dashboard (role router) ─────────────────────────────────────────────
export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const { user } = useAuth();

  if (isLoading && user?.role === 'ADMIN') {
    return <LoadingSpinner size="lg" text="Loading dashboard..." />;
  }

  if (user?.role === 'MENTOR') return <MentorDashboard user={user} />;
  if (user?.role === 'LEARNER') return <LearnerDashboard user={user} />;
  return <AdminDashboard stats={stats} user={user} />;
}
