import React from "react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

interface VoiceInputProps {
    onResult: (text: string) => void;
    apiUrl: string;
    label?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
    onResult,
    apiUrl,
    label = "",
}) => {
    const { recording, audioUrl, loading, startRecording, stopRecording } =
        useVoiceRecorder(apiUrl, onResult);

    return (
        <div className="w-full flex flex-col items-center space-y-4">
            {label && (
                <span className="text-gray-700 font-medium">{label}</span>
            )}

            <button
                onClick={recording ? stopRecording : startRecording}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md transition-all duration-300 ${
                    recording
                        ? "bg-red-500 hover:bg-red-400 animate-pulse"
                        : "bg-blue-500 hover:bg-blue-400"
                } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
                {recording ? (
                    <>
                        <span className="text-xl">⏹️</span>
                        <span>録音停止</span>
                    </>
                ) : (
                    <>
                        <span className="text-xl">🎙️</span>
                        <span>{loading ? "処理中…" : "録音開始"}</span>
                    </>
                )}
            </button>

            {audioUrl && (
                <div className="flex flex-col items-center space-y-2">
                    <audio controls src={audioUrl} className="max-w-md" />
                </div>
            )}
        </div>
    );
};

export default VoiceInput;
