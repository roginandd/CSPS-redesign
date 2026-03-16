import React, { type ChangeEvent } from "react";
import type { NonClothingVariantCardProps } from "./productForm.types";

const NonClothingVariantCard: React.FC<NonClothingVariantCardProps> = ({
  variant,
  variantIndex,
  errors = {},
  actions,
}) => {
  const handleImageUpload = (
    imageIndex: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      actions.uploadImage(imageIndex, file);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#140f33] px-3 py-2.5 text-sm text-white placeholder:text-white/35 transition-colors focus:border-purple-500/35 focus:outline-none";

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1635] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/45">
            Design Variant
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">
            Variant {variantIndex + 1}
          </h3>
        </div>
        <button
          onClick={actions.remove}
          className="rounded-lg border border-white/10 bg-[#140f33] px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
          aria-label="Delete variant"
          type="button"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/45">
            Design
          </label>
          <input
            type="text"
            value={variant.design}
            onChange={(e) => actions.updateDesign(e.target.value)}
            placeholder="e.g. Gold Logo, Holographic"
            className={`${inputClass} ${
              errors[`variant_${variantIndex}_design`] ? "border-red-500" : ""
            }`}
          />
          {errors[`variant_${variantIndex}_design`] && (
            <p className="mt-2 text-sm text-red-400">
              {errors[`variant_${variantIndex}_design`]}
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/45">
            Price
          </label>
          <input
            type="number"
            value={variant.price === "" ? "" : variant.price}
            onChange={(e) => actions.updatePrice(e.target.value)}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={`${inputClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
              errors[`variant_${variantIndex}_price`] ? "border-red-500" : ""
            }`}
          />
          {errors[`variant_${variantIndex}_price`] && (
            <p className="mt-2 text-sm text-red-400">
              {errors[`variant_${variantIndex}_price`]}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/45">
          Variant Image
        </label>
        <label className="relative flex min-h-[220px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/10 bg-[#140f33]/90 transition-colors hover:border-purple-500/35 hover:bg-[#211a47]">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(0, e)}
          />

          {variant.imagePreview ? (
            <>
              <img
                src={variant.imagePreview}
                alt={`Variant ${variantIndex + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-lg bg-[#110e31]/80 px-4 py-3 text-center text-sm font-medium text-white">
                Replace image
              </div>
            </>
          ) : (
            <div className="px-6 text-center">
              <p className="text-sm font-medium text-white">Upload image</p>
              <p className="mt-2 text-sm text-white/65">
                Add the main image for this design option.
              </p>
            </div>
          )}
        </label>
        {errors[`variant_${variantIndex}_image`] && (
          <p className="mt-2 text-sm text-red-400">
            {errors[`variant_${variantIndex}_image`]}
          </p>
        )}
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/45">
          Stock Quantity
        </label>
        <input
          type="number"
          value={variant.stock}
          onChange={(e) => actions.updateStock(e.target.value)}
          onWheel={(e) => e.currentTarget.blur()}
          placeholder="0"
          min="0"
          className={`${inputClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
            errors[`variant_${variantIndex}_stock`] ? "border-red-500" : ""
          }`}
        />
        {errors[`variant_${variantIndex}_stock`] && (
          <p className="mt-2 text-sm text-red-400">
            {errors[`variant_${variantIndex}_stock`]}
          </p>
        )}
      </div>
    </div>
  );
};

export default NonClothingVariantCard;
