import { memo } from "react";
import type { OrderResponse } from "../../../../interfaces/order/OrderResponse";
import { MerchType } from "../../../../enums/MerchType";
import { OrderStatus } from "../../../../enums/OrderStatus";
import { S3_BASE_URL } from "../../../../constant";
import SAMPLE from "../../../../assets/image 8.png";
import { getStatusDisplay } from "../../../../utils/statusConfig";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const { label, className } = getStatusDisplay(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${className}`}
    >
      {label}
    </span>
  );
};

interface PurchaseCardProps {
  purchase: OrderResponse;
}

const PurchaseCard = memo(({ purchase }: PurchaseCardProps) => {
  return (
    <div className="space-y-4">
      {purchase.orderItems.map((item, index) => {
        const isClothing = item.merchType === MerchType.CLOTHING;
        const ticketFreebies = item.freebieAssignments || [];

        return (
          <div
            key={`${purchase.orderId}-${index}`}
            className="group relative bg-[#1E1E3F] border border-zinc-800 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-purple-900/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex flex-col sm:flex-row p-5 gap-6">
              <div className="relative shrink-0 w-full sm:w-32 aspect-square bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
                <img
                  src={item.s3ImageKey ? S3_BASE_URL + item.s3ImageKey : SAMPLE}
                  alt={item.merchName}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-lg pointer-events-none" />
              </div>

              <div className="flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={purchase.orderStatus as OrderStatus} />
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        #{purchase.orderId}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-purple-400 transition-colors duration-200">
                      {item.merchName}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      Ordered on {formatDate(purchase.orderDate)}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                    <span className="text-lg font-bold text-white tracking-tight">
                      {formatCurrency(item.totalPrice)}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      Qty: <span className="text-zinc-300">{item.quantity}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/50 flex flex-wrap gap-x-6 gap-y-2 mt-auto">
                  {isClothing && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">
                          Size
                        </span>
                        <span className="text-xs font-semibold text-zinc-300 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">
                          {item.size || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">
                          Color
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-zinc-700 ring-1 ring-zinc-600" />
                          <span className="text-xs font-semibold text-zinc-300">
                            {item.color || "N/A"}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-600">
                      Type
                    </span>
                    <span className="text-xs font-medium text-zinc-400">
                      {item.merchType}
                    </span>
                  </div>
                </div>

                {item.merchType === MerchType.TICKET && ticketFreebies.length > 0 && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                      Freebies
                    </p>
                    <div className="mt-2 space-y-3">
                      {ticketFreebies.map((freebie) => (
                        <div key={freebie.ticketFreebieConfigId} className="text-xs text-zinc-400">
                          <p className="text-sm font-semibold text-zinc-200">
                            {freebie.freebieName}
                          </p>
                          {freebie.category === "CLOTHING" ? (
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                              <span>Size: {freebie.selectedSize || "Pending details"}</span>
                              <span>Color: {freebie.selectedColor || "Pending details"}</span>
                              <span>
                                Status:{" "}
                                {(freebie.fulfillmentStatus || "PENDING_DETAILS")
                                  .split("_")
                                  .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                                  .join(" ")}
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                              <span>Design: {freebie.selectedDesign || "Pending details"}</span>
                              <span>
                                Status:{" "}
                                {(freebie.fulfillmentStatus || "PENDING_DETAILS")
                                  .split("_")
                                  .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                                  .join(" ")}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

PurchaseCard.displayName = "PurchaseCard";

export { PurchaseCard };
