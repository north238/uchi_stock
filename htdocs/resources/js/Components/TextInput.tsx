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
          error ? "border-danger" : "border-line"
        } bg-surface text-ink focus:border-accent focus:ring-accent rounded-lg shadow-sm disabled:bg-surface-2 disabled:text-faint placeholder:text-faint ` +
        className
      }
      ref={localRef}
    />
  );
});
