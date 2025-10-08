import React, { useState, useEffect } from "react";

const VoiceInput: React.FC = () => {
    const [recording, setRecording] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    );
    const [transcript, setTranscript] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null); // 音声URL保存用
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

    const apiUrl = `${import.meta.env.VITE_API_URL}/api/voice/transcribe`;

    // マイク一覧取得
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            const inputs = devices.filter((d) => d.kind === "audioinput");
            setAudioDevices(inputs);
            if (inputs.length > 0) setSelectedDeviceId(inputs[0].deviceId); // 初期選択
        });
    }, []);

    const startRecording = async () => {
        if (!apiUrl) {
            alert("URLが設定されていません");
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: selectedDeviceId
                    ? { exact: selectedDeviceId }
                    : undefined,
            },
        });

        const type = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm";

        const options = { mimeType: type };
        const recorder = new MediaRecorder(stream, options);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e: BlobEvent) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
                console.log("✅ ondataavailable:", e.data.size, "bytes");
            } else {
                console.warn("⚠️ データが空です");
            }
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunks, { type: recorder.mimeType });
            console.log("🎧 Blobサイズ:", blob.size, "bytes");

            const url = URL.createObjectURL(blob);
            setAudioUrl(url);

            const formData = new FormData();
            formData.append("audio", blob, "input.webm");

            setLoading(true);

            try {
                const res = await fetch(apiUrl, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error("サーバーエラー:", text);
                    setTranscript("サーバーエラー");
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
        <div className="p-4 space-y-4">
            <div>
                <label>使用するマイク: </label>
                <select
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                >
                    {audioDevices.map((d) => (
                        <option key={d.deviceId} value={d.deviceId}>
                            {d.label || "無名デバイス"}
                        </option>
                    ))}
                </select>
            </div>
            <button
                id="recordBtn"
                onClick={recording ? stopRecording : startRecording}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                data-url={apiUrl}
            >
                {recording ? "録音停止" : "録音開始"}
            </button>
            <p className="mt-4 text-gray-700">
                {loading
                    ? "文字起こし中…"
                    : `結果: ${transcript ?? "入力なし"}`}
            </p>

            {audioUrl && (
                <div className="space-y-2">
                    <audio controls src={audioUrl}></audio>
                    <a
                        href={audioUrl}
                        download="recorded_audio.webm"
                        className="text-blue-600 underline"
                    >
                        音声を保存する
                    </a>
                </div>
            )}
        </div>
    );
};

export default VoiceInput;
