import React from "react";
import type { FreebiePreset } from "../../../../interfaces/merch/FreebiePreset";
import { S3_BASE_URL } from "../../../../constant";
import { BiX } from "react-icons/bi";

interface FreebieSelectionModalProps {
  open: boolean;
  onClose: () => void;
  presets: FreebiePreset[];
  selection: { [freebieMerchId: number]: number };
  onSelect: (freebieMerchId: number, merchVariantItemId: number) => void;
  onConfirm: () => void;
}

const FreebieSelectionModal: React.FC<FreebieSelectionModalProps> = ({
  open,
  onClose,
  presets,
  selection,
  onSelect,
  onConfirm,
}) => {
  if (!open) return null;

  const allSelected = presets.every((p) => selection[p.freebieMerchId] !== undefined);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[#171236] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <BiX size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Select Your Freebies</h2>
          <p className="text-white/60 text-sm">
            Please choose exactly one item per freebie preset.
          </p>
        </div>

        <div className="space-y-6">
          {presets.map((preset) => {
            const hasSelection = selection[preset.freebieMerchId] !== undefined;

            return (
              <div
                key={preset.freebieMerchId}
                className={`bg-white/5 border ${hasSelection ? "border-purple-500/50" : "border-white/10"} rounded-xl p-4 transition-colors`}
              >
                <h3 className="text-white font-bold mb-4">{preset.freebieMerchName}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {preset.availableItems.map((item) => {
                    const isSelected = selection[preset.freebieMerchId] === item.merchVariantItemId;
                    const isOutOfStock = item.stockQuantity <= 0;

                    let label = "";
                    if (item.size) label += item.size;
                    if (item.design) label += label ? ` - ${item.design}` : item.design;
                    if (item.color) label += label ? ` (${item.color})` : item.color;

                    return (
                      <button
                        key={item.merchVariantItemId}
                        disabled={isOutOfStock}
                        onClick={() => onSelect(preset.freebieMerchId, item.merchVariantItemId)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                          isSelected
                            ? "bg-white/10 border-white text-white"
                            : isOutOfStock
                            ? "opacity-30 cursor-not-allowed border-white/5 grayscale"
                            : "bg-white/5 border-white/5 text-white/80 hover:border-purple-400 hover:text-white"
                        }`}
                      >
                        {item.s3ImageKey ? (
                          <img
                            src={S3_BASE_URL + item.s3ImageKey}
                            alt={label}
                            className="w-12 h-12 object-contain mb-2"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white/5 rounded-lg mb-2 flex items-center justify-center">
                            <span className="text-white/20 text-[10px] text-center leading-tight">
                              No preview
                            </span>
                          </div>
                        )}
                        <span className="text-center truncate w-full" title={label}>{label || "Select"}</span>
                        {isOutOfStock && <span className="text-[10px] text-red-400 mt-1">Out of Stock</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (allSelected) {
                onConfirm();
              }
            }}
            disabled={!allSelected}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              allSelected
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreebieSelectionModal;
