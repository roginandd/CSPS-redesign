import { memo } from "react";
import SAMPLE from "../../../../assets/image 8.png";
import { FaCheck, FaMinus, FaPlus } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import type { CartItemResponse } from "../../../../interfaces/cart/CartItemResponse";
import { MerchType } from "../../../../enums/MerchType";
import { S3_BASE_URL } from "../../../../constant";

export type ProductCardProps = {
  cartItem: CartItemResponse;
  isSelected: boolean;
  onToggle: () => void;
  onRemove: (merchVariantItemId: number) => void;
  onQuantityChange?: (delta: number) => void;
  onEditFreebie?: () => void;
};

/**
 * ProductCard - Renders a single cart item with selection toggle and remove action.
 *
 * @param cartItem   - The cart item data to display
 * @param isSelected - Whether this item is currently selected for checkout
 * @param onToggle   - Callback to toggle the selection state
 * @param onRemove   - Callback to optimistically remove the item from the cart
 * @param onQuantityChange - Callback to increment or decrement item quantity
 */
const ProductCard = memo(
  ({
    cartItem,
    isSelected,
    onToggle,
    onRemove,
    onQuantityChange,
    onEditFreebie,
  }: ProductCardProps) => {
    const isClothing = cartItem.merchType === MerchType.CLOTHING;
    const hasFixedQuantity =
      cartItem.merchType === MerchType.TICKET ||
      cartItem.merchType === MerchType.MEMBERSHIP;
    const ticketFreebies = cartItem.freebieAssignments || [];
    const shouldShowFreebieSection =
      cartItem.merchType === MerchType.TICKET &&
      (ticketFreebies.length > 0 || cartItem.hasFreebie);

    return (
      <div className="flex items-center gap-6 group relative">
        {/* Premium Selection Toggle - Desktop */}
        <button
          onClick={onToggle}
          className={`hidden md:flex w-7 h-7 rounded-full border-2 transition-all duration-300 items-center justify-center shrink-0 
        ${
          isSelected
            ? "bg-[#FDE006] border-[#FDE006] shadow-[0_0_15px_rgba(253,224,6,0.3)]"
            : "bg-white/5 border-white/20 hover:border-white/40"
        }`}
        >
          {isSelected && <FaCheck className="w-3 h-3 text-black" />}
        </button>

        {/* Main Card Surface */}
        <div
          className={`flex-1 flex flex-col md:flex-row gap-6 bg-[#242050] border transition-all duration-500 p-5 rounded-[2.5rem] relative
        ${
          isSelected
            ? "border-purple-500/50 shadow-2xl shadow-purple-900/20"
            : "border-white/5 opacity-80 hover:opacity-100 hover:border-white/10"
        }`}
        >
          {/* Premium Selection Toggle - Mobile (inside card) */}
          <button
            onClick={onToggle}
            className={`md:hidden absolute top-4 right-4 w-7 h-7 rounded-full border-2 transition-all duration-300 flex items-center justify-center z-10 
        ${
          isSelected
            ? "bg-[#FDE006] border-[#FDE006] shadow-[0_0_15px_rgba(253,224,6,0.3)]"
            : "bg-white/5 border-white/20 hover:border-white/40"
        }`}
          >
            {isSelected && <FaCheck className="w-3 h-3 text-black" />}
          </button>
          {/* Product Image Container - Inspired by the eStore rounded image blocks */}
          <div className="shrink-0 aspect-square w-32 md:w-44 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-white/10 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent" />
            <img
              src={
                cartItem.s3ImageKey
                  ? `${S3_BASE_URL}${cartItem.s3ImageKey}`
                  : SAMPLE
              }
              alt={cartItem.merchName}
              className="w-full h-full object-contain relative  transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between flex-1 py-1">
            <div className="flex flex-col md:flex-row justify-between items-start gap-2">
              <div>
                <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">
                  {cartItem.merchType}
                </p>
                <h3 className="text-xl md:text-2xl font-bold text-white ">
                  {cartItem.merchName}
                </h3>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 items-center">
                  <div className="flex items-center gap-2 mr-2">
                    <p className="text-xs font-medium text-white/40 uppercase">Qty:</p>
                    {hasFixedQuantity ? (
                      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/90">
                        1
                      </div>
                    ) : (
                      <div className="flex items-center bg-white/5 rounded-lg overflow-hidden border border-white/10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuantityChange?.(-1);
                          }}
                          className="px-2.5 py-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <FaMinus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-sm font-semibold text-white/90 w-6 text-center select-none">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuantityChange?.(1);
                          }}
                          className="px-2.5 py-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <FaPlus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  {isClothing ? (
                    <>
                      <p className="text-xs font-medium text-white/40 uppercase mb-1">
                        Size:{" "}
                        <span className="text-white/80">
                          {cartItem.size || "N/A"}
                        </span>
                      </p>
                      <p className="text-xs font-medium text-white/40 uppercase mb-1">
                        Color:{" "}
                        <span className="text-white/80">{cartItem.color}</span>
                      </p>
                    </>
                  ) : (
                    <p className="text-xs font-medium text-white/40 uppercase mb-1">
                      Design:{" "}
                      <span className="text-white/80">
                        {cartItem.design || "Standard"}
                      </span>
                    </p>
                  )}
                </div>

                {shouldShowFreebieSection && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                          Freebies
                        </p>
                        {onEditFreebie && (
                          <button
                            type="button"
                            onClick={onEditFreebie}
                            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      {ticketFreebies.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {ticketFreebies.map((freebie) => (
                            <div
                              key={freebie.ticketFreebieConfigId}
                              className="rounded-lg border border-white/10 bg-[#171236] px-3 py-2"
                            >
                              <p className="text-sm font-semibold text-white/90">
                                {freebie.freebieName}
                              </p>
                              {freebie.category === "CLOTHING" ? (
                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
                                  <span>Size: {freebie.selectedSize || "Pending details"}</span>
                                  <span>Color: {freebie.selectedColor || "Pending details"}</span>
                                </div>
                              ) : (
                                <p className="mt-1 text-xs text-white/70">
                                  Design: {freebie.selectedDesign || "Pending details"}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-white/60">
                          Included freebies are attached to this ticket. Open Edit to review or update them.
                        </p>
                      )}
                    </div>
                  )}
              </div>

              {/* Individual Unit Price */}
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold text-white/20 uppercase mb-1">
                  Unit Price
                </p>
                <p className="text-sm font-semibold text-white/60">
                  ₱{cartItem.unitPrice.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Subtotal + Remove Button */}
            <div className="mt-4 md:mt-0 flex justify-between items-end border-t border-white/5 pt-4">
              <span className="text-[15px] font-bold text-white uppercase mb-1">
                Item Subtotal
              </span>
              <div className="flex items-center gap-4">
                <p className="text-xl md:text-2xl font-bold text-white">
                  ₱
                  {(cartItem.unitPrice * cartItem.quantity).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2 },
                  )}
                </p>
                {/* Remove Button */}
                <button
                  onClick={() => onRemove(cartItem.merchVariantItemId)}
                  className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                  aria-label="Remove item from cart"
                  title="Remove from cart"
                >
                  <FiTrash2 className="w-7 h-7" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default ProductCard;
