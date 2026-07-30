import { ButtonHTMLAttributes } from "react";

export default function PrimaryButton({
  className = "",
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`
                inline-flex items-center justify-center w-full px-4 py-2
                bg-accent
                border border-transparent rounded-md
                font-semibold text-base text-accent-ink
                transition ease-in-out duration-150
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-surface hover:text-accent hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
                }
                ${className}
            `}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
