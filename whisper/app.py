from fastapi import FastAPI, UploadFile
import whisper
import tempfile

app = FastAPI()
model = whisper.load_model("small")  # 軽量モデルでPC/ラズパイに対応

@app.post("/transcribe")
async def transcribe(file: UploadFile):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    result = model.transcribe(
    tmp_path,
    language="ja",
    temperature=0.0,        # 認識のランダム性を抑える
    best_of=5,              # 複数候補から最適解を選択
    beam_size=5             # ビームサーチで精度向上
)
    return {"text": result["text"]}
