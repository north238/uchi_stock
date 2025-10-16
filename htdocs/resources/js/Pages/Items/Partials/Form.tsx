import React, { useState } from "react";
import VoiceInput from "@/Components/VoiceInput";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";

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
        <div className="py-12">
            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 max-w-xl mx-auto sm:py-6 lg:py-8 sm:px-6 lg:px-8 shadow-md sm:rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-2">
                    <div>
                        <InputLabel htmlFor="name" value="品名" />
                        <TextInput
                            type="text"
                            name="name"
                            placeholder="りんご"
                            className="mt-1 block w-full"
                            isFocused={true}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <InputLabel htmlFor="quantity" value="個数" />
                        <TextInput
                            type="number"
                            name="quantity"
                            className="mt-1 block w-full"
                            isFocused={true}
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(Number(e.target.value))
                            }
                        />
                    </div>

                    {/* 音声入力コンポーネント */}
                    <VoiceInput
                        onResult={(result) => {
                            if (result.status === "success") {
                                setName(result.items[0]?.item || "");
                                setQuantity(result.items[0]?.quantity || 1);
                            } else {
                                alert(
                                    result.message || "音声認識に失敗しました。"
                                );
                            }
                        }}
                        apiUrl={apiUrl}
                    />

                    <PrimaryButton>保存</PrimaryButton>
                </form>
            </div>
        </div>
    );
}
