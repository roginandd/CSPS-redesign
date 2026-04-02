import React, { useState } from "react";
import StatusCardModal from "./StatusCardModal";
import type { OrderItemResponse } from "../../../../../interfaces/order/OrderResponse";
import { S3_BASE_URL } from "../../../../../constant";
import { updateOrderItemStatus } from "../../../../../api/order";
import { OrderStatus } from "../../../../../enums/OrderStatus";
import { MerchType } from "../../../../../enums/MerchType";
import { AnimatePresence, motion } from "framer-motion";
import { usePermissions } from "../../../../../hooks/usePermissions";
import { getStatusDisplay } from "../../../../../utils/statusConfig";

interface StatusCardProps {
  orderItem: OrderItemResponse;
}

const StatusCard: React.FC<StatusCardProps> = ({ orderItem }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    orderItem.orderStatus as OrderStatus,
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const { canManageOrder } = usePermissions();

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      await updateOrderItemStatus(orderItem.orderItemId, newStatus);
      setCurrentStatus(newStatus);
      setModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const isClothing = orderItem.merchType === MerchType.CLOTHING;
  const ticketFreebies = orderItem.freebieAssignments || [];
  const { label, className } = getStatusDisplay(currentStatus);

  return (
    <>
      <div
        className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 bg-[#1E1E3F] p-4 sm:p-5 border border-white/10 rounded-xl ${
          canManageOrder
            ? "cursor-pointer hover:bg-[#252552] transition-colors"
            : ""
        }`}
        onClick={() => canManageOrder && setModalOpen(true)}
      >
        {/* Image Container */}
        <div className="shrink-0 w-full sm:w-24 sm:h-24 md:w-32 md:h-32 bg-black/20 rounded-lg flex items-center justify-center p-2 overflow-hidden border border-white/5">
          <img
            src={orderItem.s3ImageKey ? S3_BASE_URL + orderItem.s3ImageKey : ""}
            alt={orderItem.merchName}
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* Info Content */}
        <div className="flex flex-col flex-1 w-full py-1">
          <div className="flex flex-col sm:flex-row justify-between items-start w-full gap-2 sm:gap-0">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                {orderItem.merchType}
              </p>
              {/* BOLDED: Product Name */}
              <h3 className="text-lg font-bold text-white leading-tight">
                {orderItem.merchName}
              </h3>

              <div className="pt-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${className}`}
                >
                  {label}
                </span>
              </div>
            </div>

            {/* Price & Quantity */}
            <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-end mt-2 sm:mt-0">
              {/* BOLDED: Price */}
              <p className="text-lg font-bold text-white">
                ₱{orderItem.totalPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 font-medium">
                Qty:{" "}
                <span className="font-bold text-gray-300">
                  {orderItem.quantity}
                </span>
              </p>
            </div>
          </div>

          {/* Row Footer with Details */}
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-400">
            {isClothing && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-500 uppercase tracking-widest">Size</span>
                  <span className="font-bold text-white">
                    {orderItem.size || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-500 uppercase tracking-widest">Color</span>
                  <span className="font-bold text-white">
                    {orderItem.color || "N/A"}
                  </span>
                </div>
              </>
            )}
            {orderItem.design && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500 uppercase tracking-widest">Design</span>
                <span className="font-bold text-white">{orderItem.design}</span>
              </div>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <span className="font-bold text-gray-500 uppercase tracking-widest">Item ID</span>
              <span className="font-bold text-white">#{orderItem.orderItemId}</span>
            </div>
          </div>

          {orderItem.merchType === MerchType.TICKET && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Freebies
              </p>
              {ticketFreebies.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {ticketFreebies.map((freebie) => (
                    <div
                      key={freebie.ticketFreebieConfigId}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <p className="text-sm font-semibold text-white">
                        {freebie.freebieName}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300">
                        {freebie.category === "CLOTHING" ? (
                          <>
                            <span>Size: {freebie.selectedSize || "Pending details"}</span>
                            <span>Color: {freebie.selectedColor || "Pending details"}</span>
                          </>
                        ) : (
                          <span>Design: {freebie.selectedDesign || "Pending details"}</span>
                        )}
                        <span>
                          Status:{" "}
                          {(freebie.fulfillmentStatus || "PENDING_DETAILS")
                            .split("_")
                            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                            .join(" ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-400">No freebies</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-green-600 text-white rounded-lg px-4 py-2 shadow-lg text-sm font-bold">
              Status updated successfully
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StatusCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        orderItem={orderItem}
        currentStatus={currentStatus}
        onStatusUpdate={handleStatusUpdate}
        canEdit={canManageOrder}
      />
    </>
  );
};

export default StatusCard;
