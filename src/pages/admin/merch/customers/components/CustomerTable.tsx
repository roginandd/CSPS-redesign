import React, { useEffect, useState } from "react";
import type { MerchCustomerResponse } from "../../../../../interfaces/merch_customer/MerchCustomerResponse";
import type { PaginatedResponse } from "../../../../../interfaces/paginated";
import type { MerchDetailedResponse } from "../../../../../interfaces/merch/MerchResponse";
import type {
  OrderItemFreebieResponse,
} from "../../../../../interfaces/freebie/FreebieAssignment";
import { updateOrderItemFreebieAssignment } from "../../../../../api/orderItemFreebie";
import Pagination from "../../../../../components/Pagination";
import { S3_BASE_URL } from "../../../../../constant";
import { toast } from "sonner";

interface CustomerTableProps {
  data: PaginatedResponse<MerchCustomerResponse> | null;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  merchDetail: MerchDetailedResponse | null;
  canEditFreebies: boolean;
  freebieAssignments: Map<number, OrderItemFreebieResponse[]>;
  freebieLoading: boolean;
  onFreebieUpdate: (
    orderItemId: number,
    updatedAssignments: OrderItemFreebieResponse[],
  ) => void;
  onRefresh: () => Promise<void> | void;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  TO_BE_CLAIMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CLAIMED: "bg-green-500/10 text-green-400 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const formatStatus = (status: string): string =>
  status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const buildVariantLabel = (
  design?: string | null,
  color?: string | null,
  size?: string | null,
): string => [design, color, size].filter(Boolean).join(" / ") || "—";

const FreebieCard = ({
  assignment,
  loading,
  readOnly,
  onChange,
}: {
  assignment: OrderItemFreebieResponse;
  loading: boolean;
  readOnly: boolean;
  onChange: (nextAssignments: OrderItemFreebieResponse[]) => void;
}) => {
  const isClothing = assignment.category === "CLOTHING";
  const fieldClass =
    "w-full rounded-lg border border-white/10 bg-[#1a1635] px-3 py-2 text-xs text-white outline-none transition-colors focus:border-purple-500/40 disabled:opacity-50";

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1635] p-3">
      <div className="mb-3">
        <p className="text-sm font-semibold text-white">{assignment.freebieName}</p>
        <p className="mt-1 text-[11px] uppercase tracking-wide text-white/45">
          {isClothing ? "Clothing Freebie" : "Non-Clothing Freebie"}
        </p>
      </div>

