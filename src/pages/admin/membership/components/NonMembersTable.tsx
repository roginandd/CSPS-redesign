import React from "react";
import type { InactiveMembershipResponse } from "../../../../interfaces/student/InactiveMembershipResponse";
import type { PaginatedResponse } from "../../../../interfaces/paginated";
import Pagination from "../../../../components/Pagination";

/**
 * Paginated table of non-members (students without active membership).
 * Shows student ID and full name from the inactive membership response.
 * The "Grant Membership" action button is only rendered when canEditFinance is true.
 *
 * @param data - paginated response of inactive membership records
 * @param loading - whether data is being fetched
 * @param currentPage - current zero-based page index
 * @param onPageChange - callback when the page changes
 * @param canEditFinance - whether the current user has finance edit permissions (RBAC)
 * @param onGrantMembership - callback when Grant Membership button is clicked (studentId, fullName)
 */

interface NonMembersTableProps {
  data: PaginatedResponse<InactiveMembershipResponse> | null;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  canEditFinance: boolean;
  onGrantMembership?: (studentId: string, fullName: string) => void;
}

const NonMembersTable: React.FC<NonMembersTableProps> = ({
  data,
  loading,
  currentPage,
  onPageChange,
  canEditFinance,
  onGrantMembership,
}) => {
  const students = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const from = currentPage * (data?.size ?? 7) + 1;
  const to = Math.min(from + (data?.numberOfElements ?? 0) - 1, totalElements);

  // empty state
  if (!loading && students.length === 0) {
    return (
      <div className="bg-[#1E1E3F] border border-white/5 rounded-2xl p-16 text-center">
        <h3 className="text-xl font-bold text-white mb-2">No Students Found</h3>
        <p className="text-gray-400 text-sm">
          There are no students matching your current search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1E1E3F] rounded-2xl border border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-xs font-medium text-zinc-500 tracking-wide uppercase">
                Student ID
              </th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-500 tracking-wide uppercase">
                Full Name
              </th>
              {canEditFinance && (
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 tracking-wide uppercase text-center">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5 animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-white/10 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-white/10 rounded"></div>
                    </td>
                    {canEditFinance && (
                      <td className="px-4 py-4 text-center">
                        <div className="h-8 w-20 bg-white/10 rounded mx-auto"></div>
                      </td>
                    )}
                  </tr>
                ))
              : students.map((student) => (
                  <tr
                    key={student.studentId}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <p className="text-white font-medium text-sm">
                        {student.studentId}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white font-medium">
                        {student.fullName ||
                          (student.user
                            ? `${student.user.firstName} ${student.user.lastName}`
                            : "")}
                      </p>
                    </td>
                    {canEditFinance && (
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() =>
                            onGrantMembership?.(
                              student.studentId,
                              student.fullName ||
                                (student.user
                                  ? `${student.user.firstName} ${student.user.lastName}`
                                  : ""),
                            )
                          }
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 hover:border-purple-500/50 transition-colors"
                        >
                          Grant
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* pagination footer */}
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-white/5 gap-3">
          <p className="text-xs text-zinc-500">
            Showing {from}–{to} of {totalElements}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default NonMembersTable;
