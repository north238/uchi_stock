import { usePage, router } from "@inertiajs/react";
import Form from "./Partials/Form";

export default function Create() {
    const { apiUrl } = usePage<{ apiUrl: string }>().props;
    if (!apiUrl) {
        alert("URLが設定されていません");
        return;
    }

    const handleSubmit = (data: { name: string; quantity: number }) => {
        router.post("/items", data);
    };

    return <Form onSubmit={handleSubmit} apiUrl={apiUrl} />;
}
