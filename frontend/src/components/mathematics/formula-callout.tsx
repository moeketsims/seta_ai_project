import { cn } from '../../lib/utils';

export function FormulaCallout({
  title,
  expression,
  description,
  className
}: {
  title: string;
  expression: string;
  description: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        'rounded-2xl border border-primary/20 bg-primary/5 p-6 text-neutral-900 shadow-sm dark:border-primary/30 dark:bg-primary/10 dark:text-neutral-100',
        className
      )}
    >
      <figcaption className="text-sm font-semibold uppercase tracking-wide text-primary">
        {title}
      </figcaption>
      <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-white/80 p-4 font-mono text-sm leading-relaxed shadow-inner dark:bg-neutral-950/80">
        {expression}
      </pre>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-200">{description}</p>
    </figure>
  );
}
