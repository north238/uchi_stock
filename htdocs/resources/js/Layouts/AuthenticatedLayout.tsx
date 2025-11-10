import { useEffect, useState, PropsWithChildren, ReactNode } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
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
  header,
  children,
}: PropsWithChildren<{ user: User; header?: ReactNode }>) {
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <Link href="/">
                  <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                </Link>
              </div>
              <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                <NavLink href={route("items.index")} active={route().current("items.index")}>
                  在庫管理
                </NavLink>
              </div>
            </div>

            <div className="hidden sm:flex sm:items-center sm:ms-6">
              <div>アカウントimg</div>
              <div className="ms-3 relative">
                <Dropdown>
                  <Dropdown.Trigger>
                    <span className="inline-flex rounded-md">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                      >
                        <div className="flex flex-col items-start gap-2 max-w-40">
                          <span className="block max-w-40 truncate">
                            {user.group ? user.group?.name : "グループ未所属"}
                          </span>
                          <span className="block max-w-40 truncate">{user.name}</span>
                        </div>

                        <svg
                          className="ms-2 -me-0.5 h-4 w-4"
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
                    </span>
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
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-500 dark:focus:text-gray-400 transition duration-150 ease-in-out"
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
          <div className="pt-2 pb-3 space-y-1">
            <ResponsiveNavLink
              href={route("items.index")}
              active={route().current("items.index")}
            >
              在庫管理
            </ResponsiveNavLink>
          </div>

          <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
            <div className="px-4">
              <div className="font-medium text-base text-gray-800 dark:text-gray-200">
                {user.name}
              </div>
              <div className="font-medium text-sm text-gray-500">{user.email}</div>
            </div>

            <div className="mt-3 space-y-1">
              <ResponsiveNavLink href={route("profile.edit")}>プロフィール</ResponsiveNavLink>
              <ResponsiveNavLink method="post" href={route("logout")} as="button">
                ログアウト
              </ResponsiveNavLink>
            </div>
          </div>
        </div>
      </nav>

      {header && (
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
        </header>
      )}

      <main>{children}</main>

      {forceModal && (
        <Modal
          show={forceModal}
          closeable={false}
          onClose={() => setForceModal(false)}
          maxWidth="sm"
        >
          <div className="flex flex-col justify-center items-center gap-4 p-6">
            <div className="flex flex-col items-center gap-4">
              <MdErrorOutline className="w-12 h-12 text-red-500" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                グループに未所属です
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400">
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
