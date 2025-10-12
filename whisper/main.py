import logging
import sys
from fastapi import FastAPI, UploadFile, HTTPException
import os
from services.audio_processor import transcribe_audio
from services.text_parser import parse_text

# 🔹 ロガー設定
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)

app = FastAPI()

@app.post("/transcribe")
async def transcribe(file: UploadFile):
    try:
        # Whisperで文字起こし
        text = await transcribe_audio(file)
        logging.info(f"📝 文字起こし結果: {text}")

        # テキストを解析して構造化（例：「卵1個」→ {"item":"卵","quantity":"1","unit":"個"}）
        parsed_items = parse_text(text)
        logging.info(f"🔍 解析結果: {parsed_items}")

        return {"text": text, "items": parsed_items}

    except HTTPException as e:
        raise e
    except Exception as e:
        logging.exception("❌ 音声解析中にエラー発生")
        raise HTTPException(status_code=500, detail=str(e))
