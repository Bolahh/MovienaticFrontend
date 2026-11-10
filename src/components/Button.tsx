import { type ButtonHTMLAttributes, forwardRef } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none';
    const variants: Record<string, string> = {
      primary: 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] active:bg-[#6d28d9]',
      secondary:
        'bg-[#f1f5f9] text-[#0f172a] hover:bg-[#e2e8f0] text-[#0f172a] border border-transparent hover:border-transparent',
      ghost: 'text-[#8b5cf6] hover:bg-[#ede9fe]',
      danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
    };
    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-4 text-lg',
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
