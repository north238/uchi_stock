import { forwardRef, useEffect, useImperativeHandle, useRef, InputHTMLAttributes } from "react";

export default forwardRef(function TextInput(
  {
    type = "text",
    className = "",
    isFocused = false,
    error = false,
    ...props
  }: InputHTMLAttributes<HTMLInputElement> & {
    isFocused?: boolean;
    error?: boolean;
  },
  ref
) {
  const localRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, []);

  return (
    <input
      {...props}
      type={type}
      className={
        `border ${
          error ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-700"
        } dark:bg-gray-900 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 rounded-md shadow-sm disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-600 placeholder:text-gray-400 ` +
        className
      }
      ref={localRef}
    />
  );
});
