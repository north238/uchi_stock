import { toast, ToastOptions, ToastPosition } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-center" as ToastPosition,
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const showSuccessToast = (message: string) => {
  toast.success(message, defaultOptions);
};

export const showErrorToast = (message: string) => {
  toast.error(message, defaultOptions);
};

export const showBuyUndoToast = (item: { name: string }, onUndo: () => void) =>
  toast(
    ({ closeToast }) => (
      <div className="flex items-center justify-between gap-3">
        <span>「{item.name}」を買ったに記録しました</span>
        <button
          className="font-bold text-accent"
          onClick={() => {
            onUndo();
            closeToast?.();
          }}
        >
          取り消す
        </button>
      </div>
    ),
    { ...defaultOptions, autoClose: 6000, position: "bottom-center" }
  );
