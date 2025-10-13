import React, { useState } from "react";
import VoiceInput from "@/Components/VoiceInput";

interface ItemFormProps {
    initialValues?: { name: string; quantity: number };
    onSubmit: (data: { name: string; quantity: number }) => void;
    apiUrl: string;
}

export default function Form({
    initialValues,
    onSubmit,
    apiUrl,
}: ItemFormProps) {
    const [name, setName] = useState(initialValues?.name || "");
    const [quantity, setQuantity] = useState(initialValues?.quantity || 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, quantity });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <label className="block">
                <span>品名</span>
                <input
                    type="text"
                    className="border p-2 w-full rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </label>

            <label className="block">
                <span>個数</span>
                <input
                    type="number"
                    className="border p-2 w-full rounded"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />
            </label>

            {/* 音声入力コンポーネント */}
            <VoiceInput
                onResult={({ name, quantity }) => {
                    setName(name);
                    setQuantity(quantity);
                }}
                apiUrl={apiUrl}
            />

            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
                保存
            </button>
        </form>
    );
}
