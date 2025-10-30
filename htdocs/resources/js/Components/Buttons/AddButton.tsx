import React from "react";
import PrimaryButton from "@/Components/PrimaryButton";

type AddButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
};

export default function AddButton({
  onClick,
  disabled = false,
  label = "＋追加",
}: AddButtonProps) {
  return (
    <PrimaryButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1"
    >
      {label}
    </PrimaryButton>
  );
}
