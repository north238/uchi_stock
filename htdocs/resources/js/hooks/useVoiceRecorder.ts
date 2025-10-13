import { useState } from "react";
import { blobToFormData } from "@/utils/audioUtils";

interface VoiceResult {
    name: string;
    quantity: number;
}

export const useVoiceRecorder = (
    apiUrl: string,
    onResult: (result: VoiceResult) => void
) => {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    );
    const [loading, setLoading] = useState(false);
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
                    const text = await res.text();
                    console.error("サーバーエラー:", text);
                    onResult("サーバーエラー");
                    return;
                }
                const data = await res.json();
                onResult(data.text);
            } catch (error) {
                console.error(error);
                onResult("通信エラー");
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
