import { useRef, useState, FormEventHandler } from "react";
import DangerButton from "@/Components/DangerButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import SecondaryButton from "@/Components/SecondaryButton";
import TextInput from "@/Components/TextInput";
import { useForm } from "@inertiajs/react";
import { User } from "@/types";

export default function DeleteGroupForm({
    className = "",
    auth,
}: {
    className?: string;
    auth: {
        user: User;
    };
}) {
    const [confirmingGroupDeletion, setConfirmingGroupDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: "",
    });

    const confirmGroupDeletion = () => {
        setConfirmingGroupDeletion(true);
    };

    const deleteGroup: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route("group.destroy"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingGroupDeletion(false);

        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    グループ削除
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    グループを削除すると、すべてのリソースとデータが完全に削除されます。
                    <br />
                    削除したグループは復元できませんのでご注意ください。
                    <br />
                    グループを削除するには、パスワードを入力してください。
                </p>
            </header>

            {auth.user.is_password_set === false ? (
                <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    グループを削除するには、まずパスワードを設定してください。
                </p>
            ) : (
                <DangerButton onClick={confirmGroupDeletion}>
                    削除する
                </DangerButton>
            )}

            <Modal
                show={confirmingGroupDeletion}
                onClose={closeModal}
                maxWidth="md"
            >
                <form onSubmit={deleteGroup} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        グループ削除を実行しますか？
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        グループを削除すると、すべてのリソースとデータが完全に削除されます。
                        <br />
                        削除したグループは復元できませんのでご注意ください。
                    </p>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="パスワード" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder="••••••••"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4 flex justify-center gap-2">
                        <SecondaryButton onClick={closeModal}>
                            キャンセル
                        </SecondaryButton>

                        <DangerButton className="" disabled={processing}>
                            削除する
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
