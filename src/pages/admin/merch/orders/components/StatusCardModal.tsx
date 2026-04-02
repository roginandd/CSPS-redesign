import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OrderItemResponse } from "../../../../../interfaces/order/OrderResponse";
import { S3_BASE_URL } from "../../../../../constant";
import { OrderStatus } from "../../../../../enums/OrderStatus";
import { MerchType } from "../../../../../enums/MerchType";
import { FiX } from "react-icons/fi";
import { getAllowedTransitions, STATUS_LABELS, getStatusDisplay } from "../../../../../utils/statusConfig";
import { updateOrderItemFreebies } from "../../../../../api/order";
import { getFreebiePresets } from "../../../../../api/merch";
import type { FreebiePreset } from "../../../../../interfaces/merch/FreebiePreset";
import FreebieSelectionModal from "../../../../merch/productView/components/FreebieSelectionModal";
import { toast } from "sonner";

interface StatusCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItem: OrderItemResponse;
  currentStatus: OrderStatus;
  onStatusUpdate: (status: OrderStatus) => void;
  canEdit?: boolean;
}

const StatusCardModal: React.FC<StatusCardModalProps> = ({
  isOpen,
  onClose,
  orderItem,
  currentStatus,
  onStatusUpdate,
  canEdit = true,
}) => {
  const [tempStatus, setTempStatus] = useState<OrderStatus>(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingFreebies, setIsUpdatingFreebies] = useState(false);
  const [showFreebieModal, setShowFreebieModal] = useState(false);
  const [freebiePresets, setFreebiePresets] = useState<FreebiePreset[]>([]);
  const [freebieSelection, setFreebieSelection] = useState<{ [freebieMerchId: number]: number }>({});

  useEffect(() => {
    if (isOpen && orderItem.merchType === MerchType.TICKET && orderItem.merchId) {
      getFreebiePresets(orderItem.merchId).then(presets => {
        setFreebiePresets(presets || []);
      }).catch(() => {
        // failed to fetch presets
      });
    }
  }, [isOpen, orderItem.merchType, orderItem.merchId]);

  useEffect(() => {
    if (isOpen) {
      setFreebieSelection({});
    }
  }, [isOpen, orderItem.orderItemId]);

  const handleUpdateFreebies = async () => {
    if (!orderItem.orderItemId) return;
    try {
      setIsUpdatingFreebies(true);
      await updateOrderItemFreebies(orderItem.orderItemId, Object.values(freebieSelection).map(id => ({ merchVariantItemId: id })));
      toast.success("Freebies successfully updated!");
      setShowFreebieModal(false);
    } catch (err) {
      toast.error("Failed to update freebies");
    } finally {
      setIsUpdatingFreebies(false);
    }
  };
  const isClothing = orderItem.merchType === MerchType.CLOTHING;
  const hasChanges = tempStatus !== currentStatus;

  // get allowed transitions
  const allowedStatuses = getAllowedTransitions(currentStatus);
  
  // define available status options based on allowed transitions
  const statusOptions = [OrderStatus.PENDING, OrderStatus.TO_BE_CLAIMED, OrderStatus.CLAIMED]
    .filter(status => allowedStatuses.includes(status) || status === currentStatus)
    .map(status => ({ value: status, label: STATUS_LABELS[status] }));

  const handleSave = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    await onStatusUpdate(tempStatus);
    setIsSaving(false);
  };

  const handleClose = () => {
    setTempStatus(currentStatus);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) {
      setTempStatus(currentStatus);
    }
  }, [isOpen, currentStatus]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8"
          >
            <div className="w-full max-w-sm sm:max-w-2xl bg-[#1E1E3F] border border-white/10 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="relative px-4 sm:px-6 py-4 sm:py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">
                    Order #{orderItem.orderId}
                  </p>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Manage Order Status
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="ml-2 shrink-0 w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {/* Image */}
                  <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-black/20 rounded-xl flex items-center justify-center p-2 overflow-hidden border border-white/5 mx-auto sm:mx-0">
                    <img
                      src={
                        orderItem.s3ImageKey
                          ? S3_BASE_URL + orderItem.s3ImageKey
                          : ""
                      }
                      alt={orderItem.merchName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs text-gray-400 mb-1">
                      CSPS Official • {orderItem.merchType}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-2">
                      {orderItem.merchName}
                    </h3>
                    <p className="text-xl sm:text-2xl font-bold text-white mb-3">
                      ₱{orderItem.totalPrice.toLocaleString()}
                    </p>

                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-gray-400">
                      <p>
                        Qty:{" "}
                        <span className="font-bold text-white">
                          {orderItem.quantity}
                        </span>
                      </p>
                      {isClothing && orderItem.size && (
                        <p>
                          Size:{" "}
                          <span className="font-bold text-white">
                            {orderItem.size}
                          </span>
                        </p>
                      )}
                      {isClothing && orderItem.color && (
                        <p>
                          Color:{" "}
                          <span className="font-bold text-white">
                            {orderItem.color}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Section */}
                <div className="bg-black/20 border border-white/5 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8">
                  <p className="text-xs text-gray-500 mb-2">CUSTOMER</p>
                  <p className="text-white font-bold text-sm sm:text-base">
                    {orderItem.studentName}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    {orderItem.studentId}
                  </p>
                </div>

                {/* Status Selection */}
                <div>
                  <p className="text-xs text-gray-500 mb-3">
                    {canEdit ? "SELECT STATUS" : "CURRENT STATUS"}
                  </p>
                  {statusOptions.length === 0 ? (
                    <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-center text-gray-400 text-sm">
                      This order is in a final state. No further transitions are allowed.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                      {statusOptions.map((option) => {
                        const { className } = getStatusDisplay(option.value);
                        const isSelected = tempStatus === option.value;
                        const isAllowed = allowedStatuses.includes(option.value) || option.value === currentStatus;

                        return (
                          <button
                            key={option.value}
                            onClick={() => canEdit && isAllowed && setTempStatus(option.value)}
                            disabled={!canEdit || !isAllowed}
                            className={`px-3 sm:px-4 py-3 sm:py-4 rounded-xl border transition-all text-xs sm:text-sm font-bold ${
                              isSelected
                                ? className
                                : !isAllowed
                                ? "bg-white/5 border-white/10 text-gray-600 cursor-not-allowed"
                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {orderItem.merchType === MerchType.TICKET && freebiePresets.length > 0 && (
                  <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Freebies
                      </p>
                      <p className="text-sm text-white/70">
                        Complete freebie details for legacy ticket orders.
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setShowFreebieModal(true)}
                          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                        >
                          Configure Freebies
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-white/5 flex justify-end items-center gap-2 sm:gap-3 bg-black/10 flex-wrap">
                <button
                  onClick={handleClose}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-gray-400 hover:text-white transition-colors"
                >
                  {canEdit ? "Cancel" : "Close"}
                </button>
                {canEdit && statusOptions.length > 0 && (
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={`px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                      hasChanges
                        ? "bg-[#FDE006] text-black hover:bg-gray-200"
                        : "bg-[#FDE006]/5 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          <FreebieSelectionModal
            open={showFreebieModal}
            onClose={() => setShowFreebieModal(false)}
            presets={freebiePresets}
            selection={freebieSelection}
            onSelect={(freebieMerchId, merchVariantItemId) =>
              setFreebieSelection((prev) => ({
                ...prev,
                [freebieMerchId]: merchVariantItemId,
              }))
            }
            onConfirm={handleUpdateFreebies}
          />

          {isUpdatingFreebies && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="rounded-xl border border-white/10 bg-[#171236] px-6 py-4 text-sm font-medium text-white/80">
                Updating freebies...
              </div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default StatusCardModal;
