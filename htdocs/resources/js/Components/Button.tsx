import { ButtonHTMLAttributes } from "react";

type ButtonVariant = 'primary' | 'neutral' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
                inline-flex items-center justify-center w-full rounded-md
                transition ease-in-out duration-150
                font-semibold
                ${
                  size === 'sm'
                    ? 'px-2 py-1 text-sm'
                    : size === 'lg'
                    ? 'px-6 py-3 text-lg'
                    : 'px-4 py-2 text-base'
                }
                ${
                  variant === 'neutral'
                    ? 'bg-surface border border-line-strong text-ink hover:bg-surface-2'
                    : variant === 'danger'
                    ? 'bg-danger text-danger-ink hover:bg-surface hover:text-danger hover:border hover:border-danger'
                    : variant === 'ghost'
                    ? 'bg-transparent text-accent hover:bg-accent-soft'
                    : 'bg-accent text-accent-ink hover:bg-surface hover:text-accent hover:border hover:border-accent'
                }
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : `focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        variant === 'danger' ? 'focus:ring-danger' : 'focus:ring-accent'
                      }`
                }
                ${className}
            `}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
