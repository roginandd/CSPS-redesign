import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderStatus } from "../../../../../enums/OrderStatus";
import { FiChevronDown } from "react-icons/fi";
import { getAllowedTransitions, STATUS_LABELS } from "../../../../../utils/statusConfig";

const statusOptions = [
  {
    value: OrderStatus.PENDING,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    value: OrderStatus.TO_BE_CLAIMED,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    value: OrderStatus.CLAIMED,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
];

type StatusOption = (typeof statusOptions)[0];

interface StatusDropdownProps {
  selected: StatusOption;
  onSelect: (option: StatusOption) => void;
  currentStatus: string;
}

export default function StatusDropdown({
  selected,
  onSelect,
  currentStatus,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);

  // get allowed transitions based on current status
  const allowedStatuses = getAllowedTransitions(currentStatus);
  
  // filter options to only show allowed transitions
  const availableOptions = statusOptions.filter(option => 
    allowedStatuses.includes(option.value)
  );

  // if no transitions allowed (final state), show message
  if (availableOptions.length === 0) {
    return (
      <div className={`flex items-center justify-between gap-3 w-full rounded-xl px-4 py-4 border ${selected.bg} ${selected.border}`}>
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-sm">Status:</span>
          <span className={`font-bold text-sm ${selected.color}`}>
            {STATUS_LABELS[selected.value] || selected.value}
          </span>
        </div>
        <span className="text-white/30 text-xs italic">Final state</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block w-full">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-3 w-full rounded-xl px-4 py-4 transition-all border ${selected.bg} ${selected.border}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-sm">Status:</span>
          <span className={`font-bold text-sm ${selected.color}`}>
            {STATUS_LABELS[selected.value] || selected.value}
          </span>
        </div>
        <FiChevronDown 
          className={`text-white/40 transition-transform ${open ? "rotate-180" : ""}`} 
          size={18} 
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 rounded-xl bg-[#252552] border border-white/10 p-2 z-10"
          >
            {availableOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                }}
                className={`
                  flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-medium
                  transition-colors hover:bg-white/10
                  ${selected.value === option.value ? option.bg : ""}
                `}
              >
                <span className={`w-2 h-2 rounded-full ${option.color.replace("text-", "bg-")}`} />
                <span className={option.color}>{STATUS_LABELS[option.value] || option.value}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
