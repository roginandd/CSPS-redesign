import { AnimatePresence, motion } from "framer-motion";
import type {
  CartItemEditableFreebie,
  CartItemFreebieSelectionResponse,
  FreebieSelection,
} from "../../../../interfaces/freebie/FreebieAssignment";

type EditFreebieModalProps = {
  open: boolean;
  merchName: string;
  freebieData: CartItemFreebieSelectionResponse | null;
  selection: Record<number, FreebieSelection>;
  loading: boolean;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSelectionChange: (selection: Record<number, FreebieSelection>) => void;
  onSave: () => void;
};

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-[#1a1635] px-4 py-3 text-sm text-white/85 outline-none transition-colors focus:border-white/20";

const normalizeSize = (value: string) => value.trim().toUpperCase();

const getSizeRank = (size: string): number => {
  const normalized = normalizeSize(size);

  // keep apparel sizing in ascending order from smallest to largest
  const fixedRanks: Record<string, number> = {
    XXS: 10,
    XS: 20,
    S: 30,
    M: 40,
    L: 50,
    XL: 60,
    XXL: 70,
    XXXL: 80,
    XXXXL: 90,
  };

  if (fixedRanks[normalized] !== undefined) {
    return fixedRanks[normalized];
  }

  const xxlLike = normalized.match(/^(\d+)XL$/);
  if (xxlLike) {
    return 60 + Number(xxlLike[1]) * 10;
  }

  return Number.MAX_SAFE_INTEGER;
};

const sortSizesAscending = (sizes: string[]): string[] =>
  [...sizes].sort((a, b) => {
    const rankDiff = getSizeRank(a) - getSizeRank(b);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    return normalizeSize(a).localeCompare(normalizeSize(b));
  });

const FreebieEditor = ({
  freebie,
  selection,
  onChange,
}: {
  freebie: CartItemEditableFreebie;
  selection?: FreebieSelection;
  onChange: (selection: FreebieSelection) => void;
}) => {
  const isClothing = freebie.category === "CLOTHING";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-white/45">
          Included Freebie
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          {freebie.freebieName}
        </p>
      </div>

      {isClothing ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-white/45">
              Freebie Size
            </span>
            <select
              value={selection?.selectedSize || ""}
              onChange={(event) =>
                onChange({
                  ticketFreebieConfigId: freebie.ticketFreebieConfigId,
                  selectedSize: event.target.value || "",
                  selectedColor: selection?.selectedColor || "",
                })
              }
              className={fieldClass}
            >
              <option value="" disabled hidden>
                Size
              </option>
              {sortSizesAscending(freebie.availableSizes || []).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-white/45">
              Freebie Color
            </span>
            <select
              value={selection?.selectedColor || ""}
              onChange={(event) =>
                onChange({
                  ticketFreebieConfigId: freebie.ticketFreebieConfigId,
                  selectedSize: selection?.selectedSize || "",
                  selectedColor: event.target.value || "",
                })
              }
              className={fieldClass}
            >
              <option value="" disabled hidden>
                Color
              </option>
              {(freebie.availableColors || []).map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-white/45">
            Freebie Design
          </span>
          <select
            value={selection?.selectedDesign || ""}
            onChange={(event) =>
              onChange({
                ticketFreebieConfigId: freebie.ticketFreebieConfigId,
                selectedDesign: event.target.value || "",
              })
            }
            className={fieldClass}
          >
            <option value="" disabled hidden>
              Design
            </option>
            {(freebie.availableDesigns || []).map((design) => (
              <option key={design} value={design}>
                {design}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};

const EditFreebieModal: React.FC<EditFreebieModalProps> = ({
  open,
  merchName,
  freebieData,
  selection,
  loading,
  saving,
  error,
  onClose,
  onSelectionChange,
  onSave,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={!saving ? onClose : undefined}
          aria-label="Close edit freebie modal"
        />

        <motion.div
          initial={{ y: 16, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 16, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#171236] p-6 text-white"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-white/45">
                Cart Item
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Edit Freebies
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{merchName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Close
            </button>
          </div>

          <div className="mt-6 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            {loading ? (
              <>
                <div className="h-24 animate-pulse rounded-xl bg-white/5" />
                <div className="h-24 animate-pulse rounded-xl bg-white/5" />
              </>
            ) : freebieData ? (
              freebieData.freebies.map((freebie) => (
                <FreebieEditor
                  key={freebie.ticketFreebieConfigId}
                  freebie={freebie}
                  selection={selection[freebie.ticketFreebieConfigId]}
                  onChange={(nextSelection) =>
                    onSelectionChange({
                      ...selection,
                      [freebie.ticketFreebieConfigId]: nextSelection,
                    })
                  }
                />
              ))
            ) : (
              <p className="text-sm text-white/60">
                We couldn&apos;t load the freebie options for this ticket.
              </p>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving || loading || !freebieData}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Freebies"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default EditFreebieModal;
