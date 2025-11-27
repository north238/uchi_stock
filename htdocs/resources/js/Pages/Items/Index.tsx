import { Head, Link, usePage } from "@inertiajs/react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";

interface Item {
  id: number;
  name: string;
  quantity: number;
  memo?: string | null;
  genre?: { id: number; name: string } | null;
  place?: { id: number; name: string } | null;
  created_at?: string;
}

export default function Index({ auth }: PageProps) {
  const { items = [] } = usePage<{ items?: Item[] }>().props;

  return (
    <Authenticated
      user={auth.user}
    >
      <Head title="アイテム一覧" />

      <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">在庫一覧</h3>
          <Link
            href={route("items.create")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            新規登録
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-300">登録されたアイテムはありません。</p>
            <div className="mt-4">
              <Link
                href={route("items.create")}
                className="text-blue-600 dark:text-blue-400 underline"
              >
                アイテムを登録する
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* デスクトップ: テーブル表示 */}
            <div className="hidden md:block bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">個数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ジャンル</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">保管場所</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メモ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.genre?.name ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.place?.name ?? '-'}</td>
                      <td className="px-6 py-4 max-w-xs text-sm text-gray-600 dark:text-gray-300 truncate">{item.memo ?? '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={route("items.edit", item.id)} className="text-indigo-600 hover:text-indigo-900">
                          編集
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* モバイル: カード表示 */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:hidden">
              {items.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">{item.name}</h4>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{item.genre?.name ?? ''} ・ {item.place?.name ?? ''}</div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">{item.quantity} 個</div>
                  </div>

                  {item.memo && <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{item.memo}</p>}

                  <div className="mt-3 flex justify-end">
                    <Link href={route("items.edit", item.id)} className="text-indigo-600 hover:text-indigo-900">
                      編集
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Authenticated>
  );
}
