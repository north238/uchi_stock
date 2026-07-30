import { ITEM_STATUS, ItemStatusValue, STATUS_ACTIVE_CLASS } from "@/constants/itemStatus";

interface StatusSegmentProps {
  value: ItemStatusValue;
  onChange: (next: ItemStatusValue) => void;
  disabled?: boolean;
}

export default function StatusSegment({ value, onChange, disabled }: StatusSegmentProps) {
  return (
    <div
      role="group"
      aria-label="在庫ステータス"
      className="inline-flex items-center gap-1 rounded-full bg-surface-2 p-1"
    >
      {ITEM_STATUS.map((status) => {
        const selected = status.value === value;

        return (
          <button
            key={status.value}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => !selected && onChange(status.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition motion-safe:active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${
              selected ? STATUS_ACTIVE_CLASS[status.value] : "bg-transparent text-faint"
            }`}
          >
            {status.label}
          </button>
        );
      })}
    </div>
  );
}
