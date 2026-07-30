import { Head, Link, usePage } from "@inertiajs/react";
import { MdAdd, MdKeyboardArrowDown } from "react-icons/md";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import Dropdown from "@/Components/Dropdown";
import ItemCard from "@/Pages/Items/Partials/ItemCard";
import { ItemStatusValue } from "@/constants/itemStatus";
import { PageProps } from "@/types";

export interface Item {
  id: number;
  name: string;
  status: ItemStatusValue;
  quantity: number | null;
  days_since_purchase: number | null;
  last_purchased_at: string | null;
  genre?: { id: number; name: string } | null;
  place?: { id: number; name: string } | null;
}

type SortValue = "status" | "purchased";

const SORT_LABEL: Record<SortValue, string> = {
  status: "状態順",
  purchased: "前回購入が古い順",
};

export default function Index({ auth }: PageProps) {
  const { items = [], sort = "status" } = usePage<{ items?: Item[]; sort?: SortValue }>().props;

  return (
    <Authenticated user={auth.user}>
      <Head title="アイテム一覧" />

      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-ink">在庫一覧</h1>

          <Dropdown>
            <Dropdown.Trigger>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-surface px-3 py-1 text-[12.5px] text-ink"
              >
                並び替え {SORT_LABEL[sort]}
                <MdKeyboardArrowDown className="h-4 w-4" />
              </button>
            </Dropdown.Trigger>
            <Dropdown.Content align="right" width="48">
              <Dropdown.Link href={route("items.index", { sort: "status" })} preserveScroll preserveState>
                状態順
              </Dropdown.Link>
              <Dropdown.Link
                href={route("items.index", { sort: "purchased" })}
                preserveScroll
                preserveState
              >
                前回購入が古い順
              </Dropdown.Link>
            </Dropdown.Content>
          </Dropdown>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[20px] bg-surface p-6 text-center shadow-card">
            <p className="text-muted">登録されたアイテムはありません。</p>
            <Link
              href={route("items.create")}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
            >
              アイテムを登録する
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <Link
        href={route("items.create")}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-1 rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-accent-ink shadow-card motion-safe:active:scale-95"
      >
        <MdAdd className="h-5 w-5" />
        登録
      </Link>
    </Authenticated>
  );
}
