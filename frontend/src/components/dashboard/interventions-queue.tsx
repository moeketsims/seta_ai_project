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
    if (severity === 'high') return 'bg-[var(--ufs-maroon)]'; // Maroon for urgent
    if (severity === 'medium') return 'bg-[var(--ufs-navy)]'; // Navy for important
    return 'bg-ufs-gray-500'; // Gray for normal
  };

  const getSeverityBorderColor = (severity: string) => {
    if (severity === 'high') return 'border-[var(--ufs-maroon)]';
    if (severity === 'medium') return 'border-[var(--ufs-navy)]';
    return 'border-ufs-gray-300';
  };

  const getSeverityLabel = (severity: string) => {
    if (severity === 'high') return 'Urgent';
    if (severity === 'medium') return 'Important';
    return 'Normal';
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-8 h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-ufs-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-[var(--ufs-navy)]">
            Interventions Queue
          </h2>
          <p className="text-sm text-ufs-gray-500 mt-1">
            Prioritized by urgency
          </p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-bold text-[var(--ufs-maroon)] tabular-nums">{actualTotal}</div>
          <div className="text-xs font-bold uppercase tracking-wider text-ufs-gray-500 mt-1">Total</div>
        </div>
      </div>

      {interventions.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-ufs-gray-700 font-bold text-lg">No interventions needed</p>
          <p className="text-sm text-ufs-gray-500 mt-2">All learners are on track</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {visibleInterventions.map((item, i) => (
              <div
                key={i}
                className={`relative pl-6 pr-4 py-4 rounded-lg bg-white border-l-4 ${getSeverityBorderColor(item.severity)} hover:shadow-lg transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ufs-gray-900 text-base truncate">{item.name}</p>
                    <p className="text-sm text-ufs-gray-600 mt-1">{item.grade} • {item.reason}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-ufs-gray-500">{item.time}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getSeverityColor(item.severity)}`}>
                      {getSeverityLabel(item.severity)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  <button
                    className="flex-1 px-3 py-2 text-xs font-bold bg-[var(--ufs-navy)] text-white rounded-lg hover:brightness-90 transition-all"
                    title="Schedule a one-on-one session with this learner"
                  >
                    Schedule 1:1
                  </button>
                  <button
                    className="px-3 py-2 text-xs font-medium border-2 border-ufs-gray-300 text-ufs-gray-700 rounded-lg hover:border-[var(--ufs-navy)] transition-all"
                    title="Assign practice worksheets tailored to their needs"
                  >
                    Assign Practice
                  </button>
                  <button
                    className="px-3 py-2 text-xs font-medium border-2 border-ufs-gray-300 text-ufs-gray-700 rounded-lg hover:border-[var(--ufs-navy)] transition-all"
                    title="Add to group session with similar learners"
                  >
                    Group Session
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

