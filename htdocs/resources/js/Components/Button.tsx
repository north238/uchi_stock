import { ButtonHTMLAttributes } from "react";

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
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
                inline-flex items-center justify-center w-full rounded
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
                  variant === 'secondary'
                    ? 'bg-gray-600 dark:bg-gray-200 text-white dark:text-gray-500 hover:bg-white hover:text-gray-500 hover:border-gray-500'
                    : variant === 'danger'
                    ? 'bg-red-600 dark:bg-red-200 text-white dark:text-red-500 hover:bg-white hover:text-red-500 hover:border-red-500'
                    : variant === 'warning'
                    ? 'bg-yellow-600 dark:bg-yellow-200 text-white dark:text-yellow-500 hover:bg-white hover:text-yellow-500 hover:border-yellow-500'
                    : variant === 'success'
                    ? 'bg-green-600 dark:bg-green-200 text-white dark:text-green-500 hover:bg-white hover:text-green-500 hover:border-green-500'
                    : 'bg-blue-600 dark:bg-blue-200 text-white dark:text-blue-500 hover:bg-white hover:text-blue-500 hover:border-blue-500'
                }
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                }
                ${className}
            `}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
