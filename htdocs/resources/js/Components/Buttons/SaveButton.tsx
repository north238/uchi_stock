import React from "react";
import Button from "@/Components/Button";

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
