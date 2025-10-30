import React from "react";
import PrimaryButton from "@/Components/PrimaryButton";

type CancelButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
};

export default function CancelButton({
  onClick,
  disabled = false,
  label = "キャンセル",
}: CancelButtonProps) {
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
