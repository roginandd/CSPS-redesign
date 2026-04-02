import React from "react";
import { IoClose } from "react-icons/io5";

interface CancelOrderModalProps {
  orderId: number;
  onConfirm: (orderId: number) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  orderId,
  onConfirm,
  onClose,
  isLoading,
}) => {
  const descriptionId = `cancel-order-description-${orderId}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={!isLoading ? onClose : undefined}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        aria-describedby={descriptionId}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#171236] p-6 sm:p-7"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/40">
              Order action
            </p>
            <div className="space-y-2">
              <h2
                id="cancel-order-title"
                className="text-xl font-semibold tracking-tight text-white"
              >
                Cancel order?
              </h2>
              <p
                id={descriptionId}
                className="max-w-[34ch] text-sm leading-6 text-white/60"
              >
                Order <span className="font-semibold text-white">#{orderId}</span> will
                be marked as cancelled. This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171236] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IoClose size={18} />
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-300/80">
            Before you continue
          </p>
          <p className="mt-2 text-sm leading-6 text-red-100/80">
            Cancel this order only if you no longer intend to claim the items.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171236] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep order
          </button>
          <button
            type="button"
            onClick={() => onConfirm(orderId)}
            disabled={isLoading}
            className="inline-flex min-w-[9.5rem] items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors duration-150 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171236] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-red-400/20 border-t-red-400 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
