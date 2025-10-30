import React from "react";
import PrimaryButton from "@/Components/PrimaryButton";

type SaveButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
};

export default function SaveButton({
  onClick,
  disabled = false,
  label = "保存",
}: SaveButtonProps) {
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
