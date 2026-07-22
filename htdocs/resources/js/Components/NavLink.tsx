import { Link, InertiaLinkProps } from "@inertiajs/react";

export default function NavLink({
  active = false,
  className = "",
  children,
  ...props
}: InertiaLinkProps & { active: boolean }) {
  return (
    <Link
      {...props}
      className={
        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none " +
        (active
          ? "border-accent text-ink focus:border-accent "
          : "border-transparent text-muted hover:text-ink hover:border-line-strong focus:text-ink focus:border-line-strong ") +
        className
      }
    >
      {children}
    </Link>
  );
}
