import { useEffect, FormEventHandler, MouseEventHandler, useState } from "react";
import Checkbox from "@/Components/Checkbox";
import Divider from "@/Components/Divider";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import LineLogin from "@/Components/LineLogin";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ canResetPassword }: { canResetPassword: boolean }) {
  const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    return () => {
      reset("password");
    };
  }, []);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route("login"));
  };

  const lineLoginClick: MouseEventHandler = (e) => {
    e.preventDefault();
    setDisabled(true);

    const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:8080";
    window.location.href = `${baseUrl}/login/line/redirect`;
  };

  return (
    <GuestLayout>
      <Head title="ログイン" />

      <form onSubmit={submit} className="space-y-3">
        <div>
          <InputLabel htmlFor="email" value="メールアドレス" />

          <TextInput
            id="email"
            type="email"
            name="email"
            placeholder="mail@example.com"
            value={data.email}
            error={!!errors.email}
            className="mt-1 block w-full"
            autoComplete="username"
            isFocused={true}
            onChange={(e) => {
              setData("email", e.target.value);
              clearErrors("email");
            }}
          />

          <InputError message={errors.email} className="mt-1" />
        </div>

        <div>
          <div className="flex justify-between">
            <InputLabel htmlFor="password" value="パスワード" />
            {canResetPassword && (
              <Link
                href={route("password.request")}
                className="underline text-sm text-LINK01 hover:text-blue-700 dark:hover:text-blue-100 visited:text-LINK02"
              >
                パスワードを忘れた場合
              </Link>
            )}
          </div>

          <TextInput
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={data.password}
            error={!!errors.password}
            className="mt-1 block w-full"
            autoComplete="current-password"
            onChange={(e) => {
              setData("password", e.target.value);
              clearErrors("password");
            }}
          />

          <InputError message={errors.password} className="mt-1" />
        </div>

        <div className="block">
          <label className="flex items-center">
            <Checkbox
              name="remember"
              checked={data.remember}
              onChange={(e) => setData("remember", e.target.checked)}
            />
            <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
              ログインを維持する
            </span>
          </label>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <PrimaryButton disabled={processing}>ログイン</PrimaryButton>
          <Link
            href={route("register")}
            className="underline text-sm text-LINK01 hover:text-blue-700 dark:hover:text-blue-100 visited:text-LINK02"
          >
            新規登録はお済みですか？
          </Link>
        </div>
      </form>
      <Divider />
      <div>
        <LineLogin onClick={lineLoginClick} disabled={disabled}>
          LINEログイン
        </LineLogin>
      </div>
    </GuestLayout>
  );
}
