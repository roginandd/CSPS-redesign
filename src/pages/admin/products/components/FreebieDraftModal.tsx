import React, { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { MerchType } from "../../../../enums/MerchType";
import { ClothingSizing } from "../../../../enums/ClothingSizing";
import CustomDropdown from "../../../../components/CustomDropdown";
import type { FreebieDraft } from "../../../../hooks/useMerchForm";
import ClothingVariantCard from "./ClothingVariantCard";
import NonClothingVariantCard from "./NonClothingVariantCard";
import { validateFreebieDraft } from "../util/validation";

interface FreebieDraftModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (draft: FreebieDraft) => void;
  initialDraft?: FreebieDraft | null;
}

const buildEmptyDraft = (): FreebieDraft => ({
  merchName: "",
  description: "",
  merchType: MerchType.CLOTHING,
  basePrice: 0,
  merchImagePreview: "",
  merchImageFile: null,
  imageThumbnails: ["", "", "", ""],
  thumbnailFiles: [null, null, null, null],
  clothingVariants: [],
  nonClothingVariants: [],
});

const FreebieDraftModal: React.FC<FreebieDraftModalProps> = ({
  open,
  onClose,
  onSave,
  initialDraft,
}) => {
  const [draft, setDraft] = useState<FreebieDraft>(buildEmptyDraft());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(initialDraft ? initialDraft : buildEmptyDraft());
    setErrorMessage(null);
  }, [open, initialDraft]);

  const handleMerchImageUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDraft((prev) => ({
        ...prev,
        merchImagePreview: reader.result as string,
        merchImageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleVariantImageUpload = useCallback(
    (
      type: "clothing" | "nonClothing",
      variantIndex: number,
      imageIndex: number,
      file: File,
    ) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDraft((prev) => {
          if (type === "clothing") {
            const updated = [...prev.clothingVariants];
            if (imageIndex === 0) {
              updated[variantIndex] = {
                ...updated[variantIndex],
                imagePreview: reader.result as string,
                imageFile: file,
              };
            } else {
              updated[variantIndex].imageThumbnails[imageIndex] =
                reader.result as string;
              updated[variantIndex].thumbnailFiles[imageIndex] = file;
            }
            return { ...prev, clothingVariants: updated };
          }
          const updated = [...prev.nonClothingVariants];
          if (imageIndex === 0) {
            updated[variantIndex] = {
              ...updated[variantIndex],
              imagePreview: reader.result as string,
              imageFile: file,
            };
          } else {
            updated[variantIndex].imageThumbnails[imageIndex] =
              reader.result as string;
            updated[variantIndex].thumbnailFiles[imageIndex] = file;
          }
          return { ...prev, nonClothingVariants: updated };
        });
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleAddClothingVariant = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      clothingVariants: [
        ...prev.clothingVariants,
        {
          color: "",
          price: "",
          imagePreview: "",
          imageFile: null,
          imageThumbnails: ["", "", "", ""],
          thumbnailFiles: [null, null, null, null],
          sizeStock: Object.values(ClothingSizing).map((size) => ({
            size,
            stock: "",
            price: "",
            checked: false,
          })),
        },
      ],
    }));
  }, []);

  const handleAddNonClothingVariant = useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      nonClothingVariants: [
        ...prev.nonClothingVariants,
        {
          design: "",
          price: "",
          imagePreview: "",
          imageFile: null,
          imageThumbnails: ["", "", "", ""],
          thumbnailFiles: [null, null, null, null],
          stock: "",
        },
      ],
    }));
  }, []);

  const handleSave = () => {
    const validation = validateFreebieDraft(draft);
    if (!validation.isValid) {
      setErrorMessage(validation.message || "Complete the freebie details.");
      return;
    }
    setErrorMessage(null);
    onSave(draft);
    onClose();
  };

  if (!open) return null;

  const categoryOptions = [
    ...Object.entries(MerchType)
      .filter(([, value]) => value !== MerchType.TICKET && value !== MerchType.MEMBERSHIP)
      .map(([key, value]) => ({
        label: key.charAt(0) + key.slice(1).toLowerCase(),
        value,
      })),
  ];

  const inputClass =
    "w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none sm:text-base";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#171236] p-6 text-white"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">
                Freebie Item
              </p>
              <h2 className="text-lg font-semibold text-white">
                Configure Freebie Details
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Freebie merch is created as an internal hidden item.
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 mt-6">
            <div className="lg:col-span-5">
              <label className="relative flex min-h-[220px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/10 bg-[#1a1635]/80 hover:border-purple-500/35">
                <input type="file" accept="image/*" hidden onChange={handleMerchImageUpload} />
                {draft.merchImagePreview ? (
                  <>
                    <img
                      src={draft.merchImagePreview}
                      alt="Freebie preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-x-4 bottom-4 rounded-lg bg-[#110e31]/80 px-4 py-2 text-center text-sm font-medium">
                      Replace image
                    </div>
                  </>
                ) : (
                  <div className="text-center px-6">
                    <p className="text-sm font-semibold">Upload freebie image</p>
                    <p className="mt-2 text-xs text-white/60">
                      Required for internal merch records.
                    </p>
                  </div>
                )}
              </label>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-xl border border-white/10 bg-[#1a1635] px-4 py-3.5">
                <label className="block text-xs font-medium uppercase tracking-wide text-white/50 mb-2">
                  Freebie Name
                </label>
                <input
                  type="text"
                  value={draft.merchName}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, merchName: e.target.value }))
                  }
                  placeholder="e.g. CSPS Ticket Shirt"
                  className={`${inputClass} font-medium`}
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-[#1a1635] px-4 py-3.5">
                <label className="block text-xs font-medium uppercase tracking-wide text-white/50 mb-2">
                  Freebie Type
                </label>
                <CustomDropdown
                  options={categoryOptions}
                  value={draft.merchType}
                  onChange={(value) =>
                    setDraft((prev) => ({
                      ...prev,
                      merchType: value as MerchType,
                      clothingVariants: [],
                      nonClothingVariants: [],
                    }))
                  }
                  placeholder="Select a type..."
                  className="bg-transparent border-none !px-0 !py-0 ring-0 focus:ring-0"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-[#1a1635] px-4 py-3.5">
                <label className="block text-xs font-medium uppercase tracking-wide text-white/50 mb-2">
                  Base Price
                </label>
                <input
                  type="number"
                  value={draft.basePrice === 0 ? "" : draft.basePrice}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      basePrice: Number(e.target.value || 0),
                    }))
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`${inputClass} font-medium [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-[#1a1635] px-4 py-3.5">
                <label className="block text-xs font-medium uppercase tracking-wide text-white/50 mb-2">
                  Description
                </label>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      description: e.target.value.slice(0, 500),
                    }))
                  }
                  rows={3}
                  placeholder="Short internal description"
                  className={`${inputClass} min-h-[80px] resize-none`}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {draft.merchType === MerchType.CLOTHING && (
              <div className="space-y-4">
                {draft.clothingVariants.map((variant, index) => (
                  <ClothingVariantCard
                    key={`freebie-clothing-${index}`}
                    variant={variant}
                    variantIndex={index}
                    errors={{}}
                    actions={{
                      updateColor: (value) =>
                        setDraft((prev) => {
                          const updated = [...prev.clothingVariants];
                          updated[index] = { ...updated[index], color: value };
                          return { ...prev, clothingVariants: updated };
                        }),
                      updatePrice: (value) =>
                        setDraft((prev) => {
                          const updated = [...prev.clothingVariants];
                          updated[index] = {
                            ...updated[index],
                            price: value === "" ? "" : Number(value),
                          };
                          return { ...prev, clothingVariants: updated };
                        }),
                      uploadImage: (imageIndex, file) =>
                        handleVariantImageUpload("clothing", index, imageIndex, file),
                      toggleSize: (sizeIndex, checked) =>
                        setDraft((prev) => {
                          const updated = [...prev.clothingVariants];
                          updated[index].sizeStock[sizeIndex] = {
                            ...updated[index].sizeStock[sizeIndex],
                            checked,
                          };
                          return { ...prev, clothingVariants: updated };
                        }),
                      updateSizeStock: (sizeIndex, value) =>
                        setDraft((prev) => {
                          const updated = [...prev.clothingVariants];
                          updated[index].sizeStock[sizeIndex] = {
                            ...updated[index].sizeStock[sizeIndex],
                            stock: value === "" ? "" : Number(value),
                          };
                          return { ...prev, clothingVariants: updated };
                        }),
                      updateSizePrice: (sizeIndex, value) =>
                        setDraft((prev) => {
                          const updated = [...prev.clothingVariants];
                          updated[index].sizeStock[sizeIndex] = {
                            ...updated[index].sizeStock[sizeIndex],
                            price: value === "" ? "" : Number(value),
                          };
                          return { ...prev, clothingVariants: updated };
                        }),
                      remove: () =>
                        setDraft((prev) => ({
                          ...prev,
                          clothingVariants: prev.clothingVariants.filter(
                            (_, idx) => idx !== index,
                          ),
                        })),
                    }}
                  />
                ))}

                <button
                  type="button"
                  onClick={handleAddClothingVariant}
                  className="w-full rounded-lg border border-dashed border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-50 transition-colors hover:border-purple-400/45 hover:bg-purple-500/15 hover:text-white"
                >
                  Add color variant
                </button>
              </div>
            )}

            {draft.merchType !== MerchType.CLOTHING && (
              <div className="space-y-4">
                {draft.nonClothingVariants.map((variant, index) => (
                  <NonClothingVariantCard
                    key={`freebie-nonclothing-${index}`}
                    variant={variant}
                    variantIndex={index}
                    errors={{}}
                    actions={{
                      updateDesign: (value) =>
                        setDraft((prev) => {
                          const updated = [...prev.nonClothingVariants];
                          updated[index] = { ...updated[index], design: value };
                          return { ...prev, nonClothingVariants: updated };
                        }),
                      updatePrice: (value) =>
                        setDraft((prev) => {
                          const updated = [...prev.nonClothingVariants];
                          updated[index] = {
                            ...updated[index],
                            price: value === "" ? "" : Number(value),
                          };
                          return { ...prev, nonClothingVariants: updated };
                        }),
                      uploadImage: (imageIndex, file) =>
                        handleVariantImageUpload(
                          "nonClothing",
                          index,
                          imageIndex,
                          file,
                        ),
                      updateStock: (value) =>
                        setDraft((prev) => {
                          const updated = [...prev.nonClothingVariants];
                          updated[index] = {
                            ...updated[index],
                            stock: value === "" ? "" : Number(value),
                          };
                          return { ...prev, nonClothingVariants: updated };
                        }),
                      remove: () =>
                        setDraft((prev) => ({
                          ...prev,
                          nonClothingVariants: prev.nonClothingVariants.filter(
                            (_, idx) => idx !== index,
                          ),
                        })),
                    }}
                  />
                ))}

                <button
                  type="button"
                  onClick={handleAddNonClothingVariant}
                  className="w-full rounded-lg border border-dashed border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-50 transition-colors hover:border-purple-400/45 hover:bg-purple-500/15 hover:text-white"
                >
                  Add design variant
                </button>
              </div>
            )}
          </div>

          {errorMessage && (
            <p className="mt-4 text-sm font-medium text-red-400">
              {errorMessage}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-500"
            >
              Save Freebie
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FreebieDraftModal;
