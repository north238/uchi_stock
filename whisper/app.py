from fastapi import FastAPI, UploadFile
import whisper
import tempfile

app = FastAPI()
model = whisper.load_model("tiny")  # 軽量モデルでPC/ラズパイに対応

@app.post("/transcribe")
async def transcribe(file: UploadFile):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    result = model.transcribe(tmp_path, language="ja")
    return {"text": result["text"]}
