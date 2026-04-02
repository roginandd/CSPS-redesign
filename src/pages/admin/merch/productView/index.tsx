import { useEffect, useState } from "react";
import AuthenticatedNav from "../../../../components/AuthenticatedNav";
import SAMPLE from "../../../../assets/image 8.png";
import Layout from "../../../../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import type { MerchVariantRequest } from "../../../../interfaces/merch_variant/MerchVariantRequest";
import type { MerchDetailedResponse } from "../../../../interfaces/merch/MerchResponse";
import {
  getMerchById,
  addVariantToMerch,
  deleteMerchVariant,
  updateMerch,
} from "../../../../api/merch";
import { toast } from "sonner";
import NotFoundPage from "../../../notFound";
import { S3_BASE_URL } from "../../../../constant";
import AddVariantModal from "./components/AddVariantModal";
import StockManagement from "./components/StockManagement";
import ConfirmationModal from "./components/ConfirmationModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import {
  updateItemStock,
  updateItemPrice,
  addItemToVariant,
  deleteItem,
} from "../../../../api/merch_variant_item";
import { ClothingSizing } from "../../../../enums/ClothingSizing";
import { FaTrash } from "react-icons/fa";
import { usePermissions } from "../../../../hooks/usePermissions";
import TicketFreebieEditor from "./components/TicketFreebieEditor";
import type { EditableFreebieConfig } from "../../../../hooks/useMerchForm";
import { validateMerchInfo } from "../../products/util/validation";

