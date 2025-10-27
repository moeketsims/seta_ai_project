'use client';

interface Misconception {
  topic: string;
  count: number;
  trend: number[]; // Last 4 weeks
}

interface MisconceptionRadarProps {
  misconceptions: Misconception[];
}

export function MisconceptionRadar({ misconceptions }: MisconceptionRadarProps) {
  const maxCount = Math.max(...misconceptions.map((m) => m.count));
  const totalCount = misconceptions.reduce((sum, m) => sum + m.count, 0);

  // Calculate severity levels
  const getSeverity = (count: number) => {
    const percentage = (count / maxCount) * 100;
    if (percentage >= 80) return 'critical';
    if (percentage >= 60) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-neutral-500 to-neutral-600';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
      case 'low': return 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800';
      default: return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      {/* Header with stats */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-1">
            Top Misconceptions
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Identified patterns across {totalCount} learner interactions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-black text-neutral-900 dark:text-neutral-100">{totalCount}</div>
            <div className="text-xs text-neutral-500 font-medium">Total Cases</div>
          </div>
          <div className="h-12 w-px bg-neutral-200 dark:bg-neutral-800" />
          <div className="text-right">
            <div className="text-xs text-neutral-500 mb-1">Last 4 weeks</div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" title="Critical" />
              <div className="w-2 h-2 rounded-full bg-orange-500" title="High" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" title="Medium" />
              <div className="w-2 h-2 rounded-full bg-green-500" title="Low" />
            </div>
          </div>
        </div>
      </div>

      {/* Misconceptions grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {misconceptions.map((item, idx) => {
          const percentage = (item.count / maxCount) * 100;
          const trendUp = item.trend[3] > item.trend[0];
          const trendChange = Math.abs(item.trend[3] - item.trend[0]);
          const trendPercent = item.trend[0] !== 0 ? ((item.trend[3] - item.trend[0]) / item.trend[0] * 100).toFixed(0) : 0;
          const severity = getSeverity(item.count);

          return (
            <button
              key={item.topic}
              className="group relative p-5 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-xl transition-all duration-200 text-left bg-gradient-to-br from-neutral-50/50 to-white dark:from-neutral-900 dark:to-neutral-900/50"
            >
              {/* Rank badge */}
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-black text-lg shadow-lg border-4 border-white dark:border-neutral-900">
                {idx + 1}
              </div>

              {/* Severity badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getSeverityBadgeColor(severity)} uppercase tracking-wide`}>
                  {severity}
                </span>
              </div>

              {/* Title */}
              <div className="mt-2 mb-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors pr-16">
                  {item.topic}
                </h3>
                <p className="text-xs text-neutral-500">
                  Affecting <span className="font-semibold text-neutral-900 dark:text-neutral-100">{item.count} learners</span>
                </p>
              </div>

              {/* Progress bar */}
              <div className="relative mb-4">
                <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getSeverityColor(severity)} transition-all duration-500 group-hover:brightness-110`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    {percentage.toFixed(0)}% of max
                  </span>
                  <span className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-error-600 dark:text-error-400' : 'text-success-600 dark:text-success-400'}`}>
                    {trendUp ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    {trendPercent}% vs 4 weeks ago
                  </span>
                </div>
              </div>

              {/* 4-week trend visualization */}
              <div className="flex items-end justify-between gap-1 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2">
                {item.trend.map((val, i) => {
                  const height = (val / Math.max(...item.trend)) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t transition-all ${
                          trendUp
                            ? 'bg-gradient-to-t from-error-500 to-error-400'
                            : 'bg-gradient-to-t from-success-500 to-success-400'
                        }`}
                        style={{ height: `${Math.max(height, 15)}%` }}
                        title={`Week ${i + 1}: ${val} learners`}
                      />
                      <span className="text-[9px] font-bold text-neutral-500">W{i + 1}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action hint */}
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-xs text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors inline-flex items-center gap-1 font-medium">
                  View affected learners & remediation plan
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom summary */}
      <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Live tracking • Updates every 5 minutes
            </span>
          </div>
          <button className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors flex items-center gap-1">
            View full misconception library
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

