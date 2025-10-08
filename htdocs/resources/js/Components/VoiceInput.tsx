import React, { useState, useEffect } from "react";

const VoiceInput: React.FC<{ apiUrl: string }> = ({ apiUrl }) => {
    const [recording, setRecording] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    );
    const [transcript, setTranscript] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null); // 音声URL保存用
    const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

    // マイク一覧取得
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
            const inputs = devices.filter((d) => d.kind === "audioinput");
            setAudioDevices(inputs);
            if (inputs.length > 0) setSelectedDeviceId(inputs[0].deviceId); // 初期選択
        });
    }, []);

    const startRecording = async () => {
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6 bg-gray-50">
            {/* マイク選択 */}
            <div className="w-full max-w-sm">
                <label className="block mb-2 font-medium text-gray-700">
                    使用するマイク:
                </label>
                <select
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

            {/* 録音ボタン */}
            <button
                onClick={recording ? stopRecording : startRecording}
                className={`
      w-24 h-24 rounded-full flex items-center justify-center
      transition-colors duration-300
      ${recording ? "bg-red-500" : "bg-green-500"}
      shadow-lg
    `}
            >
                {/* マイクアイコン */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 1v11m0 0a3 3 0 003-3V4a3 3 0 00-6 0v5a3 3 0 003 3zm0 0v4m0 0H9m3 0h3"
                    />
                </svg>
            </button>

            {/* 文字起こし結果 */}
            <p className="text-center text-gray-700 text-lg">
                {loading
                    ? "文字起こし中…"
                    : `結果: ${transcript ?? "入力なし"}`}
            </p>

            {/* 録音再生・保存 */}
            {audioUrl && (
                <div className="flex flex-col items-center space-y-2">
                    <audio
                        controls
                        src={audioUrl}
                        className="max-w-md"
                    ></audio>
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

        // <div className="p-4 space-y-4">
        //     <div>
        //         <label>使用するマイク: </label>
        //         <select
        //             value={selectedDeviceId}
        //             onChange={(e) => setSelectedDeviceId(e.target.value)}
        //         >
        //             {audioDevices.map((d) => (
        //                 <option key={d.deviceId} value={d.deviceId}>
        //                     {d.label || "無名デバイス"}
        //                 </option>
        //             ))}
        //         </select>
        //     </div>
        //     <button
        //         id="recordBtn"
        //         onClick={recording ? stopRecording : startRecording}
        //         className="bg-blue-500 text-white px-4 py-2 rounded"
        //         data-url={apiUrl}
        //     >
        //         {recording ? "録音停止" : "録音開始"}
        //     </button>
        //     <p className="mt-4 text-gray-700">
        //         {loading
        //             ? "文字起こし中…"
        //             : `結果: ${transcript ?? "入力なし"}`}
        //     </p>

        //     {audioUrl && (
        //         <div className="space-y-2">
        //             <audio controls src={audioUrl}></audio>
        //             <a
        //                 href={audioUrl}
        //                 download="recorded_audio.webm"
        //                 className="text-blue-600 underline"
        //             >
        //                 音声を保存する
        //             </a>
        //         </div>
        //     )}
        // </div>
    );
};

export default VoiceInput;
