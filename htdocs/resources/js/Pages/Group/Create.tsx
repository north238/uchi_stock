import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SelectInput from "@/Components/SelectInput";
import { TextArea } from "@/Components/TextArea";
import TextInput from "@/Components/TextInput";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, useForm } from "@inertiajs/react";

export default function Create({ auth }: PageProps) {
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm({
            name: "",
            description: "",
            status: 0,
        });

    // 保存処理
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("groups.create"), {
            onSuccess: () => {
                reset("name", "description", "status");
            },
        });
    };

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    グループ作成
                </h2>
            }
        >
            <Head title="グループ作成" />
            <div className="py-12">
                <div className="bg-white max-w-xl mx-auto sm:py-6 lg:py:8 sm:px-6 lg:px-8 border border-gray-200 shadow-md sm:rounded-lg">
                    <header>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            グループ作成
                        </h2>

                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            グループ名、説明、公開設定を設定できます。
                            <br />
                        </p>
                    </header>
                    <form className="mt-6 space-y-2" onSubmit={submit}>
                        <div>
                            <InputLabel htmlFor="name" value="グループ名" />
                            <TextInput
                                id="name"
                                type="text"
                                name="name"
                                placeholder="〇〇グループ"
                                value={data.name}
                                error={!!errors.name}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => {
                                    setData("name", e.target.value);
                                    clearErrors("name");
                                }}
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="description" value="説明" />
                            <TextArea
                                id="description"
                                name="description"
                                placeholder="家族限定グループ"
                                value={data.description}
                                error={!!errors.description}
                                className="mt-1 block w-full"
                                isFocused={false}
                                onChange={(e) => {
                                    setData("description", e.target.value);
                                    clearErrors("description");
                                }}
                            />
                            <InputError
                                message={errors.description}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="status" value="公開設定" />
                            <SelectInput
                                id="status"
                                name="status"
                                className="mt-1 block w-full"
                                error={false}
                                options={[
                                    { value: "0", label: "非公開" },
                                    { value: "1", label: "公開" },
                                ]}
                            />
                            <InputError
                                message={errors.status}
                                className="mt-2"
                            />
                        </div>
                        <div className="mt-8">
                            <PrimaryButton disabled={processing}>
                                保存
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </Authenticated>
    );
}
