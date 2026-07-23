import GuestLayout from "@/Layouts/GuestLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";

export default function VerifyEmail({ status }: { status?: string }) {
  const { post, processing } = useForm({});

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route("verification.send"));
  };

  return (
    <GuestLayout>
      <Head title="Email Verification" />

      <div className="mb-4 text-sm text-muted">
        Thanks for signing up! Before getting started, could you verify your email address by
        clicking on the link we just emailed to you? If you didn't receive the email, we will gladly
        send you another.
      </div>

      {status === "verification-link-sent" && (
        <div className="mb-4 font-medium text-sm text-ink">
          A new verification link has been sent to the email address you provided during
          registration.
        </div>
      )}

      <form onSubmit={submit}>
        <div className="mt-4 flex items-center justify-between">
          <PrimaryButton disabled={processing}>Resend Verification Email</PrimaryButton>

          <Link
            href={route("logout")}
            method="post"
            as="button"
            className="underline text-sm text-muted hover:text-ink rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Log Out
          </Link>
        </div>
      </form>
    </GuestLayout>
  );
}
