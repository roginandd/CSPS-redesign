import { useEffect, useMemo, useState } from "react";
import AuthenticatedNav from "../../../components/AuthenticatedNav";
import { BiSolidCartAdd } from "react-icons/bi";
import Layout from "../../../components/Layout";
import DesktopCarousel from "./components/DesktopCarousel";
import MobileCarousel from "./components/MobileCarousel";
import { useParams, useNavigate } from "react-router-dom";
import type { MerchDetailedResponse } from "../../../interfaces/merch/MerchResponse";
import { getMerchById, getMerchVariantItemFreebies } from "../../../api/merch";
import { ClothingSizing } from "../../../enums/ClothingSizing";
import { MerchType } from "../../../enums/MerchType";
import type { CartItemRequest } from "../../../interfaces/cart/CartItemRequest";
import type { CartItemResponse } from "../../../interfaces/cart/CartItemResponse";
import { addCartItem } from "../../../api/cart";
import BuyNowModal from "./components/BuyNowModal";
import { toast } from "sonner";
import NotFoundPage from "../../notFound";
import { S3_BASE_URL } from "../../../constant";
import type { FreebieSelection } from "../../../interfaces/freebie/FreebieAssignment";
import type { EditableFreebieConfig } from "../../../hooks/useMerchForm";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];

