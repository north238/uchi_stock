import { useEffect } from "react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import SelectInput from "@/Components/SelectInput";
import TextInput from "@/Components/TextInput";
import { TextArea } from "@/Components/TextArea";
import { useForm } from "@inertiajs/react";
import { Group } from "@/types";

export default function UpdateGroupForm({
    group,
    className = "",
}: {
    group: Group;
    className?: string;
}) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: group.name || "",
        description: group.description || "",
        status: group.status || 0,
    });

    // group の変更を監視し、フォームに反映
    useEffect(() => {
        if (group) {
            setData({
                name: group.name || "",
                description: group.description || "",
                status: group.status || 0,
            });
        }
    }, [group]);

    // 保存処理
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("group.update", group.id));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    グループ編集
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    グループ名、説明、公開設定を編集できます。
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
                    <InputError message={errors.name} className="mt-2" />
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
                    <InputError message={errors.description} className="mt-2" />
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
                    <InputError message={errors.status} className="mt-2" />
                </div>
                <div className="mt-8">
                    <PrimaryButton disabled={processing}>更新</PrimaryButton>
                </div>
            </form>
        </section>
    );
}
