import { ButtonHTMLAttributes } from "react";

export default function DangerButton({
  className = "",
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        `inline-flex w-full items-center justify-center px-4 py-2 h-10 bg-danger border border-transparent rounded-md font-semibold text-sm text-danger-ink hover:bg-surface hover:text-danger hover:border-danger focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 transition ease-in-out duration-150 ${
          disabled && "opacity-25"
        } ` + className
      }
      disabled={disabled}
    >
      {children}
    </button>
  );
}
