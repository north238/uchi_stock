import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler } from "react";
import { PageProps } from "@/types";

export default function UpdateProfileInformation({
  mustVerifyEmail,
  status,
  className = "",
}: {
  mustVerifyEmail: boolean;
  status?: string;
  className?: string;
}) {
  const user = usePage<PageProps>().props.auth.user;

  const { data, setData, patch, errors, processing } = useForm({
    name: user.name,
    email: user.email ?? null,
    lineId: user.line_id ?? null,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    patch(route("profile.update"));
  };

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-ink">プロフィール情報</h2>

        <p className="mt-1 text-sm text-muted">
          プロフィール情報を更新できます。
          <br />
        </p>
      </header>

      <form onSubmit={submit} className="mt-6">
        <div>
          <InputLabel htmlFor="name" value="お名前" />

          <TextInput
            id="name"
            className="mt-1 block w-full"
            value={data.name}
            error={!!errors.name}
            onChange={(e) => setData("name", e.target.value)}
            required
            isFocused
            autoComplete="name"
          />

          <InputError className="mt-2" message={errors.name} />
        </div>
        {!user.line_id && (
          <div>
            <InputLabel htmlFor="email" value="メールアドレス" />

            <TextInput
              id="email"
              type="email"
              className="mt-1 block w-full"
              placeholder="mail@example.com"
              value={data.email}
              error={!!errors.email}
              onChange={(e) => setData("email", e.target.value)}
              autoComplete="username"
            />

            <InputError className="mt-2" message={errors.email} />
          </div>
        )}
        {user.line_id && (
          <div>
            <InputLabel htmlFor="line_id" value="LINE ID" />

            <TextInput
              id="line_id"
              className="mt-1 mb-6 block w-full"
              value={user.line_id}
              disabled
            />
          </div>
        )}
        {mustVerifyEmail && user.email_verified_at === null && (
          <div>
            <p className="text-sm mt-2 text-ink">
              メールアドレスの確認が必要です
              <Link
                href={route("verification.send")}
                method="post"
                as="button"
                className="underline text-sm text-muted hover:text-ink rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                メールを再送信
              </Link>
            </p>

            {status === "verification-link-sent" && (
              <div className="mt-2 font-medium text-sm text-ink">メールを再送信しました</div>
            )}
          </div>
        )}
        <div className="flex items-center">
          <PrimaryButton disabled={processing}>更新する</PrimaryButton>
        </div>
      </form>
    </section>
  );
}
