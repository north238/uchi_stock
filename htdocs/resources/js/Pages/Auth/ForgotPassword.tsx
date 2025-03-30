import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import InputLabel from "@/Components/InputLabel";

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: "",
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("password.email"));
    };

    return (
        <GuestLayout>
            <Head title="パスワード再設定" />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                パスワード再設定用のメールアドレスを入力してください。
            </div>

            {status && (
                <div className="mb-4 font-medium text-sm text-green-600 dark:text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <InputLabel htmlFor="email" value="メールアドレス" />
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    placeholder="mail@example.com"
                    value={data.email}
                    error={!!errors.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={(e) => {
                        setData("email", e.target.value);
                        clearErrors("email");
                    }}
                />

                <InputError message={errors.email} className="mt-2" />

                <div className="flex flex-col items-center justify-center gap-2 mt-4">
                    <PrimaryButton className="" disabled={processing}>
                        パスワード再設定リンクを送信
                    </PrimaryButton>
                    <Link
                        href={route("login")}
                        className="underline text-sm text-LINK01 hover:text-blue-700 dark:hover:text-blue-100 visited:text-LINK02"
                    >
                        ログイン画面に戻る
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
