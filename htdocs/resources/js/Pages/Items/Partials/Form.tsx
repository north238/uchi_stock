import React, { useState } from "react";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import StatusSegment from "@/Components/StatusSegment";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import InputError from "@/Components/InputError";
import { TextArea } from "@/Components/TextArea";
import { useFormOptions } from "@/hooks/useFormOptions";
import SelectableWithAdd from "./SelectableWithAdd";
import { addGenre, addPlace } from "@/api/optionsApi";
import { ItemStatusValue } from "@/constants/itemStatus";

type FormItemFields = {
  name: string;
  status: ItemStatusValue;
  quantity: number | null;
  genre_id: number | null;
  place_id: number | null;
  memo: string | null;
};

// 明示的なフィールド名ユニオンで型安全にする
type FieldName = "name" | "status" | "quantity" | "genre_id" | "place_id" | "memo";

/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
interface ItemFormProps {
  data: FormItemFields;
  setData: (field: FieldName, value?: string | number | null) => void;
  onSubmit: () => void | Promise<void>;
  errors?: Partial<Record<keyof FormItemFields, string>>;
  processing: boolean;
}
/* eslint-enable @typescript-eslint/no-unused-vars, no-unused-vars */

export default function Form({
  data,
  setData,
  onSubmit,
  errors,
  processing,
}: ItemFormProps) {
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const nameRef = React.useRef<HTMLInputElement | null>(null);
  const nameEmpty = !data.name || data.name.trim() === "";
  const { genres, places, loading, error, reloadGenres, reloadPlaces } = useFormOptions();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData("name", e.target.value);
  };

  const handleStatusChange = (next: ItemStatusValue) => {
    setData("status", next);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setData("quantity", raw === "" ? null : Number(raw));
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
    if (nameEmpty) {
      showErrorToast("品名を入力してください。");
      nameRef.current?.focus();
      return;
    }
    onSubmit();
  };

  const handleAddGenre = async (genreName: string) => {
    try {
      const res = await addGenre(genreName);
      await reloadGenres(); // 先にオプションを更新する
      if (res?.data?.id) {
        setData("genre_id", String(res.data.id));
      }
      setIsGenreModalOpen(false);
      showSuccessToast("ジャンルを追加しました");
    } catch (error) {
      console.error(error);
      showErrorToast("ジャンルの追加に失敗しました");
    }
  };

  const handleAddPlace = async (placeName: string) => {
    try {
      const res = await addPlace(placeName);
      await reloadPlaces(); // 先にオプションを更新する
      if (res?.data?.id) {
        setData("place_id", String(res.data.id));
      }
      setIsPlaceModalOpen(false);
      showSuccessToast("保管場所を追加しました");
    } catch (error) {
      console.error(error);
      showErrorToast("保管場所の追加に失敗しました");
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-surface shadow-card rounded-[20px]">
      {error && <div className="text-danger mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-2">
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
            disabled={processing}
          />
          <InputError message={errors?.name} className="mt-2" />
        </div>

        <div>
          <InputLabel htmlFor="status" value="ステータス" />
          <div className="mt-1">
            <StatusSegment
              value={data.status ?? "in_stock"}
              onChange={handleStatusChange}
              disabled={processing}
            />
          </div>
        </div>

        <div>
          <InputLabel htmlFor="quantity" value="個数（任意）" />
          <TextInput
            type="number"
            id="quantity"
            name="quantity"
            className="mt-1 block w-full"
            isFocused={false}
            value={
              data.quantity === null || data.quantity === undefined ? "" : String(data.quantity)
            }
            error={!!errors?.quantity}
            onChange={handleQuantityChange}
            disabled={processing}
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
            disabled={processing || loading}
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
            disabled={processing || loading}
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
            disabled={processing}
          />
          <InputError message={errors?.memo} className="mt-2" />
        </div>

        <PrimaryButton type="submit" disabled={processing || nameEmpty}>
          保存
        </PrimaryButton>
      </form>
    </div>
  );
}
