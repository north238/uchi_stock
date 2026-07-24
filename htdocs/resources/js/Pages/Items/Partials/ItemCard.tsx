import { Link, router } from "@inertiajs/react";
import { MdOutlineAccessTime } from "react-icons/md";
import StatusSegment from "@/Components/StatusSegment";
import BuyButton from "@/Components/BuyButton";
import { showBuyUndoToast } from "@/utils/toast";
import { ItemStatusValue } from "@/constants/itemStatus";
import type { Item } from "@/Pages/Items/Index";

interface ItemCardProps {
  item: Item;
}

const lastBuyText = (d: number | null) => (d === 0 ? "今日" : `${d}日前`);

export default function ItemCard({ item }: ItemCardProps) {
  const handleStatusChange = (next: ItemStatusValue) => {
    router.patch(route("items.status.update", item.id), { status: next }, { preserveScroll: true });
  };

  const handleBuy = () => {
    const previousStatus = item.status;
    router.post(
      route("items.purchase.store", item.id),
      {},
      {
        preserveScroll: true,
        onSuccess: () =>
          showBuyUndoToast(item, () =>
            router.delete(route("items.purchase.destroy", item.id), {
              data: { previous_status: previousStatus },
              preserveScroll: true,
            })
          ),
      }
    );
  };

  const metaParts = [item.genre?.name, item.place?.name].filter(Boolean);
  const needsRestock = item.status === "out" || item.status === "low";

  return (
    <div className="rounded-[20px] bg-surface p-3.5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={route("items.edit", item.id)}
          className="text-[17px] font-bold text-ink underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded-sm"
        >
          {item.name}
        </Link>
        {item.quantity !== null && (
          <span className="shrink-0 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs tabular-nums text-muted">
            残り {item.quantity}
          </span>
        )}
      </div>

      {metaParts.length > 0 && (
        <div className="mt-1 text-xs text-faint">{metaParts.join(" ・ ")}</div>
      )}

      <div className="mt-2 flex items-center gap-1 text-xs text-faint">
        <MdOutlineAccessTime className="h-3.5 w-3.5" />
        {item.days_since_purchase === null ? (
          <span>購入記録なし</span>
        ) : (
          <span>
            前回購入{" "}
            <span className="font-bold tabular-nums text-ink">
              {lastBuyText(item.days_since_purchase)}
            </span>
          </span>
        )}
        {needsRestock && <span className="font-bold text-accent">・ そろそろ買い足し</span>}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <StatusSegment value={item.status} onChange={handleStatusChange} />
        <BuyButton onBuy={handleBuy} ghost={item.status === "in_stock"} />
      </div>
    </div>
  );
}
