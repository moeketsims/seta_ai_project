'use client';

interface FunnelStage {
  stage: string;
  count: number;
  percent: number;
}

interface LearningFunnelProps {
  data: FunnelStage[];
}

export function LearningFunnel({ data }: LearningFunnelProps) {
  return (
    <div className="bg-white rounded-lg shadow-card p-8">
      <div className="flex items-end justify-between mb-8 pb-4 border-b-2 border-ufs-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ufs-navy)]">Learning Progress</h2>
          <p className="text-sm text-ufs-gray-500 mt-1">Learner journey through curriculum</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-[var(--edu-green)] tabular-nums">{data[data.length - 1].percent}<span className="text-2xl">%</span></div>
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mt-1">Mastered</div>
        </div>
      </div>

      {/* BRUTALIST: Horizontal Progress Bars - Bold & Minimal */}
      <div className="space-y-6">
        {data.map((stage, i) => {
          const dropoff = i > 0 ? data[i - 1].count - stage.count : 0;
          const getBarColor = (index: number) => {
            if (index === 0) return 'bg-ufs-gray-300'; // Assigned (neutral)
            if (index === data.length - 1) return 'bg-[var(--edu-green)]'; // Mastered (green)
            return 'bg-[var(--ufs-navy)]'; // In-progress (navy)
          };
          
          return (
            <div key={stage.stage}>
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-base font-bold text-ufs-gray-900">{stage.stage}</h3>
                  {dropoff > 0 && (
                    <span className="text-xs text-[var(--ufs-maroon)] font-bold">
                      −{dropoff} dropped
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-[var(--ufs-navy)] tabular-nums">{stage.count}</span>
                  <span className="text-lg font-bold text-ufs-gray-500 tabular-nums">{stage.percent}%</span>
                </div>
              </div>
              <div className="relative h-3 bg-ufs-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(i)} transition-all duration-500 rounded-full`}
                  style={{ width: `${stage.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* BRUTALIST SUMMARY: Just the critical numbers */}
      <div className="mt-8 pt-8 border-t-2 border-ufs-gray-200 grid grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Started</div>
          <div className="text-4xl font-bold text-[var(--ufs-navy)] tabular-nums">{data[0].count}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Mastered</div>
          <div className="text-4xl font-bold text-[var(--edu-green)] tabular-nums">{data[data.length - 1].count}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mb-2">Drop Rate</div>
          <div className="text-4xl font-bold text-[var(--ufs-maroon)] tabular-nums">
            {100 - data[data.length - 1].percent}<span className="text-2xl">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
