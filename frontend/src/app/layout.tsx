import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '../components/layout/app-shell';
import { ThemeProvider } from '../components/theme/theme-provider';

export const metadata: Metadata = {
  title: 'AI Mathematics Teacher Assistant',
  description:
    'CAPS-aligned analytics and adaptive pathways for South African mathematics classrooms.'
};

const NAV_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      { href: '/', label: 'Overview', icon: '🏠' },
      { href: '/analytics', label: 'Analytics', icon: '📊' },
    ],
  },
  {
    title: 'Learners',
    items: [
      { href: '/learners', label: 'All Learners', icon: '👥' },
      { href: '/learner-dashboard', label: 'Learner View', icon: '🎓' },
      { href: '/pathways', label: 'Learning Paths', icon: '🛤️' },
    ],
  },
  {
    title: 'Teaching',
    items: [
      { href: '/teachers', label: 'Teacher Tools', icon: '👨‍🏫' },
      { href: '/curriculum', label: 'Curriculum', icon: '📚' },
      { href: '/misconceptions', label: 'Misconceptions', icon: '🎯' },
    ],
  },
  {
    title: 'Assessment',
    items: [
      { href: '/assessments', label: 'All Assessments', icon: '📝' },
      { href: '/take-assessment', label: 'Take Assessment', icon: '✍️' },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppShell navGroups={NAV_GROUPS}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
