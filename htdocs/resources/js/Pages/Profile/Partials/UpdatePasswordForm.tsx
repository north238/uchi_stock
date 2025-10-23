import { useRef, FormEventHandler } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";

export default function UpdatePasswordForm({ className = "" }: { className?: string }) {
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);

  const { data, setData, errors, put, reset, processing } = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const updatePassword: FormEventHandler = (e) => {
    e.preventDefault();

    put(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => reset(),
      onError: (errors) => {
        if (errors.password) {
          reset("password", "password_confirmation");
          passwordInput.current?.focus();
        }

        if (errors.current_password) {
          reset("current_password");
          currentPasswordInput.current?.focus();
        }
      },
    });
  };

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">パスワード更新</h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          パスワードを更新するには、現在のパスワードと新しいパスワードを入力してください。
          <br />
          新しいパスワードは、8文字以上である必要があります。
        </p>
      </header>

      <form onSubmit={updatePassword} className="mt-6 space-y-2">
        <div>
          <InputLabel htmlFor="current_password" value="現在のパスワード" />

          <TextInput
            id="current_password"
            type="password"
            placeholder="••••••••"
            value={data.current_password}
            error={!!errors.current_password}
            onChange={(e) => setData("current_password", e.target.value)}
            className="mt-1 block w-full"
            autoComplete="current-password"
            ref={currentPasswordInput}
          />

          <InputError message={errors.current_password} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password" value="新しいパスワード" />

          <TextInput
            id="password"
            type="password"
            value={data.password}
            placeholder="••••••••"
            error={!!errors.password}
            onChange={(e) => setData("password", e.target.value)}
            className="mt-1 block w-full"
            autoComplete="new-password"
            ref={passwordInput}
          />

          <InputError message={errors.password} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="password_confirmation" value="新しいパスワード確認" />

          <TextInput
            id="password_confirmation"
            type="password"
            placeholder="••••••••"
            value={data.password_confirmation}
            onChange={(e) => setData("password_confirmation", e.target.value)}
            className="mt-1 block w-full"
            autoComplete="new-password"
          />

          <InputError message={errors.password_confirmation} className="mt-2" />
        </div>

        <div className="flex items-center">
          <PrimaryButton disabled={processing}>更新する</PrimaryButton>
        </div>
      </form>
    </section>
  );
}
