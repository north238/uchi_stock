import { useRef, FormEventHandler } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";

export default function RegisterPasswordForm({
    className = "",
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, post, reset, processing } = useForm({
        password: "",
        password_confirmation: "",
    });

    const registerPassword: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("password.register"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation");
                    passwordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    パスワード登録
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    パスワードを入力してください。
                    <br />
                    パスワードは、8文字以上である必要があります。
                </p>
            </header>

            <form onSubmit={registerPassword} className="mt-6 space-y-2">
                <div>
                    <InputLabel htmlFor="password" value="パスワード" />

                    <TextInput
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={data.password}
                        error={!!errors.password}
                        className="mt-1 block w-full"
                        onChange={(e) => setData("password", e.target.value)}
                        autoComplete="new-password"
                        ref={passwordInput}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="パスワード確認"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        placeholder="••••••••"
                        className="mt-1 block w-full"
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center">
                    <PrimaryButton disabled={processing}>
                        登録する
                    </PrimaryButton>
                </div>
            </form>
        </section>
    );
}
