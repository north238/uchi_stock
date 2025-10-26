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
        error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-700"
      } dark:bg-gray-900 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 rounded-md shadow-sm disabled:bg-gray-200 disabled:text-gray-500 placeholder:text-gray-400 ${className}`}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
