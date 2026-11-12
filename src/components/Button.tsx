import { type ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all disabled:opacity-50 disabled:pointer-events-none';
    const variants: Record<string, string> = {
      primary:
        'bg-accent text-white shadow-[0_12px_28px_-14px_rgba(16,12,30,0.75)] hover:-translate-y-px hover:bg-accent-strong',
      secondary:
        'border border-line/10 bg-surface text-ink hover:bg-surface-2',
      ghost: 'text-muted hover:bg-ink/5 hover:text-ink',
      danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
    };
    const sizes: Record<string, string> = {
      sm: 'px-3.5 py-1.5 text-[13px]',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
    };

    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
