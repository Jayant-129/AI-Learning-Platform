export default function StatsCard({ title, value, icon, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'from-primary-600/20 to-primary-800/10 border-primary-500/20',
    emerald: 'from-emerald-600/20 to-emerald-800/10 border-emerald-500/20',
    amber: 'from-amber-600/20 to-amber-800/10 border-amber-500/20',
    violet: 'from-violet-600/20 to-violet-800/10 border-violet-500/20',
    rose: 'from-rose-600/20 to-rose-800/10 border-rose-500/20',
    blue: 'from-blue-600/20 to-blue-800/10 border-blue-500/20',
  };

  const iconColorMap = {
    primary: 'text-primary-400 bg-primary-500/15',
    emerald: 'text-emerald-400 bg-emerald-500/15',
    amber: 'text-amber-400 bg-amber-500/15',
    violet: 'text-violet-400 bg-violet-500/15',
    rose: 'text-rose-400 bg-rose-500/15',
    blue: 'text-blue-400 bg-blue-500/15',
  };

  return (
    <div className={`glass-card bg-gradient-to-br ${colorMap[color]} p-6 hover:shadow-glow transition-all duration-300 group animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-surface-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-surface-100 group-hover:text-white transition-colors">
            {value}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={trend >= 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
              </svg>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconColorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
