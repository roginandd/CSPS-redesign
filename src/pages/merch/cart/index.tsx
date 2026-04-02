import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AuthenticatedNav from "../../../components/AuthenticatedNav";
import Layout from "../../../components/Layout";
import ProductCard from "./components/ProductCard";
import OrderSummary from "./components/OrderSummary";
import EditFreebieModal from "./components/EditFreebieModal";
import {
  getCartItemFreebieSelection,
  getCart,
  updateCartItemQuantity,
  updateCartItemFreebieSelection,
} from "../../../api/cart";
import type { CartItemResponse } from "../../../interfaces/cart/CartItemResponse";
import type {
  CartItemFreebieSelectionResponse,
  FreebieSelection,
} from "../../../interfaces/freebie/FreebieAssignment";
import { toast } from "sonner";

const Index = () => {
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItemResponse | null>(null);
  const [editingFreebieData, setEditingFreebieData] =
    useState<CartItemFreebieSelectionResponse | null>(null);
  const [editingSelection, setEditingSelection] = useState<
    Record<number, FreebieSelection>
  >({});
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    const state = (location.state as any) || {};
    const id: number | undefined = state.selectedMerchVariantItemId;
    if (id) {
      setSelectedIds(new Set([id]));
    }
  }, [location.state]);

  const fetchCart = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const getCartResponse = await getCart();
      setItems(getCartResponse.items);
    } catch (err) {
      toast.error("We couldn't load your cart right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /**
   * Optimistically removes a cart item from the UI, then syncs with the server
   * in the background. If the server request fails, the item is restored to its
   * original position and a toast error is shown.
   */
  const handleRemoveItem = useCallback(
    (merchVariantItemId: number) => {
      // Snapshot current state for rollback on failure
      const previousItems = items;
      const previousSelectedIds = new Set(selectedIds);

      // Optimistic removal: instantly remove from UI
      setItems((prev) =>
        prev.filter((item) => item.merchVariantItemId !== merchVariantItemId),
      );
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(merchVariantItemId);
        return next;
      });

      // Fire-and-forget: sync with server in the background using PUT quantity=0
      updateCartItemQuantity(merchVariantItemId, 0).catch(() => {
        // Revert on failure: restore the item back to its position
        setItems(previousItems);
        setSelectedIds(previousSelectedIds);
        toast.error("We couldn't remove this item from your cart.");
      });
    },
    [items, selectedIds],
  );

  const handleQuantityChange = useCallback(
    (merchVariantItemId: number, currentQty: number, delta: number) => {
      const currentItem = items.find(
        (item) => item.merchVariantItemId === merchVariantItemId,
      );
      if (
        currentItem?.merchType === "TICKET" ||
        currentItem?.merchType === "MEMBERSHIP"
      ) {
        return;
      }

      const nextQuantity = currentQty + delta;
      
      if (nextQuantity <= 0) {
        handleRemoveItem(merchVariantItemId);
        return;
      }

      // Optimistic upate
      const previousItems = items;
      setItems((prev) => 
        prev.map((item) => 
          item.merchVariantItemId === merchVariantItemId 
            ? { ...item, quantity: nextQuantity } 
            : item
        )
      );

      // Fire-and-forget
      updateCartItemQuantity(merchVariantItemId, nextQuantity).catch(() => {
        setItems(previousItems);
        toast.error("We couldn't update the quantity.");
      });
    },
    [items, handleRemoveItem],
  );

  const handleOpenFreebieEditor = useCallback(async (item: CartItemResponse) => {
    setEditingItem(item);
    setEditLoading(true);
    setEditError(null);

    try {
      const freebieData = await getCartItemFreebieSelection(
        item.merchVariantItemId,
      );
      setEditingFreebieData(freebieData);
      setEditingSelection(
        freebieData.freebies.reduce<Record<number, FreebieSelection>>(
          (acc, freebie) => {
            acc[freebie.ticketFreebieConfigId] =
              freebie.category === "CLOTHING"
                ? {
                    ticketFreebieConfigId: freebie.ticketFreebieConfigId,
                    selectedSize: freebie.selectedSize || "",
                    selectedColor: freebie.selectedColor || "",
                  }
                : {
                    ticketFreebieConfigId: freebie.ticketFreebieConfigId,
                    selectedDesign: freebie.selectedDesign || "",
                  };
            return acc;
          },
          {},
        ),
      );
    } catch {
      setEditError("We couldn't load the freebie options for this ticket.");
      setEditingFreebieData(null);
    } finally {
      setEditLoading(false);
    }
  }, []);

  const handleCloseFreebieEditor = useCallback(() => {
    if (editSaving) return;
    setEditingItem(null);
    setEditingFreebieData(null);
    setEditingSelection({});
    setEditError(null);
  }, [editSaving]);

  const handleSaveFreebie = useCallback(async () => {
    if (!editingItem || !editingFreebieData) {
      return;
    }

    const payload = editingFreebieData.freebies.map((freebie) => {
      const selection = editingSelection[freebie.ticketFreebieConfigId];
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

    const isValidSelection = editingFreebieData.freebies.every((freebie) => {
      const selection = editingSelection[freebie.ticketFreebieConfigId];
      return freebie.category === "CLOTHING"
        ? !!selection?.selectedSize && !!selection?.selectedColor
        : !!selection?.selectedDesign;
    });

    if (!isValidSelection) {
      setEditError("Complete all freebie selections before saving.");
      return;
    }

    try {
      setEditSaving(true);
      setEditError(null);

      const updatedItem = await updateCartItemFreebieSelection(
        editingItem.merchVariantItemId,
        payload,
      );

      setItems((prev) =>
        prev.map((item) =>
          item.merchVariantItemId === editingItem.merchVariantItemId
            ? { ...item, ...updatedItem }
            : item,
        ),
      );

      toast.success("Freebie selection updated.");
      handleCloseFreebieEditor();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "We couldn't update the freebie selection.";
      setEditError(message);
      toast.error(message);
    } finally {
      setEditSaving(false);
    }
  }, [
    editingItem,
    editingFreebieData,
    editingSelection,
    handleCloseFreebieEditor,
  ]);

  const { selectedItems, totalSelectedPrice } = useMemo(() => {
    const selected = items.filter((item) =>
      selectedIds.has(item.merchVariantItemId),
    );
    const total = selected.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    return { selectedItems: selected, totalSelectedPrice: total };
  }, [items, selectedIds]);

  return (
    <Layout>
      <AuthenticatedNav />

      <div className="max-w-[90rem] mx-auto px-6 py-10 lg:py-16">
        {/* Page Header matching the inspiration hierarchy */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-white/40 mt-2 font-medium">
            {items.length} items in your bag
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* LEFT: Product List Area */}
          <div className="w-full lg:flex-[2] space-y-4">
            {loading ? (
              <div className="bg-[#242050]/50 border border-white/5 rounded-[2rem] py-24 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mb-4" />
                <p className="text-white font-medium">Loading your cart...</p>
              </div>
            ) : items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.merchVariantItemId}
                  className="transition-all duration-300"
                >
                  <ProductCard
                    cartItem={item}
                    isSelected={selectedIds.has(item.merchVariantItemId)}
                    onToggle={() => toggleSelect(item.merchVariantItemId)}
                    onRemove={handleRemoveItem}
                    onQuantityChange={(delta) => handleQuantityChange(item.merchVariantItemId, item.quantity, delta)}
                    onEditFreebie={
                      item.merchType === "TICKET" &&
                      (item.freebieAssignments?.length || 0) > 0
                        ? () => handleOpenFreebieEditor(item)
                        : item.hasFreebie
                        ? () => handleOpenFreebieEditor(item)
                        : undefined
                    }
                  />
                </div>
              ))
            ) : (
              <div className="bg-[#242050]/50 border border-white/5 rounded-[2rem] py-24 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Your cart is empty
                </h3>
                <p className="text-white/40 mt-2">
                  Looks like you haven't added anything yet.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Order Summary Sidebar (Sticky) */}
          <aside className="w-full lg:flex-1 lg:sticky lg:top-32">
            <OrderSummary
              items={selectedItems}
              totalPrice={totalSelectedPrice}
              onOrderSuccess={() => {
                fetchCart(true);
                setSelectedIds(new Set());
              }}
            />
          </aside>
        </div>
      </div>

      {/* Refreshing Modal */}
      {refreshing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-[#242050] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-12 h-12 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium text-lg">Refreshing cart...</p>
          </div>
        </div>
      )}

      <EditFreebieModal
        open={!!editingItem}
        merchName={editingItem?.merchName || ""}
        freebieData={editingFreebieData}
        selection={editingSelection}
        loading={editLoading}
        saving={editSaving}
        error={editError}
        onClose={handleCloseFreebieEditor}
        onSelectionChange={setEditingSelection}
        onSave={handleSaveFreebie}
      />
    </Layout>
  );
};

export default Index;
