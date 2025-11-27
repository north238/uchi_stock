import { usePage } from "@inertiajs/react";
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm sm:p-6 p-4 sm:mx-0 mx-2 bg-white dark:bg-gray-800 rounded-md shadow-lg">
        {children}
      </div>
    </div>
  );
}
