import { cn } from '../lib/utils';
import { Metric } from '../mocks/dashboard';
import { Card, CardContent } from './ui/card';

const trendStyles: Record<Metric['trend'], string> = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-neutral-500 dark:text-neutral-400'
};

export function MetricCard({ metric, className }: { metric: Metric; className?: string }) {
  return (
    <Card style={{ boxShadow: 'var(--shadow-elevation)' }} className={cn(className)}>
      <CardContent className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {metric.label}
        </p>
        <p className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          {metric.value}
        </p>
        <p className={cn('text-xs font-medium', trendStyles[metric.trend])}>{metric.change}</p>
      </CardContent>
    </Card>
  );
}
