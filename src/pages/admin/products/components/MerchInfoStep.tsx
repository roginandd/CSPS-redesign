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

// helper component for managing arrays of strings (sizes, colors, designs)
const FreebieArrayInput = ({
  label,
  values,
  onChange,
  placeholder,
  addLabel,
  duplicateErrorMessage,
  error,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  addLabel: string;
  duplicateErrorMessage: string;
  error?: string;
}) => {
  const [inputValue, setInputValue] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    
    // check for duplicates
    if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setLocalError(duplicateErrorMessage);
      return;
    }

    onChange([...values, trimmed]);
    setInputValue("");
    setLocalError(null);
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
    setLocalError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="relative">
      <div className="rounded-xl border bg-[#1a1635] border-white/10 px-4 py-3.5">
        <label className="block text-xs font-medium uppercase tracking-wide text-white/50 mb-2">
          {label}
        </label>
        
        {/* tag list */}
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {values.map((value, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white"
              >
                {value}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* input row */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (localError) {
                setLocalError(null);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors"
          >
            {addLabel}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {(localError || error) && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-6 left-2 text-xs font-medium text-red-400"
          >
            {localError || error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const FREEBIE_SIZE_OPTIONS = [
  "S",
  "XL",
  "XS",
  "L",
  "M",
  "XXXL",
  "XXL",
  "XXXXL",
];

const FreebieSizeChecklist = ({
  values,
  onChange,
  error,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  error?: string;
}) => {
  const toggleSize = (size: string) => {
    if (values.includes(size)) {
      onChange(values.filter((value) => value !== size));
      return;
    }

    onChange([...values, size]);
  };

  return (
    <div className="relative">
      <div
        className={`rounded-xl border px-4 py-3.5 ${
          error
            ? "border-red-500/60 bg-red-500/5"
            : "border-white/10 bg-[#1a1635]"
        }`}
      >
        <label className="mb-3 block text-xs font-medium uppercase tracking-wide text-white/50">
          Available Sizes
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FREEBIE_SIZE_OPTIONS.map((size) => {
            const checked = values.includes(size);

            return (
              <label
                key={size}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  checked
                    ? "border-purple-500/40 bg-purple-500/15 text-purple-100"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSize(size)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent text-purple-500 focus:ring-purple-400"
                />
                <span>{size}</span>
              </label>
            );
          })}
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
};

const MerchInfoStep: React.FC<MerchInfoStepProps> = ({
  formState,
  errors = {},
  actions,
}) => {
  const getFreebieError = (
    index: number,
    field: "freebieName" | "sizes" | "colors" | "designs",
  ) => errors[`freebieConfigs.${index}.${field}`];

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
  const isTicket = formState.merchType === MerchType.TICKET;
  const inputClass =
    "w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none sm:text-base";

  return (
    <>
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

          {isTicket && (
            <div className="space-y-4 rounded-xl border border-white/10 bg-[#140f33] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Has Freebie?
                  </p>
                  <p className="text-xs text-white/55">
                    attach an inline freebie config to this ticket
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => actions.setHasFreebie(!formState.hasFreebie)}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    formState.hasFreebie
                      ? "border-purple-500/40 bg-purple-500/15 text-purple-200"
                      : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                  aria-pressed={formState.hasFreebie}
                >
                  {formState.hasFreebie ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Enabled
                    </>
                  ) : (
                    "Disabled"
                  )}
                </button>
              </div>

              {formState.hasFreebie && (
                <div className="space-y-4">
                  {formState.freebieConfigs.map((config, index) => (
                    <div
                      key={`${config.ticketFreebieConfigId ?? "draft"}-${index}`}
                      className="space-y-4 rounded-2xl border border-white/10 bg-[#1a1635] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                            Freebie {index + 1}
                          </p>
                          <p className="mt-1 text-sm text-white/60">
                            Configure the included ticket freebie shown at checkout.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => actions.removeFreebieConfig(index)}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/15"
                        >
                          Remove Freebie
                        </button>
                      </div>

                      <InputBlock
                        label="Freebie Name"
                        error={getFreebieError(index, "freebieName")}
                      >
                        <input
                          type="text"
                          value={config.freebieName}
                          onChange={(e) =>
                            actions.setFreebieName(index, e.target.value)
                          }
                          placeholder="e.g. ICT Congress Shirt"
                          className={inputClass}
                        />
                      </InputBlock>

                      <InputBlock label="Freebie Category" noPadding>
                        <CustomDropdown
                          options={[
                            { label: "Clothing", value: "CLOTHING" },
                            { label: "Non-Clothing", value: "NON_CLOTHING" },
                          ]}
                          value={config.category}
                          onChange={(value) =>
                            actions.setFreebieCategory(
                              index,
                              value as "CLOTHING" | "NON_CLOTHING",
                            )
                          }
                          placeholder="Select category..."
                          className="bg-transparent border-none !px-0 !py-0 ring-0 focus:ring-0"
                        />
                      </InputBlock>

                      {config.category === "CLOTHING" && (
                        <>
                          <InputBlock label="Clothing Subtype" noPadding>
                            <CustomDropdown
                              options={[
                                { label: "Select subtype...", value: "" },
                                { label: "Shirt", value: "shirt" },
                                { label: "Hoodie", value: "hoodie" },
                                { label: "Jacket", value: "jacket" },
                                { label: "Pants", value: "pants" },
                                { label: "Shorts", value: "shorts" },
                              ]}
                              value={config.clothingSubtype || ""}
                              onChange={(value) =>
                                actions.setClothingSubtype(
                                  index,
                                  value as
                                    | "shirt"
                                    | "hoodie"
                                    | "jacket"
                                    | "pants"
                                    | "shorts",
                                )
                              }
                              placeholder="Select subtype..."
                              className="bg-transparent border-none !px-0 !py-0 ring-0 focus:ring-0"
                            />
                          </InputBlock>

                          <FreebieSizeChecklist
                            values={config.sizes || []}
                            onChange={(sizes) =>
                              actions.setFreebieSizes(index, sizes)
                            }
                            error={getFreebieError(index, "sizes")}
                          />

                          <FreebieArrayInput
                            label="Available Colors"
                            values={config.colors || []}
                            onChange={(colors) =>
                              actions.setFreebieColors(index, colors)
                            }
                            placeholder="e.g. Black, White"
                            addLabel="Add Color"
                            duplicateErrorMessage="Duplicate colors are not allowed."
                            error={getFreebieError(index, "colors")}
                          />
                        </>
                      )}

                      {config.category === "NON_CLOTHING" && (
                        <FreebieArrayInput
                          label="Available Designs / Variants"
                          values={config.designs || []}
                          onChange={(designs) =>
                            actions.setFreebieDesigns(index, designs)
                          }
                          placeholder="e.g. Main Logo, Minimalist"
                          addLabel="Add Design"
                          duplicateErrorMessage="Duplicate designs are not allowed."
                          error={getFreebieError(index, "designs")}
                        />
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={actions.addFreebieConfig}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Add Freebie
                  </button>
                </div>
              )}
            </div>
          )}

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
    </>
  );
};

export default MerchInfoStep;
