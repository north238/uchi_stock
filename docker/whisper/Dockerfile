FROM python:3.10-slim

WORKDIR /usr/src/app

# 必要パッケージ
RUN apt-get update && apt-get install -y ffmpeg git && rm -rf /var/lib/apt/lists/*

# Python依存
RUN pip install --no-cache-dir fastapi uvicorn openai-whisper python-multipart

# ソースコードをコピー
COPY ./whisper/* ./

# FastAPI起動
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000", "--reload"]
