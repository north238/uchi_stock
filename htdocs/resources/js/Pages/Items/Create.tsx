import { usePage, router } from "@inertiajs/react";
import Form from "./Partials/Form";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";

export default function Create({ auth }: PageProps) {
    const { apiUrl } = usePage<{ apiUrl: string }>().props;

    const handleSubmit = (data: { name: string; quantity: number }) => {
        router.post("/items", data);
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
            <Form onSubmit={handleSubmit} apiUrl={apiUrl} />
        </Authenticated>
    );
}
