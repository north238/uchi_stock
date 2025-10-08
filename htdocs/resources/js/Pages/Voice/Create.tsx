import React from "react";
import { usePage } from "@inertiajs/react";
import VoiceInput from "@/Components/VoiceInput";

const VoicePage: React.FC = () => {
    const { apiUrl } = usePage<{ apiUrl: string }>().props;
    if (!apiUrl) {
        alert("URLが設定されていません");
        return;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">音声入力ページ</h1>
            <VoiceInput apiUrl={apiUrl} />
        </div>
    );
};

export default VoicePage;