const AdminMerchProductView = () => {
  const { merchId } = useParams<{ merchId: string }>();
  const navigate = useNavigate();
  const { canManageMerch } = usePermissions();

  // Data state
  const [merch, setMerch] = useState<MerchDetailedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNotFound, setIsNotFound] = useState(false);

  // UI state
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  // Delete state
  const [showDeleteVariantModal, setShowDeleteVariantModal] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<number | null>(null);
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [ticketHasFreebies, setTicketHasFreebies] = useState(false);
  const [ticketFreebieConfigs, setTicketFreebieConfigs] = useState<
    EditableFreebieConfig[]
  >([]);
  const [freebieErrors, setFreebieErrors] = useState<Record<string, string>>({});
  const [isSubmittingFreebies, setIsSubmittingFreebies] = useState(false);
  const [pendingHasFreebieValue, setPendingHasFreebieValue] = useState<
    boolean | null
  >(null);

  // Edited stock state
  const [editedStocks, setEditedStocks] = useState<{
    [key: number]: { [key: string]: number };
  }>({});

  // Edited price state
  const [editedPrices, setEditedPrices] = useState<{
    [key: number]: { [key: string]: number };
  }>({});

  const currentVariant = merch?.variants[activeIndex];

  // ========== Helper Functions ==========
  const hasChanges = () => {
    if (!merch) return false;

    for (let variantIdx = 0; variantIdx < merch.variants.length; variantIdx++) {
      const stockMap = editedStocks[variantIdx] || {};
      const priceMap = editedPrices[variantIdx] || {};

      for (const item of merch.variants[variantIdx].items) {
        const key = item.size || item.merchVariantItemId.toString();
        const editedStock = stockMap[key];
        const editedPrice = priceMap[key];

        if (editedStock !== undefined && editedStock !== item.stockQuantity) {
          return true;
        }
        if (editedPrice !== undefined && editedPrice !== item.price) {
          return true;
        }
      }
    }

    const normalizedMerchFreebies = JSON.stringify({
      hasFreebie: merch.hasFreebie === true,
      freebieConfigs: (merch.freebieConfigs || [])
        .slice()
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    });
    const normalizedEditedFreebies = JSON.stringify({
      hasFreebie: ticketHasFreebies,
      freebieConfigs: ticketFreebieConfigs
        .slice()
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
    });

    return normalizedMerchFreebies !== normalizedEditedFreebies;
  };

  // ========== Data Fetching ==========
  const fetchMerch = async (id: number) => {
    setLoading(true);
    try {
      const response = await getMerchById(id);

      // Sort items by size order
      response.variants.forEach((variant) => {
        variant.items.sort((a, b) => {
          if (!a.size && !b.size) return 0;
          if (!a.size) return 1;
          if (!b.size) return -1;
          const order = Object.values(ClothingSizing);
          const aIndex = order.indexOf(a.size as ClothingSizing);
          const bIndex = order.indexOf(b.size as ClothingSizing);
          return aIndex - bIndex;
        });
      });

      setMerch(response);
      setIsNotFound(false);
      setActiveIndex(0);
      initializeEditedData(response);
      setTicketHasFreebies(response.hasFreebie === true);
      setTicketFreebieConfigs(
        (response.freebieConfigs || [])
          .slice()
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((config, index) => ({
            ...config,
            displayOrder: config.displayOrder ?? index,
            ...(config.category === "CLOTHING"
              ? {
                  sizes: config.sizes || [],
                  colors: config.colors || [],
                }
              : { designs: config.designs || [] }),
          })) as EditableFreebieConfig[],
      );
      setFreebieErrors({});
    } catch (err) {
      setIsNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const initializeEditedData = (merchData: MerchDetailedResponse) => {
    const stocks: { [key: number]: { [key: string]: number } } = {};
    const prices: { [key: number]: { [key: string]: number } } = {};
    merchData.variants.forEach((variant, variantIdx) => {
      const variantStocks: { [key: string]: number } = {};
      const variantPrices: { [key: string]: number } = {};
      variant.items.forEach((item) => {
        const key = item.size || item.merchVariantItemId.toString();
        variantStocks[key] = item.stockQuantity;
        variantPrices[key] = item.price;
      });
      stocks[variantIdx] = variantStocks;
      prices[variantIdx] = variantPrices;
    });
    setEditedStocks(stocks);
    setEditedPrices(prices);
  };

  useEffect(() => {
    if (merchId) {
      fetchMerch(Number(merchId));
    }
  }, [merchId]);

  // ========== Stock Management ==========
  const handleStockChange = (
    variantIdx: number,
    sizeOrId: string,
    quantity: number,
  ) => {
    setEditedStocks((prev) => {
      const newStocks = { ...prev };
      if (!newStocks[variantIdx]) {
        newStocks[variantIdx] = {};
      }
      newStocks[variantIdx][sizeOrId] = quantity;
      return newStocks;
    });
  };

  const handlePriceChange = (
    variantIdx: number,
    sizeOrId: string,
    price: number,
  ) => {
    setEditedPrices((prev) => {
      const newPrices = { ...prev };
      if (!newPrices[variantIdx]) {
        newPrices[variantIdx] = {};
      }
      newPrices[variantIdx][sizeOrId] = price;
      return newPrices;
    });
  };

  const handleAddVariant = async (data: {
    color?: string;
    design?: string;
    variantItems: { size?: string; stockQuantity: number; price: number }[];
    imageFile: File;
  }) => {
    if (!merchId) return;

    setIsAddingVariant(true);
    try {
      const variantRequest: MerchVariantRequest = {
        color: data.color,
        design: data.design,
        variantItems: data.variantItems as any,
        variantImage: data.imageFile,
      };

      await addVariantToMerch(Number(merchId), variantRequest);

      // Refetch the merch data to get updated state from backend
      await fetchMerch(Number(merchId));

      setShowAddVariantModal(false);
      toast.success("Variant added successfully!");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to add variant";
      toast.error(errorMessage);
    } finally {
      setIsAddingVariant(false);
    }
  };

  const handleAddSize = (variantIdx: number, size: string) => {
    if (merch) {
      const updatedMerch = { ...merch };
      const variant = updatedMerch.variants[variantIdx];

      // Create new item for this size
      const newItem = {
        merchVariantItemId: -1, // Negative ID to mark as new
        size,
        stockQuantity: 0,
        price: 0,
      };

      variant.items.push(newItem as any);

      // Sort items by size order
      variant.items.sort((a, b) => {
        if (!a.size && !b.size) return 0;
        if (!a.size) return 1;
        if (!b.size) return -1;
        const order = Object.values(ClothingSizing);
        const aIndex = order.indexOf(a.size as ClothingSizing);
        const bIndex = order.indexOf(b.size as ClothingSizing);
        return aIndex - bIndex;
      });

      variant.stockQuantity += 0;

      setMerch(updatedMerch);

      // Update stocks and prices
      const newStocks = { ...editedStocks };
      const newPrices = { ...editedPrices };
      const variantStocks = newStocks[variantIdx] || {};
      const variantPrices = newPrices[variantIdx] || {};
      variantStocks[size] = 0;
      variantPrices[size] = 0;
      newStocks[variantIdx] = variantStocks;
      newPrices[variantIdx] = variantPrices;
      setEditedStocks(newStocks);
      setEditedPrices(newPrices);

      toast.success(`Size ${size} added! Remember to save changes.`);
    }
  };

  const handleSaveChanges = () => {
    const freebieValidation = validateMerchInfo({
      merchName: merch?.merchName || "",
      description: merch?.description || "",
      merchType: merch?.merchType || "",
      basePrice: merch?.basePrice || 0,
      merchImageFile: {} as File,
      hasFreebie: ticketHasFreebies,
      freebieConfigs: ticketFreebieConfigs,
    } as any);

    if (!freebieValidation.isValid) {
      const freebieOnlyErrors = Object.fromEntries(
        Object.entries(freebieValidation.errors).filter(([key]) =>
          key.startsWith("freebieConfigs") || key === "hasFreebie",
        ),
      );

      if (Object.keys(freebieOnlyErrors).length > 0) {
        setFreebieErrors(freebieOnlyErrors);
        toast.error("Please fix the freebie configuration before saving.");
        return;
      }
    }

    setFreebieErrors({});

    if (!hasChanges()) {
      toast.info("No changes to save");
      return;
    }
    setShowConfirmationModal(true);
  };

  const validateFreebieConfigState = (
    nextHasFreebie: boolean,
    nextConfigs: EditableFreebieConfig[],
  ) => {
    const freebieValidation = validateMerchInfo({
      merchName: merch?.merchName || "",
      description: merch?.description || "",
      merchType: merch?.merchType || "",
      basePrice: merch?.basePrice || 0,
      merchImageFile: {} as File,
      hasFreebie: nextHasFreebie,
      freebieConfigs: nextConfigs,
    } as any);

    return Object.fromEntries(
      Object.entries(freebieValidation.errors).filter(([key]) =>
        key.startsWith("freebieConfigs") || key === "hasFreebie",
      ),
    );
  };

  const handleRequestFreebieConfirm = (nextHasFreebie: boolean) => {
    const errors = validateFreebieConfigState(nextHasFreebie, ticketFreebieConfigs);
    if (Object.keys(errors).length > 0) {
      setFreebieErrors(errors);
      toast.error("Complete the freebie fields before confirming.");
      return;
    }

    setFreebieErrors({});
    setPendingHasFreebieValue(nextHasFreebie);
  };

  const handleConfirmFreebieUpdate = async () => {
    if (pendingHasFreebieValue === null || !merchId || !merch) {
      return;
    }

    setIsSubmittingFreebies(true);
    try {
      await updateMerch(
        Number(merchId),
        {
          merchName: merch.merchName,
          description: merch.description,
          merchType: merch.merchType,
          hasFreebie: pendingHasFreebieValue,
          freebieConfigs: pendingHasFreebieValue ? ticketFreebieConfigs : [],
        },
        "patch",
      );

      setPendingHasFreebieValue(null);
      await fetchMerch(Number(merchId));
      toast.success("Freebie configuration updated.");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to update freebies";
      toast.error(errorMessage);
    } finally {
      setIsSubmittingFreebies(false);
    }
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    setShowConfirmationModal(false);
    try {
      if (merchId && merch) {
        await updateMerch(
          Number(merchId),
          {
            merchName: merch.merchName,
            description: merch.description,
            merchType: merch.merchType,
            hasFreebie: ticketHasFreebies,
            freebieConfigs: ticketFreebieConfigs,
          },
          "put",
        );
      }

      // Update stocks and prices via API
      const updatePromises: Promise<any>[] = [];
      const addPromises: Promise<any>[] = [];

      Object.entries(editedStocks).forEach(([variantIdxStr, stockMap]) => {
        const variantIdx = Number(variantIdxStr);
        const priceMap = editedPrices[variantIdx] || {};

        Object.entries(stockMap).forEach(([sizeOrId, quantity]) => {
          const item = merch!.variants[variantIdx].items.find(
            (i) =>
              i.size === sizeOrId ||
              i.merchVariantItemId.toString() === sizeOrId,
          );
          if (item) {
            const originalStock = item.stockQuantity;
            const originalPrice = item.price;
            const newPrice = priceMap[sizeOrId];

            if (item.merchVariantItemId === -1) {
              // New item, add it
              const variant = merch!.variants[variantIdx];
              const addItem = {
                size: item.size as any,
                stockQuantity: quantity,
                price: newPrice !== undefined ? newPrice : item.price,
              };
              addPromises.push(
                addItemToVariant(variant.merchVariantId, addItem),
              );
            } else {
              // Existing item, update
              if (quantity !== originalStock) {
                updatePromises.push(
                  updateItemStock(item.merchVariantItemId, quantity),
                );
              }
              if (newPrice !== undefined && newPrice !== originalPrice) {
                updatePromises.push(
                  updateItemPrice(item.merchVariantItemId, newPrice),
                );
              }
            }
          }
        });
      });

      await Promise.all([...updatePromises, ...addPromises]);

      // Refetch to get updated data
      await fetchMerch(Number(merchId));

      toast.success("Changes saved successfully!");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to save changes";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ========== Delete Handlers ==========
  const handleDeleteVariantClick = (e: React.MouseEvent, variantId: number) => {
    e.stopPropagation(); // Prevent selecting the variant
    setVariantToDelete(variantId);
    setShowDeleteVariantModal(true);
  };

  const handleConfirmDeleteVariant = async () => {
    if (!variantToDelete || !merchId) return;

    setIsDeletingVariant(true);
    try {
      await deleteMerchVariant(variantToDelete);
      toast.success("Variant deleted successfully!");
      setShowDeleteVariantModal(false);
      setVariantToDelete(null);

      // Refetch merch data
      await fetchMerch(Number(merchId));
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to delete variant";
      toast.error(errorMessage);
    } finally {
      setIsDeletingVariant(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (isDeletingItem) return;

    setIsDeletingItem(true);
    try {
      await deleteItem(itemId);
      toast.success("Item deleted successfully!");

      // Refetch merch data
      await fetchMerch(Number(merchId));
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to delete item";
      toast.error(errorMessage);
    } finally {
      setIsDeletingItem(false);
    }
  };
  const SkeletonLoader = () => (
    <Layout>
      <AuthenticatedNav />

      <div className="mb-8">
        <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left - Variant List Skeleton */}
        <div className="flex-1">
          <div className="flex flex-col gap-4">
            <div className="h-6 bg-white/10 rounded w-24 mb-4 animate-pulse" />
            <div className="space-y-3 max-h-[600px]">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full p-4 rounded-lg border border-white/10 bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
                      <div className="h-3 bg-white/10 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-12 bg-white/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Center - Image Skeleton */}
        <div className="flex-[2] flex items-center justify-center">
          <div className="w-full max-w-[350px] h-[400px] bg-white/10 rounded-lg animate-pulse" />
        </div>

        {/* Right - Info Skeleton */}
        <div className="flex flex-col gap-6 flex-1">
          {/* Header */}
          <div className="space-y-3">
            <div className="h-8 bg-white/10 rounded w-48 animate-pulse" />
            <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
            <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
          </div>

          {/* Stock Management Skeleton */}
          <div className="space-y-4 border-t border-white/10 pt-4">
            <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
                <div className="h-10 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <div className="flex-1 h-12 bg-white/10 rounded animate-pulse" />
            <div className="flex-1 h-12 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </Layout>
  );

  if (loading) {
    return <SkeletonLoader />;
  }
  // ========== Render Guards ==========
  if (isNotFound) {
    return <NotFoundPage />;
  }

  if (!merch) {
    return null;
  }

  // ========== Main Render ==========
  return (
    <Layout>
      <AuthenticatedNav />

        <div className="mb-8">
          <button
            onClick={() => navigate("/admin/merch/products")}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Merch
          </button>
        </div>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_minmax(0,28rem)] xl:items-start">
          {/* Left - Variant List */}
          <div className="min-w-0">
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white mb-4">Variants</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {merch.variants.map((variant, idx) => (
                  <button
                    key={variant.merchVariantId}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      activeIndex === idx
                        ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20"
                        : "border-white/10 hover:border-purple-400 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          variant.s3ImageKey
                            ? S3_BASE_URL + variant.s3ImageKey
                            : SAMPLE
                        }
                        alt="variant"
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {variant.color ||
                            variant.design ||
                            `Variant ${idx + 1}`}
                        </p>
                        <p className="text-sm text-gray-400">
                          {variant.items.length}{" "}
                          {merch.merchType === "CLOTHING" ? "sizes" : "items"}
                        </p>
                      </div>
                      {canManageMerch && (
                        <button
                          onClick={(e) =>
                            handleDeleteVariantClick(e, variant.merchVariantId)
                          }
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
                          title="Delete variant"
                        >
                          <FaTrash size={14} />
                        </button>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {canManageMerch && (
                <button
                  onClick={() => setShowAddVariantModal(true)}
                  className="w-full mt-4 py-3 px-4 bg-[#341677] hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                >
                  + Add Variant
                </button>
              )}
            </div>
          </div>

          {/* Center - Main Image */}
          <div className="min-w-0">
            <div className="flex flex-col items-center justify-center">
            <img
              src={
                currentVariant?.s3ImageKey
                  ? S3_BASE_URL + currentVariant.s3ImageKey
                  : SAMPLE
              }
              alt="Preview"
              className="w-full max-w-[350px] h-full max-h-[400px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
            />
            </div>
          </div>

          {/* Right - Product Info & Stock Management */}
          <div className="flex min-w-0 flex-col gap-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold tracking-widest">
                {merch.merchName}
              </h1>
              <p className="text-lg text-purple-200 mt-2">
                ₱ {merch.basePrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Type: {merch.merchType}
              </p>
            </div>

            {/* Stock Management */}
            {currentVariant && (
              <StockManagement
                variant={currentVariant}
                variantIndex={activeIndex}
                editedStocks={editedStocks}
                editedPrices={editedPrices}
                onStockChange={handleStockChange}
                onPriceChange={handlePriceChange}
                onAddSize={handleAddSize}
                onDeleteItem={handleDeleteItem}
                isClothing={merch.merchType === "CLOTHING"}
                canEdit={canManageMerch}
              />
            )}

            {merch.merchType === "TICKET" && canManageMerch && (
              <TicketFreebieEditor
                hasFreebie={ticketHasFreebies}
                freebieConfigs={ticketFreebieConfigs}
                errors={freebieErrors}
                isSubmitting={isSubmittingFreebies}
                onRequestConfirm={handleRequestFreebieConfirm}
                onAddFreebie={() =>
                  setTicketFreebieConfigs((prev) => [
                    ...prev,
                    {
                      displayOrder: prev.length,
                      category: "CLOTHING",
                      freebieName: "",
                      clothingSubtype: undefined,
                      sizes: [],
                      colors: [],
                    },
                  ])
                }
                onRemoveFreebie={(index) =>
                  setTicketFreebieConfigs((prev) =>
                    prev
                      .filter((_, configIndex) => configIndex !== index)
                      .map((config, configIndex) => ({
                        ...config,
                        displayOrder: configIndex,
                      })),
                  )
                }
                onUpdateFreebie={(index, patch) =>
                  setTicketFreebieConfigs((prev) =>
                    prev.map((config, configIndex) => {
                      if (configIndex !== index) {
                        return config;
                      }

                      if (patch.category && patch.category !== config.category) {
                        return patch.category === "CLOTHING"
                          ? {
                              ticketFreebieConfigId: config.ticketFreebieConfigId,
                              displayOrder: index,
                              category: "CLOTHING",
                              freebieName: patch.freebieName ?? config.freebieName,
                              clothingSubtype: undefined,
                              sizes: [],
                              colors: [],
                            }
                          : {
                              ticketFreebieConfigId: config.ticketFreebieConfigId,
                              displayOrder: index,
                              category: "NON_CLOTHING",
                              freebieName: patch.freebieName ?? config.freebieName,
                              designs: [],
                            };
                      }

                      return {
                        ...config,
                        ...patch,
                        displayOrder: index,
                      } as EditableFreebieConfig;
                    }),
                  )
                }
              />
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              {canManageMerch ? (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving || !hasChanges()}
                    className={`flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all ${
                      isSaving || !hasChanges()
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    onClick={() => setActiveIndex(0)}
                    className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Reset View
                  </button>
                </>
              ) : (
                <div className="w-full text-center py-3 px-4 bg-gray-700/50 text-gray-400 rounded-lg">
                  Read-only mode - You don't have permission to edit
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Variant Modal */}
        <AddVariantModal
          open={showAddVariantModal}
          onClose={() => setShowAddVariantModal(false)}
          onConfirm={handleAddVariant}
          merchType={merch.merchType}
          isAddingVariant={isAddingVariant}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          open={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmSave}
          isSaving={isSaving}
          editedStocks={editedStocks}
          editedPrices={editedPrices}
          merch={merch!}
        />

        {/* Delete Variant Confirmation Modal */}
        <DeleteConfirmationModal
          open={showDeleteVariantModal}
          onClose={() => {
            setShowDeleteVariantModal(false);
            setVariantToDelete(null);
          }}
          onConfirm={handleConfirmDeleteVariant}
          isDeleting={isDeletingVariant}
          title="Delete Variant"
          message="Are you sure you want to delete this variant?"
          warningMessage="This will permanently delete the variant and all its items."
        />

        {pendingHasFreebieValue !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#110e31] p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
                Add Freebie
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Confirm freebie setup
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                {pendingHasFreebieValue
                  ? "This ticket will allow freebie configuration after confirmation."
                  : "This will disable freebies for this ticket and clear the current freebie blocks."}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPendingHasFreebieValue(null)}
                  disabled={isSubmittingFreebies}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmFreebieUpdate}
                  disabled={isSubmittingFreebies}
                  className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingFreebies ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        {isSubmittingFreebies && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#110e31] p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500/10 border-t-purple-500" />
              <p className="text-lg font-semibold text-white">Adding freebie</p>
              <p className="mt-2 text-sm text-white/60">
                Saving the ticket freebie configuration.
              </p>
            </div>
          </div>
        )}
      </Layout>
  );
};

export default AdminMerchProductView;
