import { cn } from '../../lib/utils';

export interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 'single' | 'two-third-split';
}

export function DashboardGrid({
  className,
  columns = 'single',
  ...props
}: DashboardGridProps) {
  const baseClasses =
    columns === 'single'
      ? 'grid grid-cols-1 gap-6'
      : 'grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr] xl:items-start';

  return <div className={cn(baseClasses, className)} {...props} />;
}
