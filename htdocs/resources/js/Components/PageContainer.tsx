import { PropsWithChildren } from "react";

export default function PageContainer({
  className = "",
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`mx-auto max-w-page px-4 py-6 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  );
}