      <div className="space-y-3">
        {isClothing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-white/45">
                Size
              </span>
              <select
                value={assignment.selectedSize || ""}
                onChange={(e) => {
                  onChange(
                    [assignment].map((item) =>
                      item.ticketFreebieConfigId === assignment.ticketFreebieConfigId
                        ? { ...assignment, selectedSize: e.target.value || null }
                        : item,
                    ),
                  );
                }}
                disabled={loading || readOnly}
                className={fieldClass}
              >
                <option value="">Pending details</option>
                {(assignment.allowedSizes || []).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-white/45">
                Color
              </span>
              <select
                value={assignment.selectedColor || ""}
                onChange={(e) => {
                  onChange(
                    [assignment].map((item) =>
                      item.ticketFreebieConfigId === assignment.ticketFreebieConfigId
                        ? { ...assignment, selectedColor: e.target.value || null }
                        : item,
                    ),
                  );
                }}
                disabled={loading || readOnly}
                className={fieldClass}
              >
                <option value="">Pending details</option>
                {(assignment.allowedColors || []).map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : (
          <label className="space-y-1">
            <span className="text-[10px] font-medium uppercase tracking-wide text-white/45">
              Design
            </span>
            <select
              value={assignment.selectedDesign || ""}
              onChange={(e) => {
                onChange(
                  [assignment].map((item) =>
                    item.ticketFreebieConfigId === assignment.ticketFreebieConfigId
                      ? { ...assignment, selectedDesign: e.target.value || null }
                      : item,
                  ),
                );
              }}
              disabled={loading || readOnly}
              className={fieldClass}
            >
              <option value="">Pending details</option>
              {(assignment.allowedDesigns || []).map((design) => (
                <option key={design} value={design}>
                  {design}
                </option>
              ))}
            </select>
          </label>
        )}

      </div>
    </div>
  );
};

const SkeletonRow = ({ hasFreebie }: { hasFreebie: boolean }) => (
  <tr className="border-b border-zinc-800">
    {Array.from({ length: hasFreebie ? 9 : 8 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 animate-pulse rounded bg-zinc-800/80" />
      </td>
    ))}
  </tr>
);

const CustomerTable: React.FC<CustomerTableProps> = ({
  data,
  loading,
  currentPage,
  onPageChange,
  merchDetail,
  canEditFreebies,
  freebieAssignments,
  freebieLoading,
  onFreebieUpdate,
  onRefresh,
}) => {
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number | null>(
    null,
  );
  const [draftAssignments, setDraftAssignments] = useState<OrderItemFreebieResponse[]>(
    [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const customers = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const from = currentPage * (data?.size ?? 7) + 1;
  const to = Math.min(from + (data?.numberOfElements ?? 0) - 1, totalElements);
  const hasFreebie = merchDetail?.hasFreebie === true;
  const isTicketMerch = merchDetail?.merchType === "TICKET";
  const hasEditableTicketFreebies = hasFreebie && isTicketMerch && canEditFreebies;

  const selectedCustomer =
    selectedOrderItemId != null
      ? customers.find((customer) => customer.orderItemId === selectedOrderItemId) ||
        null
      : null;

  useEffect(() => {
    if (selectedOrderItemId == null) {
      setDraftAssignments([]);
      setSaveError(null);
      return;
    }

    const nextAssignments = freebieAssignments.get(selectedOrderItemId);
    const normalizedAssignments = Array.isArray(nextAssignments)
      ? nextAssignments
      : [];
    setDraftAssignments(
      normalizedAssignments.map((assignment) => ({
        ...assignment,
      })),
    );
    setSaveError(null);
  }, [selectedOrderItemId, freebieAssignments]);

  const handleDraftChange = (updatedAssignment: OrderItemFreebieResponse) => {
    setDraftAssignments((prev) =>
      prev.map((item) =>
        item.ticketFreebieConfigId === updatedAssignment.ticketFreebieConfigId
          ? updatedAssignment
          : item,
      ),
    );
  };

  const handleConfirmFreebieUpdate = async () => {
    if (!selectedOrderItemId) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const payload = draftAssignments.map((item) => ({
        ticketFreebieConfigId: item.ticketFreebieConfigId,
        selectedSize: item.selectedSize || undefined,
        selectedColor: item.selectedColor || undefined,
        selectedDesign: item.selectedDesign || undefined,
        fulfillmentStatus: item.fulfillmentStatus || "PENDING_DETAILS",
      }));

      const response = await updateOrderItemFreebieAssignment(
        selectedOrderItemId,
        payload,
      );

      onFreebieUpdate(selectedOrderItemId, response);
      await onRefresh();
      toast.success("Freebie details updated successfully.");
      setSelectedOrderItemId(null);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "failed to update freebie assignment";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!loading && customers.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-[#110e31] p-16 text-center shadow-sm">
        <h3 className="mb-2 text-lg font-semibold text-white">No Customers Found</h3>
        <p className="mx-auto max-w-md text-sm text-zinc-500">
          No customers match your current filters. Try adjusting your search or
          status filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#110e31] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-[#110e31]">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Student
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Year
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Variant
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-zinc-500">
                Qty
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-zinc-500">
                Total
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Status
              </th>
              {hasFreebie && (
                <th className="min-w-[24rem] px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Freebies
                </th>
              )}
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Date
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-zinc-500">
                Image
              </th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} hasFreebie={hasFreebie} />
                ))
              : customers.map((customer, index) => {
                  const assignments = customer.orderItemId
                    ? freebieAssignments.get(customer.orderItemId) || []
                    : [];

                  return (
                    <tr
                      key={`${customer.studentId}-${index}`}
                      className="border-b border-zinc-800 align-top transition-colors hover:bg-zinc-800/40"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-white">{customer.studentName}</p>
                        <p className="mt-0.5 text-xs text-zinc-500">{customer.studentId}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                          {customer.yearLevel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-zinc-300">
                        {buildVariantLabel(customer.design, customer.color, customer.size)}
                      </td>
                      <td className="px-4 py-4 text-center text-zinc-300">
                        {customer.quantity}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-white">
                        ₱
                        {customer.totalPrice.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${
                            statusColors[customer.orderStatus] ??
                            "border-zinc-700 bg-zinc-800/50 text-zinc-400"
                          }`}
                        >
                          {formatStatus(customer.orderStatus)}
                        </span>
                      </td>
                      {hasFreebie && (
                        <td className="px-4 py-4">
                          {assignments.length > 0 ? (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                {assignments.map((assignment) => (
                                  <div
                                    key={assignment.ticketFreebieConfigId}
                                    className="rounded-lg border border-zinc-700 bg-zinc-950/40 px-3 py-2"
                                  >
                                    <p className="text-xs font-medium text-white">
                                      {assignment.freebieName}
                                    </p>
                                    <p className="mt-1 text-[11px] text-zinc-400">
                                      {assignment.category === "CLOTHING"
                                        ? `Size: ${assignment.selectedSize || "Pending"} • Color: ${assignment.selectedColor || "Pending"}`
                                        : `Design: ${assignment.selectedDesign || "Pending"}`}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {hasEditableTicketFreebies && customer.orderItemId && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedOrderItemId(customer.orderItemId || null)
                                  }
                                  className="w-fit rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
                                >
                                  Edit freebies
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-500">
                              {hasEditableTicketFreebies
                                ? "No freebie assignment"
                                : "Pending details"}
                            </span>
                          )}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-zinc-400">
                        {formatDate(customer.orderDate)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {customer.s3ImageKey ? (
                          <img
                            src={`${S3_BASE_URL}${customer.s3ImageKey}`}
                            alt="variant"
                            className="mx-auto h-10 w-10 rounded-lg border border-zinc-700 object-cover shadow-sm"
                          />
                        ) : (
                          <span className="text-xs text-zinc-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800 bg-[#110e31] px-4 py-4 sm:flex-row">
          <p className="text-xs text-zinc-500">
            Showing {from}-{to} of {totalElements}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
      </div>

      {hasEditableTicketFreebies && selectedCustomer && selectedOrderItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedOrderItemId(null)}
          />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#171236] p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                  Ticket Freebies
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {selectedCustomer.studentName}
                </h3>
                <p className="text-xs text-white/50">{selectedCustomer.studentId}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderItemId(null)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:bg-white/10"
              >
                Cancel
              </button>
            </div>

            {draftAssignments.length > 0 ? (
              <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                {draftAssignments.map((assignment) => (
                  <FreebieCard
                    key={assignment.ticketFreebieConfigId}
                    assignment={assignment}
                    loading={freebieLoading}
                    readOnly={!canEditFreebies}
                    onChange={(nextAssignments) => {
                      if (!nextAssignments.length) {
                        return;
                      }
                      handleDraftChange(nextAssignments[0]);
                    }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/60">No freebies available for this order.</p>
            )}

            {saveError && <p className="mt-3 text-xs text-red-400">{saveError}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderItemId(null)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                Close
              </button>
              {canEditFreebies && (
                <button
                  type="button"
                  onClick={handleConfirmFreebieUpdate}
                  disabled={isSaving || freebieLoading}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Confirm Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerTable;
