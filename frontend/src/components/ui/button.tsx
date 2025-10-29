import * as React from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-secondary text-white shadow-sm hover:brightness-90 focus-visible:ring-secondary focus-visible:ring-2', // UFS Maroon primary CTA
  secondary:
    'bg-primary text-white shadow-sm hover:brightness-90 focus-visible:ring-secondary focus-visible:ring-2', // UFS Navy secondary
  outline:
    'border-2 border-primary bg-transparent text-primary hover:bg-primary/5 focus-visible:ring-secondary focus-visible:ring-2', // Navy outline
  ghost: 'text-ufs-gray-700 hover:bg-ufs-gray-100 focus-visible:ring-secondary focus-visible:ring-2'
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
