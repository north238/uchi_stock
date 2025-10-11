import { router, usePage } from "@inertiajs/react";
import Form from "./Partials/Form";

interface Item {
    id: number;
    name: string;
    quantity: number;
}

export default function Edit() {
    const { apiUrl, item } = usePage<{ apiUrl?: string; item: Item }>().props;
    if (!apiUrl) {
        return (
            <div className="text-red-600 text-center mt-8">
                ⚠️ API URL が設定されていません。
            </div>
        );
    }

    const handleSubmit = (data: { name: string; quantity: number }) => {
        router.put(`/items/${item.id}`, data);
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow">
            <h2 className="text-lg font-bold mb-4 text-gray-700">
                アイテム編集
            </h2>
            <Form
                initialValues={item}
                onSubmit={handleSubmit}
                apiUrl={apiUrl}
            />
        </div>
    );
}
