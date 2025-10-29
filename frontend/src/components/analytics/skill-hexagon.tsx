'use client';

interface SkillHexagonProps {
  label: string;
  value: number;
}

export function SkillHexagon({ label, value }: SkillHexagonProps) {
  const size = 140;
  const strokeWidth = 8; // Bolder stroke for more impact
  
  // COLOR LOGIC: Maroon for struggling (<60%), Navy for good (≥60%)
  const isStruggling = value < 60;
  const strokeColor = isStruggling ? 'var(--ufs-maroon)' : 'var(--ufs-navy)';
  const fillColor = isStruggling ? 'rgba(167, 25, 48, 0.08)' : 'rgba(15, 32, 75, 0.08)';
  const textColor = isStruggling ? 'text-[var(--ufs-maroon)]' : 'text-[var(--ufs-navy)]';
  
  // Create hexagon path
  const createHexagonPath = (cx: number, cy: number, radius: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')} Z`;
  };
  
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - strokeWidth;
  const innerRadius = outerRadius * 0.85;
  
  // Calculate fill percentage for inner hexagon
  const fillRadius = innerRadius + (outerRadius - innerRadius) * (value / 100);
  
  return (
    <div className="flex flex-col items-center group cursor-pointer">
      <div className="relative hover:scale-105 transition-transform duration-300" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="drop-shadow-lg">
          {/* Background hexagon - light gray */}
          <path
            d={createHexagonPath(cx, cy, outerRadius)}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
          />
          
          {/* Progress hexagon - Navy or Maroon based on performance */}
          <path
            d={createHexagonPath(cx, cy, fillRadius)}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="miter"
            className="transition-all duration-700"
          />
        </svg>
        
        {/* Huge Center Number - Colored by performance */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-bold ${textColor} tabular-nums leading-none`}>
            {value}
            <span className="text-2xl">%</span>
          </div>
        </div>
      </div>
      
      {/* Label Below + Critical Badge */}
      <div className="mt-4 text-center">
        <div className="text-sm font-bold text-ufs-gray-900">{label}</div>
        {isStruggling && (
          <div className="mt-2 px-2 py-1 bg-[var(--ufs-maroon)] text-white text-xs font-bold uppercase tracking-wider rounded inline-block animate-pulse">
            At Risk
          </div>
        )}
      </div>
    </div>
  );
}

// Grid layout for hexagons
interface SkillHexagonGridProps {
  skills: Array<{ label: string; value: number }>;
}

export function SkillHexagonGrid({ skills }: SkillHexagonGridProps) {
  return (
    <div className="flex justify-center items-center gap-8 flex-wrap">
      {skills.map((skill) => (
        <SkillHexagon key={skill.label} label={skill.label} value={skill.value} />
      ))}
    </div>
  );
}

