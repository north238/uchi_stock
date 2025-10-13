import { useState } from "react";
import { blobToFormData } from "@/utils/audioUtils";
import { log } from "console";

interface VoiceResult {
    status: string;
    message: string;
    text: string;
    items: Array<{ item: string; quantity: number }>;
}

export const useVoiceRecorder = (
    apiUrl: string,
    onResult: (result: VoiceResult) => void
) => {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        const type = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm";

        const recorder = new MediaRecorder(stream, { mimeType: type });
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e: BlobEvent) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: recorder.mimeType });
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            const formData = blobToFormData(blob);

            setLoading(true);
            try {
                const res = await fetch(apiUrl, {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    onResult({
                        status: err.status || "error",
                        message: err.message || "サーバーエラーが発生しました。",
                        text: "",
                        items: [],
                    });
                    return;
                }
                const data = await res.json();
                console.log(data);

                onResult({
                    status: data.status || "error",
                    message: data.message || "音声解析に成功しました。",
                    text: data.text ?? "",
                    items: data.items ?? [],
                });
            } catch (error: any) {
                console.error(error);
                onResult({
                    status: "error",
                    message: "通信エラー: " + error.message,
                    text: "",
                    items: [],
                });
            } finally {
                setLoading(false);
            }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        setRecording(false);
    };

    return { recording, audioUrl, loading, startRecording, stopRecording };
};
