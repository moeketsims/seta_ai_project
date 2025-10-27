'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '../theme/theme-toggle';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

export type NavLink = {
  href: string;
  label: string;
  icon?: string;
};

export type NavGroup = {
  title: string;
  items: NavLink[];
};

export interface AppShellProps {
  navGroups?: NavGroup[];
  children: React.ReactNode;
}

export function AppShell({ navGroups = [], children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);

  // Command palette shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-800 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-white border-r border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
            {sidebarOpen ? (
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 text-xs font-bold text-white shadow-md">
                  AI
                </span>
                <span className="font-semibold text-sm">CAPS Math AI</span>
              </div>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 text-xs font-bold text-white shadow-md mx-auto">
                AI
              </span>
            )}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="Collapse sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-6">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-full flex items-center justify-center h-10 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Expand sidebar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {navGroups.map((group, idx) => (
              <div key={idx}>
                {sidebarOpen && (
                  <div className="px-3 mb-2">
                    <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      collapsed={!sidebarOpen}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
            <div className={cn('flex items-center gap-2', !sidebarOpen && 'justify-center')}>
              {sidebarOpen && <Badge tone="success" className="text-xs">Pilot</Badge>}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:bg-neutral-900/80 dark:border-neutral-800">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCommandOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Quick search</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-mono bg-neutral-200 dark:bg-neutral-700 rounded border border-neutral-300 dark:border-neutral-600">
                  {typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl+'}K
                </kbd>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)] p-6">
          {children}
        </main>

        <footer className="border-t border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 py-4 px-6 text-xs text-neutral-500 dark:text-neutral-400">
          © {new Date().getFullYear()} CAPS Mathematics AI Pilot · Built for teachers, learners, and administrators.
        </footer>
      </div>

      {/* Command Palette */}
      {commandOpen && (
        <CommandPalette
          navGroups={navGroups}
          onClose={() => setCommandOpen(false)}
        />
      )}
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
  collapsed,
}: {
  href: string;
  label: string;
  icon?: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href as any}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
      )}
      title={collapsed ? label : undefined}
    >
      {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function CommandPalette({
  navGroups,
  onClose,
}: {
  navGroups: NavGroup[];
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const pathname = usePathname();

  const allItems = navGroups.flatMap((group) =>
    group.items.map((item) => ({ ...item, group: group.title }))
  );

  const filtered = search
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(search.toLowerCase()) ||
          item.group.toLowerCase().includes(search.toLowerCase())
      )
    : allItems;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-neutral-200 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">No results found</div>
          ) : (
            filtered.map((item) => (
              <Link
                key={item.href}
                href={item.href as any}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
                  pathname === item.href && 'bg-neutral-100 dark:bg-neutral-800'
                )}
              >
                {item.icon && <span className="text-xl">{item.icon}</span>}
                <div className="flex-1">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {item.label}
                  </div>
                  <div className="text-xs text-neutral-500">{item.group}</div>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">↑</kbd>
              <kbd className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">↵</kbd>
              to select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">esc</kbd>
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
