import React from "react";
import Button from "@/Components/Button";

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
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="success"
    >
      {label}
    </Button>
  );
}
