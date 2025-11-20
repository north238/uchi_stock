import React, { useEffect } from "react";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { PiMicrophoneFill } from "react-icons/pi";
import { PiMicrophoneSlashFill } from "react-icons/pi";

interface VoiceResult {
  status: string;
  message: string;
  text: string;
  items: Array<{ item: string; quantity: number }>;
}

interface VoiceInputProps {
  onResult: (result: VoiceResult) => void;
  apiUrl: string;
  label?: string;
  onProcessingChange?: (processing: boolean) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  apiUrl,
  label = "",
  onProcessingChange,
}) => {
  const { recording, loading, processing, progress, startRecording, stopRecording } =
    useVoiceRecorder(apiUrl, onResult);

  // 親コンポーネントに処理状態を通知
  useEffect(() => {
    if (onProcessingChange) onProcessingChange(processing);
  }, [processing, onProcessingChange]);

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {label && <span className="text-gray-700 font-medium">{label}</span>}

      {/* 🔹 状態メッセージ（ボタン上部） */}
      {recording && !loading && (
        <p className="text-sm text-red-500 font-medium animate-pulse">
          🎙️ 録音中...（残り {Math.round(15 - (progress / 100) * 15)} 秒）
        </p>
      )}
      {loading && (
        <p className="text-sm text-blue-400 font-medium animate-pulse">🔍 音声解析中...</p>
      )}
      {!recording && !loading && <p className="text-sm text-gray-400">タップして音声入力を開始</p>}

      {/* 🔘 マイクボタン本体 */}
      <button
        onClick={recording ? stopRecording : startRecording}
        type="button"
        disabled={loading}
        className={`
                    relative w-12 h-12 flex items-center justify-center rounded-full hover:scale-105
                    ${recording ? "bg-red-600 dark:bg-red-200" : "bg-blue-600 dark:bg-blue-200"}
                    transition-all duration-300
                    `}
      >
        {recording && (
          <div
            className="absolute inset-0 border-4 border-red-700 rounded-full animate-pulse"
            style={{
              boxShadow: `0 0 10px rgba(255, 0, 0, 0.5)`,
            }}
          ></div>
        )}

        <span
          className={`text-white text-3xl ${
            recording ? "dark:text-red-500" : "dark:text-blue-500"
          }`}
        >
          {!processing ? <PiMicrophoneFill /> : <PiMicrophoneSlashFill />}
        </span>
      </button>

      {/* 録音データの表示 useVoiceRecorderへ記述（デバック用） */}
      {/* {audioUrl && (
        <div className="flex flex-col items-center mt-2">
          <audio controls src={audioUrl} className="max-w-md" />
        </div>
      )} */}
    </div>
  );
};

export default VoiceInput;