const sortSizes = (sizes: string[]) =>
  [...sizes].sort((a, b) => {
    const aIndex = SIZE_ORDER.indexOf(a.toUpperCase());
    const bIndex = SIZE_ORDER.indexOf(b.toUpperCase());

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

const FreebieOptionGroup = ({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: string[];
  value?: string | null;
  onSelect: (value: string) => void;
}) => (
  <div className="space-y-3">
    <div className="flex items-end justify-between gap-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
        {label}
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-xl border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
              isActive
                ? "border-purple-500 bg-white/10 text-white"
                : "border-white/5 bg-transparent text-white/40 hover:border-white/20 hover:text-white"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

const Index = () => {
  const { merchId } = useParams<{ merchId: string }>();
  const navigate = useNavigate();

  const [merch, setMerch] = useState<MerchDetailedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [processingBuy, setProcessingBuy] = useState(false);
  const [loadingFreebies, setLoadingFreebies] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ClothingSizing | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [variantFreebies, setVariantFreebies] = useState<EditableFreebieConfig[]>(
    [],
  );
  const [freebieSelections, setFreebieSelections] = useState<
    Record<number, FreebieSelection>
  >({});

  const currentVariant = merch?.variants[activeIndex];
  const availableSizes = currentVariant?.items || [];
  const design = currentVariant?.design || "";
  const selectedDesignItem = currentVariant?.items?.[0] || null;
  const selectedSizeItem = selectedSize
    ? availableSizes.find((item) => item.size === selectedSize)
    : null;

  const currentPrice =
    selectedSizeItem?.price ||
    selectedDesignItem?.price ||
    merch?.basePrice ||
    0;
  const currentStock =
    selectedSizeItem?.stockQuantity || currentVariant?.stockQuantity || 0;
  const selectedMerchVariantItemId =
    selectedSizeItem?.merchVariantItemId ||
    selectedDesignItem?.merchVariantItemId ||
    null;
  const isTicket = merch?.merchType === MerchType.TICKET;
  const hasTicketFreebie =
    isTicket && merch?.hasFreebie === true && (merch.freebieConfigs?.length || 0) > 0;
  const isPurchaseBlocked = merch?.purchaseBlocked === true;
  const purchaseBlockMessage =
    merch?.purchaseBlockMessage || "Item is already in the cart / order";
  const hasFixedQuantity =
    merch?.merchType === MerchType.TICKET ||
    merch?.merchType === MerchType.MEMBERSHIP;

  const hasCompleteTicketFreebieSelection = useMemo(
    () =>
      variantFreebies.every((freebie) => {
        const selection = freebieSelections[freebie.ticketFreebieConfigId ?? -1];
        return freebie.category === "CLOTHING"
          ? !!selection?.selectedSize && !!selection?.selectedColor
          : !!selection?.selectedDesign;
      }),
    [freebieSelections, variantFreebies],
  );

  const isValidForPurchase =
    (merch?.merchType === "CLOTHING"
      ? !!selectedSize && !!currentVariant
      : !!currentVariant) &&
    hasCompleteTicketFreebieSelection;
  const merchVariantIds = merch?.variants.map((v) => v.merchVariantId) || [];

  const buildFreebieSelections = (): FreebieSelection[] =>
    variantFreebies.map((freebie) => {
      const selection = freebieSelections[freebie.ticketFreebieConfigId!];

      return freebie.category === "CLOTHING"
        ? {
            ticketFreebieConfigId: freebie.ticketFreebieConfigId,
            selectedSize: selection?.selectedSize || "",
            selectedColor: selection?.selectedColor || "",
          }
        : {
            ticketFreebieConfigId: freebie.ticketFreebieConfigId,
            selectedDesign: selection?.selectedDesign || "",
          };
    });

  const fetchMerch = async (id: number) => {
    setLoading(true);
    try {
      const response = await getMerchById(id);
      response.variants.forEach((variant) => {
        variant.items.sort((a, b) => {
          const order = Object.values(ClothingSizing);
          return (
            order.indexOf(a.size as ClothingSizing) -
            order.indexOf(b.size as ClothingSizing)
          );
        });
      });
      setMerch(response);
      setIsNotFound(false);
    } catch {
      setIsNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (merchId) {
      fetchMerch(Number(merchId));
    }
  }, [merchId]);

  useEffect(() => {
    setSelectedSize(null);
    setQuantity(1);
  }, [activeIndex, merchId]);

  useEffect(() => {
    setVariantFreebies([]);
    setFreebieSelections({});
  }, [merchId]);

  useEffect(() => {
    const loadVariantFreebies = async () => {
      if (!hasTicketFreebie || !selectedMerchVariantItemId) {
        setVariantFreebies([]);
        setFreebieSelections({});
        return;
      }

      try {
        setLoadingFreebies(true);
        const freebies = await getMerchVariantItemFreebies(selectedMerchVariantItemId);
        setVariantFreebies(freebies);
        setFreebieSelections(
          freebies.reduce<Record<number, FreebieSelection>>((acc, freebie) => {
            if (!freebie.ticketFreebieConfigId) {
              return acc;
            }

            acc[freebie.ticketFreebieConfigId] =
              freebie.category === "CLOTHING"
                ? {
                    ticketFreebieConfigId: freebie.ticketFreebieConfigId,
                    selectedSize: "",
                    selectedColor: "",
                  }
                : {
                    ticketFreebieConfigId: freebie.ticketFreebieConfigId,
                    selectedDesign: "",
                  };
            return acc;
          }, {}),
        );
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "We couldn't load the freebies for this ticket.";
        setVariantFreebies([]);
        setFreebieSelections({});
        toast.error(message);
      } finally {
        setLoadingFreebies(false);
      }
    };

    loadVariantFreebies();
  }, [hasTicketFreebie, selectedMerchVariantItemId]);

  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));
  const handleIncrement = () =>
    setQuantity((prev) => Math.min(currentStock, prev + 1));

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? 0 : parseInt(e.target.value);
    if (!isNaN(val)) {
      setQuantity(Math.min(Math.max(1, val), currentStock));
    }
  };

  const handleAddToCart = async (
    cartItem: CartItemRequest,
  ): Promise<CartItemResponse | null> => {
    setAddingToCart(true);
    try {
      const response = await addCartItem(cartItem);
      if (merchId) {
        await fetchMerch(Number(merchId));
      }
      toast.success(
        merch?.merchType === MerchType.TICKET
          ? "Ticket added to cart. You can update its freebies from the cart."
          : "Item added to cart.",
      );
      return response;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err.message || "Something went wrong";
      toast.error(errorMessage);
      return null;
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (isPurchaseBlocked) {
      toast.error(purchaseBlockMessage);
      return;
    }

    if (!isValidForPurchase) {
      if (!hasCompleteTicketFreebieSelection) {
        toast.error("Complete all ticket freebie selections before continuing.");
      } else {
        toast.error(
          merch?.merchType === "CLOTHING"
            ? "Please select a size"
            : "Please select a variant",
        );
      }
      return;
    }
    setShowBuyModal(true);
  };

  const handleConfirmBuy = async () => {
    if (!selectedMerchVariantItemId) {
      return;
    }

    if (isPurchaseBlocked) {
      toast.error(purchaseBlockMessage);
      return;
    }

    setProcessingBuy(true);
    try {
      const requestPayload: CartItemRequest = {
        merchVariantItemId: selectedMerchVariantItemId,
        quantity: hasFixedQuantity ? 1 : quantity,
        ...(hasTicketFreebie ? { freebieSelections: buildFreebieSelections() } : {}),
      };

      await handleAddToCart(requestPayload);
      setShowBuyModal(false);
      navigate("/merch/cart", { state: { selectedMerchVariantItemId } });
    } finally {
      setProcessingBuy(false);
    }
  };

  const getSlidePosition = (index: number) => {
    let diff = index - activeIndex;
    const len = merchVariantIds.length;
    if (len > 0) {
      diff = ((((diff + len / 2) % len) + len) % len) - Math.floor(len / 2);
    }
    return {
      translateY: diff * 120,
      scale: Math.max(0, 1.1 - Math.abs(diff) * 0.15),
      opacity: Math.max(0, 1 - Math.abs(diff) * 0.3),
      z: 20 - Math.abs(diff),
    };
  };

  if (isNotFound) {
    return <NotFoundPage />;
  }

  return (
    <Layout>
      <AuthenticatedNav />

      <div className="mx-auto max-w-[90rem] px-6 py-10 lg:py-16">
        <div className="flex flex-col items-start gap-12 lg:flex-row xl:gap-20">
          <div className="hidden shrink-0 lg:block">
            {loading ? (
              <div className="h-[500px] w-[180px] rounded-[2rem] border border-white/10 bg-[#242050]/50 animate-pulse" />
            ) : (
              <DesktopCarousel
                items={merchVariantIds}
                merchVariants={merch?.variants || []}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                getSlidePosition={getSlidePosition}
              />
            )}
          </div>

          <div className="group w-full flex-[1.5]">
            {loading ? (
              <div className="aspect-square rounded-[2rem] border border-white/10 bg-[#242050]/50 animate-pulse" />
            ) : (
              <div className="relative aspect-square overflow-hidden p-12 transition-all duration-500 hover:border-purple-500/30">
                <img
                  src={
                    currentVariant?.s3ImageKey &&
                    S3_BASE_URL + currentVariant.s3ImageKey
                  }
                  alt="Product Preview"
                  className="relative z-10 h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>
            )}

            <div className="mt-8 lg:hidden">
              {loading ? (
                <div className="h-20 rounded-[2rem] border border-white/10 bg-[#242050]/50 animate-pulse" />
              ) : (
                <MobileCarousel
                  merchVariants={merch?.variants || []}
                  items={merchVariantIds}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                />
              )}
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col gap-8">
            {loading ? (
              <div className="space-y-8">
                <div className="h-12 w-80 rounded-lg bg-white/10 animate-pulse" />
              </div>
            ) : (
              <>
                <header className="space-y-3">
                  <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase text-white/50">
                    CSPS Official • {merch?.merchType}
                  </div>
                  <h1 className="text-4xl font-bold text-white xl:text-5xl">
                    {merch?.merchName}
                  </h1>
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-bold text-white">
                      ₱{currentPrice.toFixed(2)}
                    </p>
                    <span
                      className={`rounded border px-2 py-0.5 text-xs font-bold ${
                        currentStock > 0
                          ? "border-green-500/20 bg-green-500/5 text-green-400"
                          : "border-red-500/20 bg-red-500/5 text-red-400"
                      }`}
                    >
                      {currentStock > 0 ? `${currentStock} IN STOCK` : "OUT OF STOCK"}
                    </span>
                  </div>
                </header>

                <div className="h-[1px] w-full bg-white/5" />

                <div className="space-y-8">
                  {isPurchaseBlocked && (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                      {purchaseBlockMessage}
                    </div>
                  )}

                  {hasTicketFreebie && (
                    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                            Select Freebies
                          </p>
                          <p className="mt-1 text-xs text-white/50">
                            Choose one option for each included freebie before purchase.
                          </p>
                        </div>
                       
                      </div>

                      {loadingFreebies ? (
                        <div className="space-y-3">
                          <div className="h-24 w-full rounded-2xl bg-white/5 animate-pulse" />
                          <div className="h-24 w-full rounded-2xl bg-white/5 animate-pulse" />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {variantFreebies.map((freebie) => {
                            const selection =
                              freebieSelections[freebie.ticketFreebieConfigId!];

                            return (
                              <div
                                key={freebie.ticketFreebieConfigId}
                                className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-5"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {freebie.freebieName}
                                  </p>
                                </div>

                                {freebie.category === "CLOTHING" ? (
                                  <div className="space-y-5">
                                    <FreebieOptionGroup
                                      label="Size"
                                      options={sortSizes(freebie.sizes || [])}
                                      value={selection?.selectedSize}
                                      onSelect={(selectedValue) =>
                                        setFreebieSelections((prev) => ({
                                          ...prev,
                                          [freebie.ticketFreebieConfigId!]: {
                                            ticketFreebieConfigId:
                                              freebie.ticketFreebieConfigId,
                                            selectedSize: selectedValue,
                                            selectedColor:
                                              prev[freebie.ticketFreebieConfigId!]
                                                ?.selectedColor || "",
                                          },
                                        }))
                                      }
                                    />
                                    <FreebieOptionGroup
                                      label="Color"
                                      options={freebie.colors || []}
                                      value={selection?.selectedColor}
                                      onSelect={(selectedValue) =>
                                        setFreebieSelections((prev) => ({
                                          ...prev,
                                          [freebie.ticketFreebieConfigId!]: {
                                            ticketFreebieConfigId:
                                              freebie.ticketFreebieConfigId,
                                            selectedSize:
                                              prev[freebie.ticketFreebieConfigId!]
                                                ?.selectedSize || "",
                                            selectedColor: selectedValue,
                                          },
                                        }))
                                      }
                                    />
                                  </div>
                                ) : (
                                  <FreebieOptionGroup
                                    label="Design"
                                    options={freebie.designs || []}
                                    value={selection?.selectedDesign}
                                    onSelect={(selectedValue) =>
                                      setFreebieSelections((prev) => ({
                                        ...prev,
                                        [freebie.ticketFreebieConfigId!]: {
                                          ticketFreebieConfigId:
                                            freebie.ticketFreebieConfigId,
                                          selectedDesign: selectedValue,
                                        },
                                      }))
                                    }
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {isTicket && merch?.hasFreebie === false && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/60">
                      No freebie included
                    </div>
                  )}

                  <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase text-white/40">
                       {merch?.merchType === "TICKET" || merch?.merchType === "MEMBERSHIP"
                       ? "Select" : "Select Style"}
                      </p>
                   
                    <div className="flex flex-wrap gap-2">
                      {merch?.variants.map((variant, idx) => (
                        <button
                          key={variant.merchVariantId}
                          onClick={() => setActiveIndex(idx)}
                          className={`rounded-xl border-2 px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                            activeIndex === idx
                              ? "border-purple-500 bg-white/10 text-white"
                              : "border-white/5 bg-transparent text-white/40 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {variant.color || variant.design}
                        </button>
                      ))}
                    </div>
                  </div>

                  {merch?.merchType === "CLOTHING" && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase text-white/40">
                        Choose Size
                      </p>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                        {availableSizes.map((sizeItem) => {
                          const isActive = selectedSize === sizeItem.size;
                          const isOutOfStock = sizeItem.stockQuantity === 0;
                          return (
                            <button
                              key={sizeItem.merchVariantItemId}
                              disabled={isOutOfStock}
                              onClick={() =>
                                setSelectedSize(sizeItem.size as ClothingSizing)
                              }
                              className={`h-11 rounded-xl border-2 text-sm font-bold transition-all ${
                                isActive
                                  ? "border-purple-500 bg-white/10 text-white"
                                  : isOutOfStock
                                    ? "cursor-not-allowed border-white/5 opacity-20 line-through"
                                    : "border-white/5 bg-white/5 text-white hover:border-white/20"
                              }`}
                            >
                              {sizeItem.size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!hasFixedQuantity && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase text-white/40">
                        Quantity
                      </p>
                      <div className="flex w-fit items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-1.5">
                        <button
                          onClick={handleDecrement}
                          className="flex h-10 w-10 items-center justify-center text-xl text-white/40 transition-colors hover:text-white"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={quantity}
                          onChange={handleQuantityChange}
                          className="w-8 border-none bg-transparent text-center text-lg font-bold outline-none"
                        />
                        <button
                          onClick={handleIncrement}
                          className="flex h-10 w-10 items-center justify-center text-xl text-white/40 transition-colors hover:text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                  <button
                    onClick={handleBuyNow}
                    disabled={
                      isPurchaseBlocked ||
                      !isValidForPurchase ||
                      currentStock === 0 ||
                      processingBuy ||
                      loadingFreebies
                    }
                    className="flex-[2] rounded-2xl bg-[#FDE006] py-5 font-bold text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:grayscale disabled:opacity-30"
                  >
                    {processingBuy ? "Processing..." : "Buy Now"}
                  </button>
                  <button
                    onClick={() => {
                      if (isPurchaseBlocked) {
                        toast.error(purchaseBlockMessage);
                        return;
                      }

                      if (!hasCompleteTicketFreebieSelection) {
                        toast.error(
                          "Complete all ticket freebie selections before adding this item.",
                        );
                        return;
                      }

                      handleAddToCart({
                        merchVariantItemId: selectedMerchVariantItemId!,
                        quantity: hasFixedQuantity ? 1 : quantity,
                        ...(hasTicketFreebie
                          ? { freebieSelections: buildFreebieSelections() }
                          : {}),
                      });
                    }}
                    disabled={
                      isPurchaseBlocked ||
                      addingToCart ||
                      !isValidForPurchase ||
                      currentStock === 0 ||
                      loadingFreebies
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-5 font-bold text-white transition-all hover:bg-white/10 active:scale-[0.98] disabled:grayscale disabled:opacity-30"
                  >
                    <BiSolidCartAdd className="text-2xl" />
                    {addingToCart ? "Adding..." : "Add"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <BuyNowModal
        open={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        onConfirm={handleConfirmBuy}
        merchName={merch?.merchName || ""}
        design={design}
        quantity={quantity}
        size={selectedSize}
        isProcessing={processingBuy}
        s3ImageKey={selectedDesignItem?.s3ImageKey || ""}
      />

      {addingToCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="rounded-2xl border border-white/10 bg-[#242050] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500/10 border-t-purple-500" />
            <p className="text-lg font-medium text-white">Adding to cart...</p>
          </div>
        </div>
      )}

      {processingBuy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="rounded-2xl border border-white/10 bg-[#242050] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500/10 border-t-purple-500" />
            <p className="text-lg font-medium text-white">
              Processing purchase...
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
