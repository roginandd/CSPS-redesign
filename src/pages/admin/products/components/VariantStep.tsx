import React from "react";
import { MerchType } from "../../../../enums/MerchType";
import type {
  ClothingVariant,
  NonClothingVariant,
} from "../../../../hooks/useMerchForm";
import ClothingVariantCard from "./ClothingVariantCard";
import NonClothingVariantCard from "./NonClothingVariantCard";
import type { VariantStepProps } from "./productForm.types";

const VariantStep: React.FC<VariantStepProps> = ({
  formState,
  errors = {},
  isLoading = false,
  actions,
}) => {
  const canSubmit =
    (formState.merchType === MerchType.CLOTHING &&
      formState.clothingVariants.length > 0) ||
    (formState.merchType !== MerchType.CLOTHING &&
      formState.merchType !== "" &&
      formState.nonClothingVariants.length > 0);

  const variantCount =
    formState.merchType === MerchType.CLOTHING
      ? formState.clothingVariants.length
      : formState.nonClothingVariants.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Variants</h3>
          <p className="mt-1 text-sm text-white/65">
            {variantCount === 0
              ? "Add at least one variant to continue."
              : `${variantCount} variant${variantCount > 1 ? "s" : ""} configured`}
          </p>
        </div>
        {variantCount > 0 && (
          <span className="inline-flex rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-purple-100">
            {variantCount} configured
          </span>
        )}
      </div>

      {errors.variants && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4">
          <p className="text-sm text-red-300">{errors.variants}</p>
        </div>
      )}

      {formState.merchType === MerchType.CLOTHING && (
        <div className="space-y-4">
          {formState.clothingVariants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-[#1a1635]/80 px-6 py-10 text-center">
              <p className="text-sm font-medium text-white">No variants yet</p>
              <p className="mt-2 text-sm text-white/65">
                Add a color variant to start managing stock and pricing.
              </p>
            </div>
          ) : (
            formState.clothingVariants.map(
              (variant: ClothingVariant, variantIndex: number) => (
                <ClothingVariantCard
                  key={variantIndex}
                  variant={variant}
                  variantIndex={variantIndex}
                  errors={errors}
                  actions={{
                    updateColor: (value) =>
                      actions.updateClothingVariant(
                        variantIndex,
                        "color",
                        value,
                      ),
                    updatePrice: (value) =>
                      actions.updateClothingVariant(
                        variantIndex,
                        "price",
                        value,
                      ),
                    uploadImage: (imageIndex, file) =>
                      actions.uploadVariantImage(
                        "clothing",
                        variantIndex,
                        imageIndex,
                        file,
                      ),
                    toggleSize: (sizeIndex, checked) =>
                      actions.toggleSize(variantIndex, sizeIndex, checked),
                    updateSizeStock: (sizeIndex, value) =>
                      actions.updateSizeStock(variantIndex, sizeIndex, value),
                    updateSizePrice: (sizeIndex, value) =>
                      actions.updateSizePrice?.(variantIndex, sizeIndex, value),
                    remove: () => actions.removeClothingVariant(variantIndex),
                  }}
                />
              ),
            )
          )}

          <button
            onClick={actions.addClothingVariant}
            className="w-full rounded-lg border border-dashed border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-50 transition-colors hover:border-purple-400/45 hover:bg-purple-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#110e31]"
            type="button"
          >
            Add color variant
          </button>
        </div>
      )}

      {formState.merchType !== MerchType.CLOTHING &&
        formState.merchType !== "" && (
          <div className="space-y-4">
            {formState.nonClothingVariants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-[#1a1635]/80 px-6 py-10 text-center">
                <p className="text-sm font-medium text-white">No variants yet</p>
                <p className="mt-2 text-sm text-white/65">
                  Add a design variant to start managing stock and pricing.
                </p>
              </div>
            ) : (
              formState.nonClothingVariants.map(
                (variant: NonClothingVariant, variantIndex: number) => (
                  <NonClothingVariantCard
                    key={variantIndex}
                    variant={variant}
                    variantIndex={variantIndex}
                    errors={errors}
                    actions={{
                      updateDesign: (value) =>
                        actions.updateNonClothingVariant(
                          variantIndex,
                          "design",
                          value,
                        ),
                      updatePrice: (value) =>
                        actions.updateNonClothingVariant(
                          variantIndex,
                          "price",
                          value,
                        ),
                      uploadImage: (imageIndex, file) =>
                        actions.uploadVariantImage(
                          "nonClothing",
                          variantIndex,
                          imageIndex,
                          file,
                        ),
                      updateStock: (value) =>
                        actions.updateNonClothingVariant(
                          variantIndex,
                          "stock",
                          value,
                        ),
                      remove: () =>
                        actions.removeNonClothingVariant(variantIndex),
                    }}
                  />
                ),
              )
            )}

            <button
              onClick={actions.addNonClothingVariant}
              className="w-full rounded-lg border border-dashed border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-50 transition-colors hover:border-purple-400/45 hover:bg-purple-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#110e31]"
              type="button"
            >
              Add design variant
            </button>
          </div>
        )}

      {!formState.merchType && (
        <div className="rounded-xl border border-dashed border-white/10 bg-[#1a1635]/80 px-6 py-10 text-center">
          <p className="text-sm font-medium text-white">No category selected</p>
          <p className="mt-2 text-sm text-white/65">
            Please go back and select a category to add variants.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
        <button
          onClick={actions.goBack}
          disabled={isLoading}
          className="rounded-lg border border-white/10 bg-[#1a1635] px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/15 hover:bg-[#241d49] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          Back
        </button>
        <button
          onClick={actions.submit}
          disabled={!canSubmit || isLoading}
          className="sm:min-w-[180px] rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-purple-900/30 transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:bg-purple-500/50"
          type="button"
        >
          {isLoading ? "Creating product..." : "Create Product"}
        </button>
      </div>
    </div>
  );
};

export default VariantStep;
