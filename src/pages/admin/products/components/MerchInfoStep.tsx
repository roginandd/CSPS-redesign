import React, { type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CustomDropdown from "../../../../components/CustomDropdown";
import { MerchType } from "../../../../enums/MerchType";
import type { MerchInfoStepProps } from "./productForm.types";

const InputBlock = ({
  label,
  error,
  children,
  className = "",
  rightElement,
  noPadding = false,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  rightElement?: React.ReactNode;
  noPadding?: boolean;
}) => (
  <div className={`group relative ${className}`}>
    <div
      className={`relative w-full rounded-xl border bg-[#1a1635] transition-colors ${
        error
          ? "border-red-500/60 bg-red-500/5"
          : "border-white/10 focus-within:border-purple-500/35"
      } ${noPadding ? "p-1.5" : "px-4 py-3.5"}`}
    >
      <div
        className={`flex items-center justify-between gap-3 ${
          noPadding ? "px-3.5 pt-2.5" : "mb-2"
        }`}
      >
        <label className="block text-xs font-medium uppercase tracking-wide text-white/50 transition-colors group-focus-within:text-purple-200">
          {label}
        </label>
        {rightElement}
      </div>
      <div className={`relative flex items-center ${noPadding ? "pt-1" : ""}`}>
        {children}
      </div>
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -bottom-6 left-2 text-xs font-medium text-red-400"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const MerchInfoStep: React.FC<MerchInfoStepProps> = ({
  formState,
  errors = {},
  actions,
}) => {
  const handleImageUpload = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      actions.uploadMerchImage(index, file);
    }
  };

  const categoryOptions = [
    { label: "Select a category...", value: "" },
    ...Object.entries(MerchType).map(([key, value]) => ({
      label: key.charAt(0) + key.slice(1).toLowerCase(),
      value,
    })),
  ];

  const isClothing = formState.merchType === MerchType.CLOTHING;
  const inputClass =
    "w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none sm:text-base";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="flex flex-col lg:col-span-5">
        <label
          className={`relative flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors ${
            errors.merchImage
              ? "border-red-500/50 bg-red-500/5"
              : "border-white/10 bg-[#1a1635]/80 hover:border-purple-500/35 hover:bg-[#241d49]/90"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleImageUpload(0, e)}
          />

          {formState.merchImagePreview ? (
            <>
              <img
                src={formState.merchImagePreview}
                alt="Product preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-lg bg-[#110e31]/80 px-4 py-3 text-center text-sm font-medium text-white">
                Replace image
              </div>
            </>
          ) : (
            <div className="max-w-xs px-6 text-center">
              <p className="text-base font-medium text-white">
                Upload product image
              </p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Choose a clear cover image for the catalog listing.
              </p>
              <p className="mt-4 text-xs uppercase tracking-wide text-white/45">
                PNG, JPG, or WebP
              </p>
              <div className="mt-6 inline-flex rounded-lg border border-white/10 bg-[#241d49] px-4 py-2 text-sm font-medium text-white/85">
                Select image
              </div>
            </div>
          )}
        </label>

        <AnimatePresence>
          {errors.merchImage && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 text-sm font-medium text-red-400"
            >
              {errors.merchImage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col justify-center lg:col-span-7">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputBlock
              label="Product Name"
              error={errors.merchName}
              rightElement={
                <span
                  className={`text-xs font-medium ${
                    formState.merchName.length >= 100
                      ? "text-red-400"
                      : "text-white/45"
                  }`}
                >
                  {formState.merchName.length}/100
                </span>
              }
            >
              <input
                type="text"
                value={formState.merchName}
                onChange={(e) => actions.setMerchName(e.target.value)}
                placeholder="e.g. Limited Edition Hoodie"
                maxLength={100}
                className={`${inputClass} font-medium`}
              />
            </InputBlock>

            <InputBlock
              label="Base Price"
              error={errors.basePrice}
              rightElement={
                isClothing ? (
                  <span className="text-xs font-medium text-white/45">
                    Set per size
                  </span>
                ) : undefined
              }
            >
              <div className="flex w-full items-center gap-3">
                <span className="text-sm font-medium uppercase tracking-wide text-white/45">
                  PHP
                </span>
                <input
                  type="number"
                  value={formState.basePrice === 0 ? "" : formState.basePrice}
                  onChange={(e) => actions.setBasePrice(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder={"0.00"}
                  min="0"
                  step="0.01"
                  className={`${inputClass} font-medium [appearance:textfield] disabled:cursor-not-allowed disabled:text-white/35 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                />
              </div>
            </InputBlock>
          </div>

          <InputBlock label="Category" error={errors.merchType} noPadding>
            <CustomDropdown
              options={categoryOptions}
              value={formState.merchType}
              onChange={(value) =>
                actions.setMerchType(value as MerchType | "")
              }
              placeholder="Select category..."
              className="bg-transparent border-none !px-0 !py-0 ring-0 focus:ring-0"
            />
          </InputBlock>

          <InputBlock
            label="Description"
            error={errors.description}
            rightElement={
              <span
                className={`text-xs font-medium ${
                  formState.description.length >= 500
                    ? "text-red-400"
                    : "text-white/45"
                }`}
              >
                {formState.description.length}/500
              </span>
            }
          >
            <textarea
              value={formState.description}
              onChange={(e) => actions.setDescription(e.target.value)}
              placeholder="Describe the product, materials, and any details shoppers should know."
              maxLength={500}
              rows={4}
              className={`${inputClass} min-h-[120px] resize-none leading-relaxed`}
            />
          </InputBlock>

          <div className="flex justify-end pt-2">
            <button
              onClick={actions.goToVariants}
              className="w-full rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-purple-900/30 transition-colors hover:bg-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#110e31] md:w-auto"
              type="button"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchInfoStep;
