import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import UpdateGroupForm from "./Partials/UpdateGroupForm";
import DeleteGroupForm from "./Partials/DeleteGroupForm";
import LeaveGroupForm from "./Partials/LeaveGroupForm";

export default function Edit({ auth, group }: PageProps) {
  return (
    <Authenticated
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          グループ設定
        </h2>
      }
    >
      <Head title="グループ設定" />
      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* グループ作成者のみ編集画面を表示 */}
          {group.created_by === auth.user.id && (
            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <UpdateGroupForm group={group} className="max-w-xl" />
            </div>
          )}

          {group.created_by !== auth.user.id && (
            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
              <LeaveGroupForm auth={auth} className="max-w-xl" />
            </div>
          )}

          {/* グループ作成者のみ削除ボタンを表示 */}
          {group.created_by === auth.user.id && (
            <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 border-2 border-red-500 shadow sm:rounded-lg">
              <DeleteGroupForm auth={auth} className="max-w-xl" />
            </div>
          )}
        </div>
      </div>
    </Authenticated>
  );
}
