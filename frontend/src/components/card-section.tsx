import { Card, CardContent, CardTitle } from './ui/card';

export function CardSection({
  title,
  items
}: {
  title: string;
  items: { heading: string; body: string }[];
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <CardTitle className="text-neutral-900 dark:text-neutral-100">{title}</CardTitle>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.heading}
              className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700 shadow-sm dark:bg-neutral-900/40 dark:text-neutral-200"
            >
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">{item.heading}</p>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">{item.body}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
