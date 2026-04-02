import React, { useState } from "react";
import type { AdminResponseDTO } from "../../../../api/admin";
import ResetDefaultPasswordModal from "./ResetDefaultPasswordModal";

interface StaffTableProps {
  admins: AdminResponseDTO[];
  onRevoke: (adminId: number) => void;
  onResetDefaultPassword: (admin: AdminResponseDTO) => Promise<void>;
  resettingAdminId: number | null;
}

const StaffTable: React.FC<StaffTableProps> = ({
  admins,
  onRevoke,
  onResetDefaultPassword,
  resettingAdminId,
}) => {
  const [selectedAdmin, setSelectedAdmin] = useState<AdminResponseDTO | null>(
    null,
  );

  const handleConfirmReset = async (admin: AdminResponseDTO) => {
    try {
      await onResetDefaultPassword(admin);
      setSelectedAdmin(null);
    } catch {
      // Errors are surfaced by the parent callback.
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-3xl border border-white/10 bg-[#171236]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-5 text-sm font-semibold tracking-wide text-white/50">
                Name
              </th>
              <th className="p-5 text-sm font-semibold tracking-wide text-white/50">
                Email
              </th>
              <th className="p-5 text-sm font-semibold tracking-wide text-white/50">
                Position
              </th>
              <th className="p-5 text-sm font-semibold tracking-wide text-white/50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {admins.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-sm text-white/30">
                  No staff members found.
                </td>
              </tr>
            ) : (
              admins.map((admin) => {
                const initials = `${admin.user.firstName.charAt(0)}${admin.user.lastName.charAt(0)}`;
                const isResetting = resettingAdminId === admin.adminId;

                return (
                  <tr
                    key={admin.adminId}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/12 text-sm font-semibold text-purple-200">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white">
                            {admin.user.firstName} {admin.user.lastName}
                          </div>
                          <div className="truncate text-xs text-white/40">
                            @{admin.user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-white/70">
                      {admin.user.email}
                    </td>
                    <td className="p-5">
                      <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-200">
                        {admin.position}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAdmin(admin)}
                          disabled={isResetting}
                          className="min-h-10 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171236] disabled:cursor-not-allowed disabled:bg-purple-600/60 disabled:text-white/70"
                        >
                          {isResetting
                            ? "Setting..."
                            : "Set default password"}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRevoke(admin.adminId)}
                          className="min-h-10 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#171236]"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ResetDefaultPasswordModal
        admin={selectedAdmin}
        isOpen={selectedAdmin !== null}
        isLoading={selectedAdmin !== null && resettingAdminId === selectedAdmin.adminId}
        onClose={() => setSelectedAdmin(null)}
        onConfirm={handleConfirmReset}
      />
    </>
  );
};

export default StaffTable;
