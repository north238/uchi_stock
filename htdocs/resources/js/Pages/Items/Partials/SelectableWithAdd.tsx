import { useState } from "react";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";
import SaveButton from "@/Components/Buttons/SaveButton";
import CancelButton from "@/Components/Buttons/CancelButton";
import TextInput from "@/Components/TextInput";

type Props = {
  id: string;
  name: string;
  label: string;
  options: { value: string | number; label: string }[];
  value: string | number | null;
  isModalOpen: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAdd: (newName: string) => Promise<void>;
  error?: string;
  disabled?: boolean;
};

export default function SelectableWithAdd({
  id,
  name,
  label,
  options,
  value,
  isModalOpen,
  onChange,
  onAdd,
  error,
  disabled,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const newName = newValue.trim();
    if (newName && !isSubmitting) {
      try {
        setIsSubmitting(true);
        await onAdd(newName);
        setNewValue("");
        setIsOpen(false);
      } catch (error) {
        console.log(error);
        // エラーは親で処理
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <InputLabel htmlFor={id} value={label} />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          disabled={disabled}
          className="whitespace-nowrap px-2 py-2 text-sm font-bold text-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ＋ 追加
        </button>
      </div>
      <SelectInput
        id={id}
        name={id}
        options={options}
        value={value || ""}
        onChange={onChange}
        error={!!error}
        className="mt-1 block w-full"
        disabled={disabled}
      />
      <InputError message={error} className="mt-2" />

      {/* モーダル要素 */}
      <Modal maxWidth="sm" show={isOpen} onClose={() => setIsOpen(isModalOpen)}>
        <div className="p-4 w-80">
          <h2 className="font-semibold mb-2 dark:text-white">新規追加</h2>
          <TextInput
            type="text"
            id={name}
            name={name}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={`${label}名を入力`}
            className="w-full"
            isFocused={true}
          />
          <div className="mt-4 flex justify-end gap-2">
            <CancelButton onClick={() => setIsOpen(false)} />
            <SaveButton onClick={handleSubmit} label="追加する" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
