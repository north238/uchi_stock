<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>音声アップロード</title>
</head>
<body>
    <h1>音声ファイルをアップロード</h1>

    @if(isset($result))
        <h2>解析結果：</h2>
        <p>{{ $result }}</p>
    @endif

    <form action="/upload-audio" method="POST" enctype="multipart/form-data">
        @csrf
        <input type="file" name="audio" accept="audio/*" required>
        <button type="submit">送信</button>
    </form>
</body>
</html>
