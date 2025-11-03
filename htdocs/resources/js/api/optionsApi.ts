import axios from "axios";

export type BackendOption = { id: number; name: string };

export const getGenres = async () => {
  const res = await axios.get<BackendOption[]>("/api/genres");
  return res.data ?? [];
};

export const getPlaces = async () => {
  const res = await axios.get<BackendOption[]>("/api/places");
  return res.data ?? [];
};

export const addGenre = async (name: string) => {
  // CSRF cookie を事前に取得（セッション認証の場合）
  await axios.get("/sanctum/csrf-cookie");
  const res = await axios.post("/api/genres", { name });
  return res.data;
};

export const addPlace = async (name: string) => {
  // CSRF cookie を事前に取得（セッション認証の場合）
  await axios.get("/sanctum/csrf-cookie");
  const res = await axios.post("/api/places", { name });
  return res.data;
};
