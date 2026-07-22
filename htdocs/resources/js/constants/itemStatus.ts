export type ItemStatusValue = "in_stock" | "low" | "out";

export const ITEM_STATUS: { value: ItemStatusValue; label: string }[] = [
  { value: "in_stock", label: "ある" },
  { value: "low", label: "少ない" },
  { value: "out", label: "ない" },
];

// セグメント選択中のスタイル（未選択は text-faint・透明背景）
export const STATUS_ACTIVE_CLASS: Record<ItemStatusValue, string> = {
  in_stock: "bg-status-in text-status-in-ink",
  low: "bg-status-low text-status-low-ink",
  out: "bg-status-out text-status-out-ink ring-1 ring-status-out-line",
};
