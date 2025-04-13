import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SelectInput from "@/Components/SelectInput";
import { TextArea } from "@/Components/TextArea";
import TextInput from "@/Components/TextInput";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, useForm } from "@inertiajs/react";

export default function Setup({ auth }: PageProps) {
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm({
            groupName: "",
            description: "",
            status: 0,
        });

    // 保存処理
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("group.setup"), {
            onSuccess: () => {
                reset("groupName", "description", "status");
            },
        });
    };

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    グループ設定
                </h2>
            }
        >
            <Head title="グループ設定" />
            <div className="py-12">
                <div className="bg-white max-w-3xl mx-auto sm:py-6 lg:py:8 sm:px-6 lg:px-8 border border-gray-200 shadow-md sm:rounded-lg">
                    <form className="space-y-4" onSubmit={submit}>
                        <div>
                            <InputLabel
                                htmlFor="groupName"
                                value="グループ名"
                            />
                            <TextInput
                                id="groupName"
                                type="text"
                                name="groupName"
                                placeholder="〇〇家族"
                                value={data.groupName}
                                error={!!errors.groupName}
                                className="mt-1 block w-full"
                                isFocused={true}
                                onChange={(e) => {
                                    setData("groupName", e.target.value);
                                    clearErrors("groupName");
                                }}
                            />
                            <InputError
                                message={errors.groupName}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="email" value="説明" />
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
