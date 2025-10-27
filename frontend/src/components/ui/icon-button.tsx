import * as React from 'react';
import { cn } from '../../lib/utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'solid';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'solid', type = 'button', ...props }, ref) => {
    const baseClasses =
      'inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

    const variantClasses =
      variant === 'solid'
        ? 'bg-neutral-900 text-white hover:bg-neutral-700 focus-visible:ring-neutral-900'
        : 'text-neutral-600 hover:bg-neutral-100 focus-visible:ring-neutral-300';

    return (
      <button
        ref={ref}
        type={type}
        className={cn(baseClasses, variantClasses, className)}
        {...props}
      />
    );
  }
);

IconButton.displayName = 'IconButton';
