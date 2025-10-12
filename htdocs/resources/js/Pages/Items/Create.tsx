import { usePage, router } from "@inertiajs/react";
import Form from "./Partials/Form";

export default function Create() {
    const { apiUrl } = usePage<{ apiUrl: string }>().props;

    const handleSubmit = (data: { name: string; quantity: number }) => {
        router.post("/items", data);
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow">
            <h2 className="text-lg font-bold mb-4 text-gray-700">
                アイテム登録
            </h2>
            <Form onSubmit={handleSubmit} apiUrl={apiUrl} />
        </div>
    );
}
