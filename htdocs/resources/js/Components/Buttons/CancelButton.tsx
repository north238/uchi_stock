import React from "react";
import Button from "@/Components/Button";

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
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="danger"
    >
      {label}
    </Button>
  );
}
