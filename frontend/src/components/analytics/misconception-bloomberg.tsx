'use client';

interface Misconception {
  label: string;
  count: number;
}

interface MisconceptionBloombergProps {
  misconceptions: Misconception[];
}

export function MisconceptionBloomberg({ misconceptions }: MisconceptionBloombergProps) {
  if (misconceptions.length === 0) {
    return <div className="h-40 flex items-center justify-center text-ufs-gray-500">No data available</div>;
  }
  
  const maxCount = Math.max(...misconceptions.map(m => m.count));
  const sortedMisconceptions = [...misconceptions].sort((a, b) => b.count - a.count);
  
  return (
    <div className="space-y-4">
      {sortedMisconceptions.map((item, i) => {
        const barWidth = (item.count / maxCount) * 100;
        const isCritical = i === 0; // Highest count is critical
        
        return (
          <div key={item.label} className="group">
            {/* Bloomberg-Style Row */}
            <div className="flex items-center gap-4 mb-2">
              {/* Left: Label (fixed width) */}
              <div className="w-48 flex-shrink-0">
                <div className="text-sm font-bold text-ufs-gray-900 leading-tight flex items-center gap-2">
                  <span className="text-ufs-gray-500 font-mono text-xs">#{i + 1}</span>
                  {item.label}
                </div>
              </div>
              
              {/* Middle: Bar */}
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-8 bg-ufs-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-[var(--ufs-maroon)] transition-all duration-700 flex items-center justify-end pr-3"
                    style={{ width: `${barWidth}%` }}
                  >
                    {barWidth > 20 && (
                      <span className="text-xs font-bold text-white">{item.count} learners</span>
                    )}
                  </div>
                </div>
                
                {/* Right: Number + Critical Tag */}
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-[var(--ufs-maroon)] tabular-nums min-w-[60px] text-right">
                    {item.count}
                  </div>
                  {isCritical && (
                    <div className="px-3 py-1 bg-[var(--ufs-maroon)] text-white text-xs font-bold uppercase tracking-wider rounded">
                      CRITICAL
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Subtle divider */}
            {i < sortedMisconceptions.length - 1 && (
              <div className="h-px bg-ufs-gray-200 ml-48"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}




