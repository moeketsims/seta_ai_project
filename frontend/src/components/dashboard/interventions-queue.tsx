'use client';

import { useState } from 'react';

interface Intervention {
  name: string;
  grade: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
}

interface InterventionsQueueProps {
  interventions: Intervention[];
  totalCount?: number; // Total interventions including those not shown
}

export function InterventionsQueue({ interventions, totalCount }: InterventionsQueueProps) {
  const [expanded, setExpanded] = useState(false);
  const displayCount = expanded ? interventions.length : Math.min(5, interventions.length);
  const visibleInterventions = interventions.slice(0, displayCount);
  const actualTotal = totalCount || interventions.length;

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-400';
    if (severity === 'medium') return 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-400';
    return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400';
  };

  const getSeverityDot = (severity: string) => {
    if (severity === 'high') return 'bg-error-500';
    if (severity === 'medium') return 'bg-warning-500';
    return 'bg-neutral-400';
  };

  const getSeverityLabel = (severity: string) => {
    if (severity === 'high') return 'Urgent';
    if (severity === 'medium') return 'Important';
    return 'Normal';
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-5 border border-neutral-200 dark:border-neutral-800 h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
            Interventions Queue
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {actualTotal > displayCount ? `Showing ${displayCount} of ${actualTotal}` : 'Prioritized by urgency'}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-400 text-xs font-bold shadow-sm">
          {actualTotal}
        </span>
      </div>

      {interventions.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-neutral-600 dark:text-neutral-400 font-medium">No interventions needed!</p>
          <p className="text-xs text-neutral-500 mt-1">All learners are on track</p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {visibleInterventions.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all group bg-neutral-50/30 dark:bg-neutral-800/30"
              >
                <div className="flex items-start gap-2.5 mb-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${getSeverityDot(item.severity)} mt-1 flex-shrink-0 shadow-sm`}></span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate">{item.name}</p>
                      <span className="text-[10px] text-neutral-500 flex-shrink-0 font-medium">{item.time}</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">{item.grade} • {item.reason}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${getSeverityColor(item.severity)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${getSeverityDot(item.severity)}`}></span>
                      {getSeverityLabel(item.severity)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all hover:scale-105 shadow-sm hover:shadow-md group/btn"
                    title="Schedule a one-on-one session with this learner"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      📞 Schedule 1:1
                    </span>
                  </button>
                  <button
                    className="px-3 py-2 text-xs font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 transition-all hover:scale-105"
                    title="Assign practice worksheets tailored to their needs"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      📝 Assign Practice
                    </span>
                  </button>
                  <button
                    className="px-3 py-2 text-xs font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-950 transition-all hover:scale-105"
                    title="Add to group session with similar learners"
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      👥 Group Session
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {interventions.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-3 py-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950 rounded-lg transition-colors"
            >
              {expanded ? '↑ Show Less' : `↓ View All ${interventions.length} Interventions`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

