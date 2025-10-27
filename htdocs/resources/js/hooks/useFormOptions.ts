import { useState, useEffect } from "react";
import axios from "axios";

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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        await axios.get("/sanctum/csrf-cookie"); // CSRF保護を有効化
        const [genresResponse, placesResponse] = await Promise.all([
          axios.get<{ id: number; name: string }[]>("/api/genres"),
          axios.get<{ id: number; name: string }[]>("/api/places"),
        ]);

        // ジャンルのデータチェックと設定
        const genresData = genresResponse.data ?? [];
        if (!Array.isArray(genresData)) {
          throw new Error("ジャンルデータの登録がありません");
        }

        setGenres([
          { value: "", label: "---" },
          ...genresResponse.data.map((genre) => ({
            value: String(genre.id),
            label: genre.name,
          })),
        ]);

        // 保管場所のデータチェックと設定
        const placesData = placesResponse.data ?? [];
        if (!Array.isArray(placesData)) {
          throw new Error("保管場所データの登録がありません");
        }

        setPlaces([
          { value: "", label: "---" },
          ...placesResponse.data.map((place) => ({
            value: String(place.id),
            label: place.name,
          })),
        ]);
      } catch (err) {
        console.error("データ取得エラー:", err);
        setError(err instanceof Error ? err.message : "データの取得に失敗しました");
        // エラー時はデフォルト値のみを設定
        setGenres([{ value: "", label: "---" }]);
        setPlaces([{ value: "", label: "---" }]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { genres, places, loading, error };
};
