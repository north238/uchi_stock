import { useState, useRef } from "react";
import { blobToFormData } from "@/utils/audioUtils";

interface VoiceResult {
  status: string;
  message: string;
  text: string;
  items: Array<{ item: string; quantity: number }>;
}

export const useVoiceRecorder = (apiUrl: string, onResult: (result: VoiceResult) => void) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_DURATION = 15; // 録音の最大時間（秒）

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    const type = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType: type });
    const chunks: BlobPart[] = [];
    let elapsed = 0;

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    // 録音停止時の処理
    recorder.onstop = async () => {
      // タイマー停止
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(0);

      const blob = new Blob(chunks, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      const formData = blobToFormData(blob);

      setAudioUrl(url);
      setLoading(true);
      setProcessing(true);

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
        setProcessing(false);
        setLoading(false);
      }
    };

    // 録音中タイマー（15秒で自動停止）
    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      setProgress((elapsed / MAX_DURATION) * 100);
      if (elapsed >= MAX_DURATION) {
        stopRecording();
      }
    }, 100);

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  return {
    recording,
    audioUrl,
    loading,
    processing,
    progress,
    startRecording,
    stopRecording,
  };
};
