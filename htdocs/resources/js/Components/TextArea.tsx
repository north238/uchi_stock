import { forwardRef, useEffect, useImperativeHandle, useRef, TextareaHTMLAttributes } from "react";

export const TextArea = forwardRef(function TextArea(
  {
    className = "",
    isFocused = false,
    error = false,
    ...props
  }: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    isFocused?: boolean;
    error?: boolean;
  },
  ref
) {
  const localRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => localRef.current?.focus(),
  }));

  useEffect(() => {
    if (isFocused) {
      localRef.current?.focus();
    }
  }, []);

  return (
    <textarea
      {...props}
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
