import { HTMLAttributes } from "react";

export default function InputError({
  message,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
  return (
    <p {...props} className={"text-sm text-danger visible min-h-4 " + className}>
      {message}
    </p>
  );
}
