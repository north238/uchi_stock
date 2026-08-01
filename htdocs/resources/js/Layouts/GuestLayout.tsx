import { Link, usePage } from "@inertiajs/react";
import { PropsWithChildren, useEffect } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import ApplicationLogo from "@/Components/ApplicationLogo";

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper">
      <Link href="/" className="mb-6">
        <ApplicationLogo className="block h-10 w-auto text-ink" />
      </Link>
      <div className="w-full max-w-sm sm:p-6 p-4 sm:mx-0 mx-2 bg-surface rounded-[20px] shadow-card border border-line">
        {children}
      </div>
    </div>
  );
}
