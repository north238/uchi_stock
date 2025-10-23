import { useEffect, useState, FormEventHandler, MouseEventHandler } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import Divider from "@/Components/Divider";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import LineLogin from "@/Components/LineLogin";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Register() {
  const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    return () => {
      reset("password", "password_confirmation");
    };
  }, []);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route("register"));
  };

  const lineLoginClick: MouseEventHandler = (e) => {
    e.preventDefault();
    setDisabled(true);

    const baseUrl = import.meta.env.VITE_APP_URL || "http://localhost:8080";
    window.location.href = `${baseUrl}/login/line/redirect`;
  };

  return (
    <GuestLayout>
      <Head title="新規登録" />

      <form onSubmit={submit}>
        <div>
          <InputLabel htmlFor="name" value="お名前" />

          <TextInput
            id="name"
            name="name"
            value={data.name}
            placeholder="山田 太郎"
            error={!!errors.name}
            className="mt-1 block w-full"
            autoComplete="name"
            isFocused={true}
            onChange={(e) => {
              setData("name", e.target.value);
              clearErrors("name");
            }}
          />

          <InputError message={errors.name} className="mt-2" />
        </div>

        <div className="mt-4">
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
            onChange={(e) => {
              setData("email", e.target.value);
              clearErrors("email");
            }}
          />

          <InputError message={errors.email} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password" value="パスワード" />

          <TextInput
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={data.password}
            error={!!errors.password}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) => {
              setData("password", e.target.value);
              clearErrors("password");
            }}
          />

          <InputError message={errors.password} className="mt-2" />
        </div>

        <div className="mt-4">
          <InputLabel htmlFor="password_confirmation" value="パスワード確認" />

          <TextInput
            id="password_confirmation"
            type="password"
            name="password_confirmation"
            placeholder="••••••••"
            value={data.password_confirmation}
            error={!!errors.password_confirmation}
            className="mt-1 block w-full"
            autoComplete="new-password"
            onChange={(e) => {
              setData("password_confirmation", e.target.value);
              clearErrors("password_confirmation");
            }}
          />

          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <div className="flex flex-col items-center justify-center gap-2 mt-4">
          <PrimaryButton className="" disabled={processing}>
            新規登録する
          </PrimaryButton>
          <Link
            href={route("login")}
            className="underline text-sm text-LINK01 hover:text-blue-700 dark:hover:text-blue-100 visited:text-LINK02"
          >
            登録済みの方はこちら
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
