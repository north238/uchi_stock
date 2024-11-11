const checkCookies = () => {
  // クッキーを取得してオブジェクトに変換
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies; // 取得したクッキー情報を返す
};

export default checkCookies;
