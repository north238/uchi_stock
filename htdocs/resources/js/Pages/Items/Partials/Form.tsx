import React, { useState } from "react";
import VoiceInput from "@/Components/VoiceInput";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import InputError from "@/Components/InputError";
import { TextArea } from "@/Components/TextArea";
import { useFormOptions } from "@/hooks/useFormOptions";
import SelectableWithAdd from "./SelectableWithAdd";

type FormItemFields = {
  name: string;
  quantity: number;
  genre_id: string | null;
  place_id: string | null;
  memo: string | null;
};

interface ItemFormProps {
  data: FormItemFields;
  setData: (field: keyof FormItemFields, value: FormItemFields[keyof FormItemFields]) => void;
  onSubmit: (formData: FormItemFields) => Promise<void>;
  apiUrl: string;
  errors?: Partial<Record<keyof FormItemFields, string>>;
  processing: boolean;
}

export default function Form({
  data,
  setData,
  onSubmit,
  apiUrl,
  errors,
  processing,
}: ItemFormProps) {
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const nameRef = React.useRef<HTMLInputElement | null>(null);
  const nameEmpty = !data.name || data.name.trim() === "";
  const { genres, places, loading, error } = useFormOptions();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData("name", e.target.value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = Number(e.target.value) || 0;
    setData("quantity", q);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setData("genre_id", e.target.value);
  };

  const handlePlaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setData("place_id", e.target.value);
  };

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData("memo", e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // クライアント側バリデーション
    if (nameEmpty) {
      showErrorToast("品名を入力してください。");
      nameRef.current?.focus();
      return;
    }
    onSubmit(data);
  };

  const handleAddGenre = async (genreName: string) => {
    try {
      // APIを呼び出してジャンルを追加
      const response = await axios.post("/api/genres", { name: genreName });
      // 成功したら再度ジャンルリストを更新
      setIsGenreModalOpen(false);
      // 必要に応じてトースト表示
      showSuccessToast("ジャンルを追加しました");
    } catch (error) {
      console.log(error);

      showErrorToast("ジャンルの追加に失敗しました");
    }
  };

  const handleAddPlace = async (placeName: string) => {
    try {
      // APIを呼び出して保管場所を追加
      const response = await axios.post("/api/places", { name: placeName });
      // 成功したら再度保管場所リストを更新
      setIsPlaceModalOpen(false);
      // 必要に応じてトースト表示
      showSuccessToast("保管場所を追加しました");
    } catch (error) {
      console.log(error);
      showErrorToast("保管場所の追加に失敗しました");
    }
  };

  return (
    <div className="py-12">
      <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 max-w-xl mx-auto sm:py-6 lg:py-8 sm:px-6 lg:px-8 shadow-md sm:rounded-lg">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <InputLabel htmlFor="name" value="品名" />
            <TextInput
              type="text"
              id="name"
              name="name"
              placeholder="例：りんご"
              className="mt-1 block w-full"
              isFocused={true}
              value={data.name ?? ""}
              error={!!errors?.name}
              ref={nameRef}
              onChange={handleNameChange}
              disabled={voiceProcessing || processing}
            />
            <InputError message={errors?.name} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="quantity" value="個数" />
            <TextInput
              type="number"
              id="quantity"
              name="quantity"
              className="mt-1 block w-full"
              isFocused={false}
              value={String(data?.quantity ?? 1)}
              error={!!errors?.quantity}
              onChange={handleQuantityChange}
              disabled={voiceProcessing || processing}
            />
            <InputError message={errors?.quantity} className="mt-2" />
          </div>

          <div>
            <SelectableWithAdd
              id="genre_id"
              name="genre_name"
              label="ジャンル（任意）"
              options={genres}
              value={data.genre_id || ""}
              isModalOpen={isGenreModalOpen}
              onChange={handleGenreChange}
              onAdd={handleAddGenre}
              error={errors?.genre_id}
              disabled={voiceProcessing || processing || loading}
            />
          </div>

          <div>
            <SelectableWithAdd
              id="place_id"
              name="place_name"
              label="保管場所（任意）"
              options={places}
              value={data.place_id || ""}
              isModalOpen={isPlaceModalOpen}
              onChange={handlePlaceChange}
              onAdd={handleAddPlace}
              error={errors?.place_id}
              disabled={voiceProcessing || processing || loading}
            />
          </div>

          <div>
            <InputLabel htmlFor="memo" value="メモ（任意）" />
            <TextArea
              id="memo"
              name="memo"
              value={data.memo || ""}
              placeholder="フリー入力"
              onChange={handleMemoChange}
              error={!!errors?.memo}
              className="mt-1 block w-full"
              disabled={voiceProcessing || processing}
            />
            <InputError message={errors?.memo} className="mt-2" />
          </div>

          {/* 音声入力コンポーネント */}
          <VoiceInput
            onResult={(result) => {
              if (result.status === "success") {
                const itemName = result.items[0]?.item || "";
                const itemQuantity = result.items[0]?.quantity || 1;
                setData("name", itemName);
                setData("quantity", itemQuantity);
              } else {
                showErrorToast(result.message || "音声認識に失敗しました。");
              }
            }}
            apiUrl={apiUrl}
            onProcessingChange={(p) => setVoiceProcessing(p)}
          />

          <PrimaryButton type="submit" disabled={processing || voiceProcessing || nameEmpty}>
            保存
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
