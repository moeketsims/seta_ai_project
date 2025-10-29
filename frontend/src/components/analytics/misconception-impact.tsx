'use client';

interface Misconception {
  label: string;
  count: number;
}

interface MisconceptionImpactProps {
  misconceptions: Misconception[];
}

export function MisconceptionImpact({ misconceptions }: MisconceptionImpactProps) {
  if (misconceptions.length === 0) {
    return <div className="h-40 flex items-center justify-center text-ufs-gray-500">No data available</div>;
  }
  
  const maxCount = Math.max(...misconceptions.map(m => m.count));
  
  // Calculate circle size - scale based on impact
  const getCircleSize = (count: number) => {
    const minSize = 80;
    const maxSize = 140;
    return minSize + ((count / maxCount) * (maxSize - minSize));
  };
  
  return (
    <div className="flex justify-center items-end gap-8 flex-wrap">
      {misconceptions.map((item, i) => {
        const size = getCircleSize(item.count);
        
        return (
          <div
            key={item.label}
            className="flex flex-col items-center group cursor-pointer"
            style={{ animation: `fadeIn 0.4s ease-out ${i * 0.1}s both` }}
          >
            {/* Maroon Impact Circle */}
            <div 
              className="relative flex items-center justify-center bg-[var(--ufs-maroon)] rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ width: size, height: size }}
            >
              {/* Huge Number */}
              <div className="text-5xl font-bold text-white tabular-nums leading-none">
                {item.count}
              </div>
            </div>
            
            {/* Label Below */}
            <div className="mt-4 text-center max-w-[140px]">
              <div className="text-sm font-bold text-ufs-gray-900 leading-tight">
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

