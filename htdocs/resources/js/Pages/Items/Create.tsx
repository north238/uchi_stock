import Form from "./Partials/Form";
import { usePage, useForm, Head } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";

export default function Create({ auth }: PageProps) {
    const { apiUrl } = usePage<{ apiUrl: string }>().props;
    const { data, setData, post, processing, errors, reset } =
        useForm({
            name: "",
            quantity: 1,
        });

    const handleSubmit = () => {
        post(route("items.store"), {
            preserveScroll: true,
            onSuccess: () => {
                reset("name", "quantity");
            },
        });
    };

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    アイテム登録
                </h2>
            }
        >
            <Head title="アイテム登録" />
            <Form
                data={data}
                setData={setData}
                onSubmit={handleSubmit}
                apiUrl={apiUrl}
                errors={errors}
                processing={processing}
            />
        </Authenticated>
    );
}
