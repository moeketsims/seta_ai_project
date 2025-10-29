export interface NarrationMetric {
  label: string;
  value: string;
  emphasis?: 'positive' | 'negative' | 'neutral';
  context?: string;
}

export interface NarrationCallout {
  title: string;
  detail: string;
}

export interface NarrationPayload {
  widgetId: string;
  widgetLabel: string;
  audience: 'teacher' | 'leader' | 'analyst';
  timeframe?: string;
  focus?: string;
  summary: string;
  metrics: NarrationMetric[];
  callouts?: NarrationCallout[];
  recommendations?: string[];
  dataTimestamp?: string;
}

function summarizeMetrics(metrics: NarrationMetric[]): string {
  if (!metrics.length) {
    return '';
  }

  return metrics
    .map((metric) => {
      const base = `${metric.label} ${metric.value}`;
      if (metric.context) {
        return `${base} (${metric.context})`;
      }
      return base;
    })
    .join('; ');
}

export function generateNarrationScript(payload: NarrationPayload): string {
  const parts: string[] = [];

  parts.push(payload.summary);

  const metricSummary = summarizeMetrics(payload.metrics);
  if (metricSummary) {
    parts.push(metricSummary);
  }

  if (payload.recommendations?.length) {
    parts.push(`Recommended next steps: ${payload.recommendations.join('; ')}`);
  }

  return parts.join(' ');
}

export function logNarrationPreview(payload: NarrationPayload, draft?: string) {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return;
  }

  const script = draft ?? generateNarrationScript(payload);

  /* eslint-disable no-console */
  console.groupCollapsed(`🗣️ Narration Preview → ${payload.widgetLabel}`);
  console.log('payload', payload);
  console.log('draftScript', script);
  console.groupEnd();
  /* eslint-enable no-console */
}

export function buildPayloadSignature(payload: NarrationPayload): string {
  return JSON.stringify({
    widgetId: payload.widgetId,
    metrics: payload.metrics,
    summary: payload.summary,
    recommendations: payload.recommendations,
    focus: payload.focus,
    timeframe: payload.timeframe,
    dataTimestamp: payload.dataTimestamp,
  });
}
