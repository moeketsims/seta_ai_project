'use client';

interface KPITarget {
  label: string;
  actual: number;
  target: number;
  unit: string;
}

interface KPIBulletsProps {
  kpis: KPITarget[];
}

export function KPIBullets({ kpis }: KPIBulletsProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
            Target vs Actual
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">3 key performance indicators</p>
        </div>
        <span className="text-xs text-neutral-500">(this week)</span>
      </div>
      <div className="space-y-5">
        {kpis.map((kpi) => {
          const percent = (kpi.actual / kpi.target) * 100;
          const isOnTarget = kpi.actual >= kpi.target;
          return (
            <div key={kpi.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                  {kpi.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isOnTarget ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                    {kpi.actual}{kpi.unit}
                  </span>
                  <span className="text-xs text-neutral-500">/ {kpi.target}{kpi.unit}</span>
                </div>
              </div>
              <div className="relative h-6 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                {/* Target marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-neutral-900 dark:bg-neutral-100 z-10"
                  style={{ left: '100%' }}
                >
                  <div className="absolute -left-1 -top-1 w-2 h-2 bg-neutral-900 dark:bg-neutral-100 rounded-full" />
                </div>
                {/* Actual bar */}
                <div
                  className={`absolute inset-y-0 left-0 rounded-full ${
                    isOnTarget
                      ? 'bg-gradient-to-r from-success-500 to-success-600'
                      : 'bg-gradient-to-r from-error-500 to-error-600'
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                {isOnTarget ? (
                  <span className="text-success-600 dark:text-success-400">✓ On target</span>
                ) : (
                  <span className="text-error-600 dark:text-error-400">
                    {kpi.target - kpi.actual}{kpi.unit} below target
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

