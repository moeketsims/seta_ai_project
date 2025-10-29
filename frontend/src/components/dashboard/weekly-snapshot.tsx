'use client';

interface WeeklySnapshotProps {
  assigned: number;
  mastered: number;
  avgPerformance: number;
  atRisk: number;
  topGaps: { topic: string; count: number }[];
  performanceTrend: number;
}

export function WeeklySnapshot({ 
  assigned, 
  mastered, 
  avgPerformance, 
  atRisk, 
  topGaps,
  performanceTrend 
}: WeeklySnapshotProps) {
  const completionRate = Math.round((mastered / assigned) * 100);
  
  return (
    <div className="bg-white rounded-lg shadow-card p-8">
      <div className="mb-8 pb-6 border-b-2 border-ufs-gray-200">
        <h2 className="text-2xl font-bold text-[var(--ufs-navy)]">This Week At A Glance</h2>
        <p className="text-sm text-ufs-gray-500 mt-1">Key metrics and critical issues</p>
      </div>

      {/* BRUTALIST: 5 Huge Number Columns */}
      <div className="grid grid-cols-5 gap-8 mb-12">
        {/* Assigned */}
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Assigned</div>
          <div className="text-6xl font-bold text-[var(--ufs-navy)] tabular-nums mb-2">{assigned}</div>
          <div className="text-sm text-ufs-gray-500 font-medium">Learners</div>
        </div>

        {/* Mastered */}
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Mastered</div>
          <div className="text-6xl font-bold text-[var(--edu-green)] tabular-nums mb-2">{mastered}</div>
          <div className="text-sm text-[var(--edu-green)] font-bold">{completionRate}% rate</div>
        </div>

        {/* Avg Performance */}
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Avg Performance</div>
          <div className="text-6xl font-bold text-[var(--ufs-navy)] tabular-nums mb-2">{avgPerformance}<span className="text-3xl">%</span></div>
          <div className="text-sm text-[var(--ufs-navy)] font-bold">
            {performanceTrend >= 0 ? '↑' : '↓'} {Math.abs(performanceTrend)}%
          </div>
        </div>

        {/* At Risk */}
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">At Risk</div>
          <div className="text-6xl font-bold text-[var(--ufs-maroon)] tabular-nums mb-2">{atRisk}</div>
          <div className="text-sm text-[var(--ufs-maroon)] font-bold">Need help</div>
        </div>

        {/* Top Gaps */}
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-3">Top Gaps</div>
          <div className="text-6xl font-bold text-[var(--ufs-navy)] tabular-nums mb-2">{topGaps.length}</div>
          <div className="text-sm text-ufs-gray-500 font-medium">Concepts</div>
        </div>
      </div>

      {/* Critical Issues - One Line, Bold */}
      <div className="pt-6 border-t-2 border-ufs-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--ufs-maroon)]"></div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500">Top Issues</h3>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {topGaps.slice(0, 3).map((gap, i) => (
            <div key={gap.topic} className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--ufs-navy)] tabular-nums">{gap.count}</span>
              <span className="text-sm text-ufs-gray-700 font-medium">{gap.topic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}





