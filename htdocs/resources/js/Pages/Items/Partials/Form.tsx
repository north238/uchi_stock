import React, { useState } from "react";
import VoiceInput from "@/Components/VoiceInput";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { showErrorToast } from "@/utils/toast";
import InputError from "@/Components/InputError";
import SelectInput from "@/Components/SelectInput";
import { TextArea } from "@/Components/TextArea";
import { useFormOptions } from "@/hooks/useFormOptions";

type FormItemFields = {
  name: string;
  quantity: number;
  genre_id?: string;
  place_id?: string;
  memo?: string;
};

interface ItemFormProps {
  data: FormItemFields;
  setData: ((field: string, value?: any) => void) | ((payload: Partial<FormItemFields>) => void);
  onSubmit: (formData: FormItemFields) => void;
  apiUrl: string;
  errors?: Record<string, string>;
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
  const nameRef = React.useRef<HTMLInputElement | null>(null);
  const nameEmpty = !data.name || data.name.trim() === "";
  const { genres, places, loading, error } = useFormOptions();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    (setData as (field: string, value: any) => void)("name", e.target.value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = Number(e.target.value) || 0;
    (setData as (field: string, value: any) => void)("quantity", q);
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
            <InputLabel htmlFor="genre_id" value="ジャンル（任意）" />
            <SelectInput
              id="genre_id"
              name="genre_id"
              options={genres}
              value={data.genre_id || ""}
              onChange={handleGenreChange}
              error={!!errors?.genre_id}
              className="mt-1 block w-full"
              disabled={voiceProcessing || processing || loading}
            />
            <InputError message={errors?.genre_id} className="mt-2" />
          </div>

          <div>
            <InputLabel htmlFor="place_id" value="保管場所（任意）" />
            <SelectInput
              id="place_id"
              name="place_id"
              options={places}
              value={data.place_id || ""}
              onChange={handlePlaceChange}
              error={!!errors?.place_id}
              className="mt-1 block w-full"
              disabled={voiceProcessing || processing || loading}
            />
            <InputError message={errors?.place_id} className="mt-2" />
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

                (setData as (payload: Partial<FormItemFields>) => void)({
                  name: itemName,
                  quantity: itemQuantity,
                });
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
