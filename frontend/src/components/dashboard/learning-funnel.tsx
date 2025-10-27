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
  const maxWidth = 100;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">Learning Progress Funnel</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Track learner progression and drop-off</p>
        </div>
        <span className="text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full">This Week</span>
      </div>

      <div className="space-y-6">
        {data.map((stage, i) => {
          const dropoff = i > 0 ? data[i - 1].percent - stage.percent : 0;
          const dropoffCount = i > 0 ? data[i - 1].count - stage.count : 0;
          const widthPercent = (stage.percent / maxWidth) * 100;

          // Color progression from blue to purple
          const getColor = (index: number) => {
            const colors = [
              'from-blue-500 to-blue-600',
              'from-blue-600 to-purple-600',
              'from-purple-600 to-purple-700',
              'from-purple-700 to-indigo-700'
            ];
            return colors[index] || colors[0];
          };

          return (
            <div key={stage.stage} className="relative">
              {/* Connecting line for funnel effect */}
              {i > 0 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-px h-3 bg-gradient-to-b from-neutral-200 to-transparent dark:from-neutral-700" />
              )}

              <button
                className="w-full text-left hover:scale-[1.02] transition-all duration-200 group"
              >
                {/* Stage header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {stage.stage}
                      </h3>
                      {dropoff > 0 && (
                        <p className="text-xs text-error-600 dark:text-error-400 font-medium flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                          {dropoffCount} learners dropped ({dropoff}%)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100">
                      {stage.count}
                    </div>
                    <div className="text-xs text-neutral-500 font-medium">learners</div>
                  </div>
                </div>

                {/* Funnel bar with gradient */}
                <div className="relative flex justify-center">
                  <div
                    className="h-16 bg-gradient-to-r rounded-2xl overflow-hidden shadow-lg relative"
                    style={{
                      width: `${widthPercent}%`
                    }}
                  >
                    <div
                      className={`h-full bg-gradient-to-r ${getColor(i)} relative overflow-hidden group-hover:brightness-110 transition-all`}
                    >
                      {/* Animated shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      {/* Percentage badge */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30">
                          <span className="text-white font-bold text-lg drop-shadow-md">
                            {stage.percent}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Click hint */}
                <div className="mt-2 text-center">
                  <span className="text-xs text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors inline-flex items-center gap-1">
                    View learners at this stage
                    <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-neutral-500 mb-1">Completion Rate</div>
            <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {data[data.length - 1].percent}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500 mb-1">Total Reached End</div>
            <div className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {data[data.length - 1].count}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-neutral-500 mb-1">Avg Drop-off</div>
            <div className="text-lg font-bold text-error-600 dark:text-error-400">
              {Math.round((100 - data[data.length - 1].percent) / (data.length - 1))}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

