import { Link, Head } from "@inertiajs/react";
import { PageProps } from "@/types";

export default function Welcome({
  auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
  return (
    <>
      <Head title="Welcome" />
      <div className="relative sm:flex sm:justify-center sm:items-center min-h-screen bg-paper selection:bg-accent selection:text-accent-ink">
        <div className="sm:fixed sm:top-0 sm:right-0 p-6 text-end">
          {auth.user ? (
            <Link
              href={route("dashboard")}
              className="font-semibold text-muted hover:text-ink focus:outline focus:outline-2 focus:rounded-sm focus:outline-accent"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href={route("login")}
                className="font-semibold text-muted hover:text-ink focus:outline focus:outline-2 focus:rounded-sm focus:outline-accent"
              >
                ログイン
              </Link>

              <Link
                href={route("register")}
                className="ms-4 font-semibold text-muted hover:text-ink focus:outline focus:outline-2 focus:rounded-sm focus:outline-accent"
              >
                新規登録
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
