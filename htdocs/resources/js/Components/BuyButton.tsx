import { MdOutlineShoppingCart } from "react-icons/md";

interface BuyButtonProps {
  onBuy: () => void;
  ghost?: boolean;
  disabled?: boolean;
}

export default function BuyButton({ onBuy, ghost, disabled }: BuyButtonProps) {
  return (
    <button
      type="button"
      onClick={onBuy}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-semibold transition motion-safe:active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${
        ghost
          ? "bg-transparent text-accent ring-[1.5px] ring-accent/45"
          : "bg-accent text-accent-ink shadow-lg shadow-accent/40"
      }`}
    >
      <MdOutlineShoppingCart className="h-4 w-4" />
      買った
    </button>
  );
}
