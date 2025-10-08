import React, { useState } from "react";

const VoiceInput: React.FC = () => {
    const [recording, setRecording] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    );
    const [transcript, setTranscript] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/voice/transcribe`;

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        const options = { mimeType: "audio/webm" };
        const recorder = new MediaRecorder(stream, options);
        const chunks: BlobPart[] = [];

        if (!apiUrl) {
            alert("URLが設定されていません");
            return;
        }

        recorder.ondataavailable = (e: BlobEvent) => chunks.push(e.data);
        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: "audio/wav" });
            const formData = new FormData();
            formData.append("audio", blob, "input.wav");

            setLoading(true);

            try {
                const res = await fetch(apiUrl, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("サーバーエラー:", text);
                    return;
                }
                const data = await res.json();

                setTranscript(data.text);
            } catch (error) {
                console.error(error);
                setTranscript("通信エラー");
            } finally {
                setLoading(false); // 処理終了
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

    return (
        <div className="p-4">
            <button
                id="recordBtn"
                onClick={recording ? stopRecording : startRecording}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                data-url={apiUrl}
            >
                {recording ? "録音停止" : "録音開始"}
            </button>
            <p className="mt-4 text-gray-700">
                {loading ? "文字起こし中…" : `結果: ${transcript ?? "入力なし"}`}
            </p>
        </div>
    );
};

export default VoiceInput;
