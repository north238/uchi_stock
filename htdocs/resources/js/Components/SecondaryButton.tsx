import { ButtonHTMLAttributes } from "react";

export default function SecondaryButton({
  type = "button",
  className = "",
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type={type}
      className={
        `inline-flex w-full items-center justify-center px-4 py-2 bg-surface border border-line-strong rounded-md font-semibold text-sm text-ink shadow-sm hover:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 ${
          disabled && "opacity-25"
        } ` + className
      }
      disabled={disabled}
    >
      {children}
    </button>
  );
}
