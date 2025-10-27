import { Badge } from './ui/badge';

export function StatusPill({ status }: { status: 'pending' | 'resolved' }) {
  const tone = status === 'resolved' ? 'success' : 'warning';
  const label = status === 'resolved' ? 'Resolved' : 'Pending';

  return <Badge tone={tone}>{label}</Badge>;
}
