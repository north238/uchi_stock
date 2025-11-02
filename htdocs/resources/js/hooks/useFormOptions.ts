import { useState, useEffect } from "react";
import axios from "axios";
import { getGenres, getPlaces } from "@/api/optionsApi";

axios.defaults.withCredentials = true;

export type Option = {
  value: string;
  label: string;
};

export const useFormOptions = () => {
  const [genres, setGenres] = useState<Option[]>([{ value: "", label: "---" }]);
  const [places, setPlaces] = useState<Option[]>([{ value: "", label: "---" }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGenres = async () => {
    try {
      const data = await getGenres();
      if (!Array.isArray(data)) throw new Error("ジャンルデータの形式が不正です");
      setGenres([{ value: "", label: "---" }, ...data.map((g) => ({ value: String(g.id), label: g.name }))]);
    } catch (err) {
      console.error("loadGenres error:", err);
      setGenres([{ value: "", label: "---" }]);
      throw err;
    }
  };

  const loadPlaces = async () => {
    try {
      const data = await getPlaces();
      if (!Array.isArray(data)) throw new Error("保管場所データの形式が不正です");
      setPlaces([{ value: "", label: "---" }, ...data.map((p) => ({ value: String(p.id), label: p.name }))]);
    } catch (err) {
      console.error("loadPlaces error:", err);
      setPlaces([{ value: "", label: "---" }]);
      throw err;
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        await axios.get("/sanctum/csrf-cookie"); // CSRF保護を有効化
        await Promise.all([loadGenres(), loadPlaces()]);
      } catch (err) {
        console.error("データ取得エラー:", err);
        setError(err instanceof Error ? err.message : "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { genres, places, loading, error, reloadGenres: loadGenres, reloadPlaces: loadPlaces };
};
