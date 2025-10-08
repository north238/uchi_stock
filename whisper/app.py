from fastapi import FastAPI, UploadFile, HTTPException
import whisper
import tempfile
import subprocess
import os

app = FastAPI()

# モデルを起動時にロード（リクエストごとにロードしない）
model = whisper.load_model("small")


@app.post("/transcribe")
async def transcribe(file: UploadFile):
    try:
        # 一時ファイルにアップロードデータを書き込む
        suffix = os.path.splitext(file.filename)[1] or ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Whisperは16kHz/モノラルが最適 ⇒ ffmpegで変換
        converted_path = tmp_path.rsplit(".", 1)[0] + "_16k.wav"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                tmp_path,
                "-ar",
                "16000",
                "-ac",
                "1",
                "-af",
                "loudnorm",  # 音量正規化（重要）
                converted_path,
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # 変換後ファイルをWhisperで文字起こし
        result = model.transcribe(
            converted_path,
            language="ja",
            temperature=0.0,  # 乱数抑制
            best_of=5,  # 候補数増やす
            beam_size=10,  # ビーム探索幅を拡大（精度↑, 速度↓）
            patience=0.2,  # ビームサーチの探索継続率
            fp16=False,  # CPUで精度を安定化
            condition_on_previous_text=True,
        )

        text = result["text"]
        corrections = {"無天下": "無添加", "生石犬": "生石鹸"}
        for wrong, correct in corrections.items():
            text = text.replace(wrong, correct)

        return {"text": text}

    except subprocess.CalledProcessError:
        raise HTTPException(status_code=500, detail="音声変換に失敗しました。")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # 一時ファイル削除（ディスク肥大化防止）
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        if os.path.exists(converted_path):
            os.remove(converted_path)
