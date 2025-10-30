import { useState } from "react";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import InputError from "@/Components/InputError";
import Modal from "@/Components/Modal";
import AddButton from "@/Components/Buttons/AddButton";
import SaveButton from "@/Components/Buttons/SaveButton";
import CancelButton from "@/Components/Buttons/CancelButton";

type Props = {
  id: string;
  label: string;
  options: { value: string | number; label: string }[];
  value: string | number | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onAdd: (newName: string) => void;
  error?: string;
  disabled?: boolean;
};

export default function SelectableWithAdd({
  id,
  label,
  options,
  value,
  onChange,
  onAdd,
  error,
  disabled,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState("");

  const handleSubmit = () => {
    if (newValue.trim()) {
      onAdd(newValue.trim());
      setNewValue("");
      setIsOpen(false);
    }
  };

  return (
    <div>
      <InputLabel htmlFor={id} value={label} />
      <div className="flex gap-2 items-center">
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
        <AddButton onClick={() => setIsOpen(true)} disabled={disabled} />
      </div>
      <InputError message={error} className="mt-2" />

      <Modal show={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-2">新規追加</h2>
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="border rounded w-full p-2"
            placeholder={`${label}名を入力`}
          />
          <div className="mt-4 flex justify-end gap-2">
            <CancelButton onClick={() => setIsOpen(false)} />
            <SaveButton onClick={handleSubmit} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
