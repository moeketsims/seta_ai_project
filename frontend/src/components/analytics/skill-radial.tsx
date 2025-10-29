'use client';

interface SkillRadialProps {
  label: string;
  value: number;
  size?: number;
}

export function SkillRadial({ label, value, size = 120 }: SkillRadialProps) {
  // Calculate circle dimensions
  const radius = size / 2;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center group">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Custom SVG Circle - Navy */}
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            stroke="#E5E7EB"
            fill="none"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle - Navy */}
          <circle
            stroke="var(--ufs-navy)"
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-500"
          />
        </svg>
        
        {/* Huge Center Number - Brutalist */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-4xl font-bold text-[var(--ufs-navy)] tabular-nums leading-none">
            {value}
            <span className="text-xl">%</span>
          </div>
        </div>
      </div>
      
      {/* Label Below */}
      <div className="mt-3 text-center">
        <div className="text-sm font-bold text-ufs-gray-900">{label}</div>
      </div>
    </div>
  );
}

// Wrapper for multiple skills in a row
interface SkillRadialGroupProps {
  skills: Array<{ label: string; value: number }>;
}

export function SkillRadialGroup({ skills }: SkillRadialGroupProps) {
  return (
    <div className="flex justify-between items-center gap-6 flex-wrap">
      {skills.map((skill) => (
        <SkillRadial key={skill.label} label={skill.label} value={skill.value} />
      ))}
    </div>
  );
}

