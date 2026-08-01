import Authenticated from "@/Layouts/AuthenticatedLayout";
import PageContainer from "@/Components/PageContainer";
import PageHeading from "@/Components/PageHeading";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import UpdateGroupForm from "./Partials/UpdateGroupForm";
import DeleteGroupForm from "./Partials/DeleteGroupForm";
import LeaveGroupForm from "./Partials/LeaveGroupForm";

export default function Edit({ auth, group }: PageProps) {
  return (
    <Authenticated user={auth.user}>
      <Head title="グループ設定" />
      <PageContainer>
        <PageHeading>グループ設定</PageHeading>
        <div className="mt-4 space-y-6">
          {/* グループ作成者のみ編集画面を表示 */}
          {group.created_by === auth.user.id && (
            <div className="p-4 sm:p-8 bg-surface shadow-card sm:rounded-[20px]">
              <UpdateGroupForm group={group} className="max-w-xl" />
            </div>
          )}

          {group.created_by !== auth.user.id && (
            <div className="p-4 sm:p-8 bg-surface shadow-card sm:rounded-[20px]">
              <LeaveGroupForm auth={auth} className="max-w-xl" />
            </div>
          )}

          {/* グループ作成者のみ削除ボタンを表示 */}
          {group.created_by === auth.user.id && (
            <div className="p-4 sm:p-8 bg-surface border-2 border-danger shadow-card sm:rounded-[20px]">
              <DeleteGroupForm auth={auth} className="max-w-xl" />
            </div>
          )}
        </div>
      </PageContainer>
    </Authenticated>
  );
}
