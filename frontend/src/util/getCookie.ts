// CSRFトークンを取得するヘルパー関数
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  const cookieValue =
    parts.length === 2 ? parts.pop()?.split(';').shift() : null;

  return cookieValue || null;
}
