import { SelectHTMLAttributes } from "react";

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string | number; label: string }[];
  error?: boolean;
}

export default function SelectInput({
  options,
  className = "",
  error = false,
  ...props
}: SelectInputProps) {
  return (
    <select
      {...props}
      className={`border ${
        error ? "border-danger" : "border-line"
      } bg-surface text-ink focus:border-accent focus:ring-accent rounded-lg shadow-sm disabled:bg-surface-2 disabled:text-faint placeholder:text-faint ${className}`}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
