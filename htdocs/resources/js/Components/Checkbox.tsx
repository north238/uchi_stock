import { InputHTMLAttributes } from "react";

export default function Checkbox({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="checkbox"
      className={
        "rounded bg-surface border-line-strong text-accent shadow-sm focus:ring-accent " +
        className
      }
    />
  );
}
