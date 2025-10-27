import { cn } from '../../lib/utils';
import { ReactNode } from 'react';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  hover?: boolean;
}

export function PremiumCard({
  children,
  className,
  variant = 'default',
  hover = true,
}: PremiumCardProps) {
  const variants = {
    default: 'bg-white border border-neutral-200/60 shadow-lg',
    glass: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-glass',
    gradient: 'bg-gradient-to-br from-white to-neutral-50 border border-neutral-200/60 shadow-xl',
    elevated: 'bg-white shadow-2xl border-0',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]',
        className
      )}
    >
      {children}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export function MetricCard({ title, value, icon, trend, subtitle, color = 'primary' }: MetricCardProps) {
  const colorClasses = {
    primary: {
      bg: 'from-primary-500 to-primary-600',
      icon: 'bg-primary-100 text-primary-600',
      text: 'text-primary-600',
    },
    secondary: {
      bg: 'from-secondary-500 to-secondary-600',
      icon: 'bg-secondary-100 text-secondary-600',
      text: 'text-secondary-600',
    },
    success: {
      bg: 'from-success-500 to-success-600',
      icon: 'bg-success-50 text-success-600',
      text: 'text-success-600',
    },
    warning: {
      bg: 'from-warning-500 to-warning-600',
      icon: 'bg-warning-50 text-warning-600',
      text: 'text-warning-600',
    },
    error: {
      bg: 'from-error-500 to-error-600',
      icon: 'bg-error-50 text-error-600',
      text: 'text-error-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <PremiumCard variant="gradient" className="overflow-hidden relative group">
      {/* Subtle gradient overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.08]',
        colors.bg
      )} />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
            {trend && (
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    'text-xs font-semibold flex items-center gap-0.5',
                    trend.isPositive ? 'text-success-600' : 'text-error-600'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shadow-sm', colors.icon)}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="mt-2">
          <p className={cn('text-4xl font-bold tracking-tight', colors.text)}>{value}</p>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-2">{subtitle}</p>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}











