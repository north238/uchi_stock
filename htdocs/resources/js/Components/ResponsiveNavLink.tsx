import { Link, InertiaLinkProps } from "@inertiajs/react";

export default function ResponsiveNavLink({
  active = false,
  className = "",
  children,
  ...props
}: InertiaLinkProps & { active?: boolean }) {
  return (
    <Link
      {...props}
      className={`w-full flex items-start ps-3 pe-4 py-2 border-l-4 ${
        active
          ? "border-accent text-accent bg-accent-soft focus:text-accent focus:bg-accent-soft focus:border-accent"
          : "border-transparent text-muted hover:text-ink hover:bg-surface-2 hover:border-line-strong focus:text-ink focus:bg-surface-2 focus:border-line-strong"
      } text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
    >
      {children}
    </Link>
  );
}
