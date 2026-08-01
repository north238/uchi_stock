import { useEffect, useState, PropsWithChildren } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { User } from "@/types";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import Modal from "@/Components/Modal";
import { MdErrorOutline } from "react-icons/md";

type FlashMessage = {
  success?: string;
  error?: string;
};

type CustomPageProps = {
  flash?: FlashMessage;
  showGroupModal?: boolean;
};

export default function Authenticated({
  user,
  children,
}: PropsWithChildren<{ user: User }>) {
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const [forceModal, setForceModal] = useState(false);
  const { flash, showGroupModal } = usePage<CustomPageProps>().props;

  useEffect(() => {
    if (flash?.success) {
      showSuccessToast(flash.success);
    }
    if (flash?.error) {
      showErrorToast(flash.error);
    }
  }, [flash]);

  useEffect(() => {
    if (showGroupModal) {
      setForceModal(true);
    }
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-paper">
      <nav className="bg-surface border-b border-line sticky top-0 z-30">
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <Link href="/">
                  <ApplicationLogo className="block h-9 w-auto text-ink" />
                </Link>
              </div>
            </div>

            <div className="hidden sm:flex sm:items-center sm:ms-6">
              <div className="shrink-0">
                <img
                  src={
                    user.avatar_path ? `/storage/${user.avatar_path}` : "/img/default-avatar.svg"
                  }
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="ms-2 relative min-w-0">
                <Dropdown>
                  <Dropdown.Trigger>
                    <button
                      type="button"
                      className="flex w-full min-w-0 items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-muted bg-surface hover:text-ink focus:outline-none transition ease-in-out duration-150"
                    >
                      <div className="flex min-w-0 flex-col items-start gap-2 max-w-40">
                        <span className="block w-full truncate">
                          {user.group ? user.group?.name : "グループ未所属"}
                        </span>
                        <span className="block w-full truncate">{user.name}</span>
                      </div>

                      <svg
                        className="ms-2 -me-0.5 h-4 w-4 shrink-0"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </Dropdown.Trigger>

                  <Dropdown.Content>
                    <Dropdown.Link href={route("profile.edit")}>プロフィール</Dropdown.Link>
                    {user.group_id ? (
                      <Dropdown.Link href={route("groups.edit", user.group_id)}>
                        グループ編集
                      </Dropdown.Link>
                    ) : (
                      <Dropdown.Link href={route("groups.create")}>グループ作成</Dropdown.Link>
                    )}
                    <Dropdown.Link href={route("logout")} method="post" as="button">
                      ログアウト
                    </Dropdown.Link>
                  </Dropdown.Content>
                </Dropdown>
              </div>
            </div>

            <div className="-me-2 flex items-center sm:hidden">
              <button
                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                className="inline-flex items-center justify-center p-2 rounded-md text-muted hover:text-ink hover:bg-surface-2 focus:outline-none focus:bg-surface-2 focus:text-ink transition duration-150 ease-in-out"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path
                    className={!showingNavigationDropdown ? "inline-flex" : "hidden"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                  <path
                    className={showingNavigationDropdown ? "inline-flex" : "hidden"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={(showingNavigationDropdown ? "block" : "hidden") + " sm:hidden"}>
          <div className="max-w-page mx-auto">
            <div className="pt-2 pb-3 space-y-1">
              <ResponsiveNavLink href={route("items.index")} active={route().current("items.index")}>
                在庫管理
              </ResponsiveNavLink>
            </div>

            <div className="pt-4 pb-1 border-t border-line">
              <div className="px-4">
                <div className="font-medium text-base text-ink">{user.name}</div>
                <div className="font-medium text-sm text-muted">{user.email}</div>
              </div>

              <div className="mt-3 space-y-1">
                <ResponsiveNavLink href={route("profile.edit")}>プロフィール</ResponsiveNavLink>
                {user.group_id ? (
                  <ResponsiveNavLink href={route("groups.edit", user.group_id)}>
                    グループ編集
                  </ResponsiveNavLink>
                ) : (
                  <ResponsiveNavLink href={route("groups.create")}>グループ作成</ResponsiveNavLink>
                )}
                <ResponsiveNavLink method="post" href={route("logout")} as="button">
                  ログアウト
                </ResponsiveNavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>

      {forceModal && (
        <Modal
          show={forceModal}
          closeable={false}
          onClose={() => setForceModal(false)}
          maxWidth="sm"
        >
          <div className="flex flex-col justify-center items-center gap-4 p-6">
            <div className="flex flex-col items-center gap-4">
              <MdErrorOutline className="w-12 h-12 text-danger" />
              <h2 className="text-lg font-medium text-ink">グループに未所属です</h2>

              <p className="text-sm text-muted">
                グループに参加またはグループを作成することで、すべての機能を利用できます。
                <br />
                「スキップ」を選ぶと、仮のグループが自動で作成されます。あとから編集・変更も可能です。
              </p>
            </div>

            <div className="flex flex-col justify-center gap-2">
              <Link
                href={route("groups.create")}
                className="primary-link-btn"
                as="button"
                onClick={() => setForceModal(false)}
              >
                グループを作成する
              </Link>
              <Link
                href={route("groups.default.create")}
                className="secondary-link-btn"
                as="button"
                onClick={() => setForceModal(false)}
              >
                スキップ
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
