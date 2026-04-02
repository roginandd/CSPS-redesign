import React from "react";
import { MdOutlineClose } from "react-icons/md";
import type { AdminResponseDTO } from "../../../../api/admin";

interface ResetDefaultPasswordModalProps {
  admin: AdminResponseDTO | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (admin: AdminResponseDTO) => Promise<void>;
}

const ResetDefaultPasswordModal: React.FC<ResetDefaultPasswordModalProps> = ({
  admin,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="absolute inset-0"
        onClick={!isLoading ? onClose : undefined}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-admin-password-title"
        aria-describedby="reset-admin-password-description"
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#171236] p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2
              id="reset-admin-password-title"
              className="text-xl font-semibold text-white"
            >
              Set default password
            </h2>
            <p
              id="reset-admin-password-description"
              className="max-w-[34ch] text-sm leading-6 text-white/75"
            >
              Reset this admin account password to its{" "}
              <span className="font-medium text-white">default value</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close reset password modal"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171236] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdOutlineClose size={20} />
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
            Admin account
          </p>
          <div className="mt-2 space-y-1 text-sm text-white/70">
            <p className="font-semibold text-white">
              {admin.user.firstName} {admin.user.lastName}
            </p>
            <p>@{admin.user.username}</p>
            <p className="text-white/60">{admin.position}</p>
          </div>
        </div>

        <p className="mt-5 max-w-[38ch] text-sm leading-6 text-white/65">
          The password will not be shown here. This account can sign in with
          the default password after the reset is completed.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="min-h-11 flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171236] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(admin)}
            disabled={isLoading}
            className="min-h-11 flex-1 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171236] disabled:cursor-not-allowed disabled:bg-purple-600/60 disabled:text-white/70"
          >
            {isLoading ? "Setting default password..." : "Set default password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetDefaultPasswordModal;
