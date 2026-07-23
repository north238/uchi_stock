import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import { Head } from "@inertiajs/react";
import { PageProps } from "@/types";
import RegisterPasswordForm from "./Partials/RegisterPasswordForm";

export default function Edit({
  auth,
  mustVerifyEmail,
  status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <h2 className="font-semibold text-xl text-ink leading-tight">プロフィール</h2>
      }
    >
      <Head title="プロフィール" />

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8 space-y-6">
          <div className="p-4 sm:p-8 bg-surface shadow-card sm:rounded-[20px]">
            <UpdateProfileInformationForm
              mustVerifyEmail={mustVerifyEmail}
              status={status}
              className="max-w-xl"
            />
          </div>

          {auth.user.is_password_set === false ? (
            // パスワード未設定なら「新規登録フォーム」を表示
            <div className="p-4 sm:p-8 bg-surface shadow-card sm:rounded-[20px]">
              <RegisterPasswordForm className="max-w-xl" />
            </div>
          ) : (
            // すでにパスワードがあるなら「パスワード更新フォーム」を表示
            <div className="p-4 sm:p-8 bg-surface shadow-card sm:rounded-[20px]">
              <UpdatePasswordForm className="max-w-xl" />
            </div>
          )}

          <div className="p-4 sm:p-8 bg-surface border-2 border-danger shadow-card sm:rounded-[20px]">
            <DeleteUserForm className="max-w-xl" auth={auth} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
