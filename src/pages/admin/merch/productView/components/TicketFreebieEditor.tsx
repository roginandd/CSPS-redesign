import { useEffect, useState } from "react";
import CustomDropdown from "../../../../../components/CustomDropdown";
import type { EditableFreebieConfig } from "../../../../../hooks/useMerchForm";

const FREEBIE_SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];

const sortSizeValues = (values: string[]) =>
  [...values].sort((a, b) => {
    const aIndex = SIZE_ORDER.indexOf(a.toUpperCase());
    const bIndex = SIZE_ORDER.indexOf(b.toUpperCase());

    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

const TagInput = ({
  label,
  addLabel,
  placeholder,
  values,
  error,
  disabled,
  onChange,
}: {
  label: string;
  addLabel: string;
  placeholder: string;
  values: string[];
  error?: string;
  disabled?: boolean;
  onChange: (values: string[]) => void;
}) => {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">
        {label}
      </p>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/85 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {value}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-white/10 bg-[#171236] px-3 py-2 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-purple-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const nextValue = draft.trim();
            if (!nextValue) return;
            onChange([...values, nextValue]);
            setDraft("");
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {addLabel}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

const TicketFreebieEditor = ({
  hasFreebie,
  freebieConfigs,
  errors,
  isSubmitting = false,
  onRequestConfirm,
  onAddFreebie,
  onRemoveFreebie,
  onUpdateFreebie,
}: {
  hasFreebie: boolean;
  freebieConfigs: EditableFreebieConfig[];
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  onRequestConfirm: (value: boolean) => void;
  onAddFreebie: () => void;
  onRemoveFreebie: (index: number) => void;
  onUpdateFreebie: (
    index: number,
    patch: Partial<EditableFreebieConfig> & {
      category?: "CLOTHING" | "NON_CLOTHING";
    },
  ) => void;
}) => {
  const [pendingHasFreebie, setPendingHasFreebie] = useState(hasFreebie);

  useEffect(() => {
    setPendingHasFreebie(hasFreebie);
  }, [hasFreebie]);

  const getError = (
    index: number,
    field: "freebieName" | "sizes" | "colors" | "designs",
  ) => errors?.[`freebieConfigs.${index}.${field}`];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="space-y-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/45">
            Add Freebie
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">Has Freebies?</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-white/55">
            Choose whether this ticket includes freebies, then confirm to save
            the freebie configuration.
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { label: "Enabled", value: true },
              { label: "Disabled", value: false },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                disabled={isSubmitting}
                onClick={() => setPendingHasFreebie(option.value)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  pendingHasFreebie === option.value
                    ? "border-purple-500/40 bg-purple-500/15 text-white"
                    : "border-white/10 bg-[#171236] text-white/70 hover:bg-white/10 hover:text-white"
                } ${isSubmitting ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {pendingHasFreebie && (
        <div className="mt-5 space-y-4">
          {errors?.freebieConfigs && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errors.freebieConfigs}
            </div>
          )}

          {freebieConfigs.map((config, index) => (
            <div
              key={`${config.ticketFreebieConfigId ?? "draft"}-${index}`}
              className="rounded-2xl border border-white/10 bg-[#171236] p-4"
            >
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">
                    Freebie {index + 1}
                  </p>
                  <p className="mt-1 text-sm text-white/55">
                    Configure one included freebie for this ticket.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                    Display Order {(config.displayOrder ?? index) + 1}
                  </span>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onRemoveFreebie(index)}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Remove Freebie
                  </button>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-white/45">
                    Freebie Name
                  </span>
                  <input
                    value={config.freebieName}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      onUpdateFreebie(index, { freebieName: e.target.value })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#110e31] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-purple-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="e.g. ICT Congress Shirt"
                  />
                  {getError(index, "freebieName") && (
                    <p className="text-xs text-red-400">
                      {getError(index, "freebieName")}
                    </p>
                  )}
                </label>

                <div className="rounded-xl border border-white/10 bg-[#110e31] px-3 py-2.5">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-white/45">
                    Display Order
                  </span>
                  <p className="mt-1 text-sm font-medium text-white/80">
                    Automatic
                  </p>
                </div>

                <div className="xl:col-span-2">
                  <CustomDropdown
                    label="Freebie Category"
                    value={config.category}
                    onChange={(value) =>
                      onUpdateFreebie(index, {
                        category: value as "CLOTHING" | "NON_CLOTHING",
                      })
                    }
                    options={[
                      { label: "Clothing", value: "CLOTHING" },
                      { label: "Non-Clothing", value: "NON_CLOTHING" },
                    ]}
                  />
                </div>

                {config.category === "CLOTHING" ? (
                  <>
                    <div className="xl:col-span-2">
                      <CustomDropdown
                        label="Clothing Subtype"
                        value={config.clothingSubtype || ""}
                        onChange={(value) =>
                          onUpdateFreebie(index, {
                            clothingSubtype: value as
                              | "shirt"
                              | "hoodie"
                              | "jacket"
                              | "pants"
                              | "shorts",
                          })
                        }
                        options={[
                          { label: "Select subtype...", value: "" },
                          { label: "Shirt", value: "shirt" },
                          { label: "Hoodie", value: "hoodie" },
                          { label: "Jacket", value: "jacket" },
                          { label: "Pants", value: "pants" },
                          { label: "Shorts", value: "shorts" },
                        ]}
                      />
                    </div>

                    <div className="space-y-2 xl:col-span-2">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">
                        Available Sizes
                      </p>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
                        {FREEBIE_SIZE_OPTIONS.map((size) => {
                          const selected = config.sizes.includes(size);
                          return (
                            <button
                              type="button"
                              key={size}
                              disabled={isSubmitting}
                              onClick={() =>
                                onUpdateFreebie(index, {
                                  sizes: selected
                                    ? config.sizes.filter((value) => value !== size)
                                    : sortSizeValues([...config.sizes, size]),
                                })
                              }
                              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                                selected
                                  ? "border-purple-500/40 bg-purple-500/15 text-purple-100"
                                  : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                              } ${isSubmitting ? "cursor-not-allowed opacity-60" : ""}`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                      {getError(index, "sizes") && (
                        <p className="text-xs text-red-400">
                          {getError(index, "sizes")}
                        </p>
                      )}
                    </div>

                    <div className="xl:col-span-2">
                      <TagInput
                        label="Available Colors"
                        addLabel="Add Color"
                        placeholder="e.g. Black"
                        values={config.colors}
                        error={getError(index, "colors")}
                        disabled={isSubmitting}
                        onChange={(values) => onUpdateFreebie(index, { colors: values })}
                      />
                    </div>
                  </>
                ) : (
                  <div className="xl:col-span-2">
                    <TagInput
                      label="Available Designs / Variants"
                      addLabel="Add Design"
                      placeholder="e.g. Main Logo"
                      values={config.designs || []}
                      error={getError(index, "designs")}
                      disabled={isSubmitting}
                      onChange={(values) => onUpdateFreebie(index, { designs: values })}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onAddFreebie}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add Freebie
          </button>

          {freebieConfigs.length > 0 && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onRequestConfirm(pendingHasFreebie)}
              className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Confirm"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketFreebieEditor;
