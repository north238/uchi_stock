import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link, usePage } from "@inertiajs/react";
import { PropsWithChildren, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

type FlashMessage = {
  success?: string;
  error?: string;
};

type CustomPageProps = {
  flash?: FlashMessage;
};

export default function Guest({ children }: PropsWithChildren) {
  const { flash } = usePage<CustomPageProps>().props;

  useEffect(() => {
    if (flash?.success) {
      showSuccessToast(flash.success);
    }
    if (flash?.error) {
      showErrorToast(flash.error);
    }
  }, [flash]);
  return (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-white dark:bg-gray-900">
      <div>
        {/* <Link href="/">
                    <ApplicationLogo className="w-20 h-20 fill-current text-gray-500" />
                </Link> */}
      </div>

      <div className="w-full sm:max-w-md mt-6 p-6 bg-white dark:bg-gray-800 border border-gray-200 shadow-md overflow-hidden sm:rounded-lg">
        {children}
      </div>
    </div>
  );
}
