from fastapi import FastAPI, UploadFile, HTTPException
import os
from services.audio_processor import transcribe_audio
from services.text_parser import parse_text
from services.text_filter import is_valid_text
from utils.logger import logger

app = FastAPI()

@app.post("/transcribe")
async def transcribe(file: UploadFile):
    try:
        # Whisperで文字起こし
        text = await transcribe_audio(file)
        logger.info(f"📝 文字起こし結果: {text}")

        # NGワードフィルタリング
        if not is_valid_text(text):
            logger.warning(f"⚠️ 無効な内容検出: {text}")
            raise HTTPException(status_code=400, detail="品名として認識できませんでした。再度お試しください。")

        # テキストを解析して構造化（例：「卵1個」→ {"item":"卵","quantity":"1","unit":"個"}）
        parsed_items = parse_text(text)
        logger.info(f"🔍 解析結果: {parsed_items}")

        return {"text": text, "items": parsed_items}

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.exception("❌ 音声解析中にエラー発生")
        raise HTTPException(status_code=500, detail=str(e))
