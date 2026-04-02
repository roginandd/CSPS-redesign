import { OrderStatus } from "../enums/OrderStatus";

// status labels mapping
export const STATUS_LABELS: Record<string, string> = {
  [OrderStatus.PENDING]: "Pending Payment Review",
  [OrderStatus.TO_BE_CLAIMED]: "Ready to Claim",
  [OrderStatus.CLAIMED]: "Claimed",
  [OrderStatus.REJECTED]: "Rejected",
  [OrderStatus.CANCELLED]: "Cancelled",
};

// status styling for dark mode
export const STATUS_STYLES_DARK: Record<string, { color: string; bg: string; border: string }> = {
  [OrderStatus.PENDING]: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  [OrderStatus.TO_BE_CLAIMED]: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  [OrderStatus.CLAIMED]: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  [OrderStatus.REJECTED]: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  [OrderStatus.CANCELLED]: {
    color: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
  },
};

// status styling for light mode
export const STATUS_STYLES_LIGHT: Record<string, { color: string; bg: string; border: string }> = {
  [OrderStatus.PENDING]: {
    color: "text-blue-700",
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
  },
  [OrderStatus.TO_BE_CLAIMED]: {
    color: "text-amber-700",
    bg: "bg-amber-500/20",
    border: "border-amber-500/30",
  },
  [OrderStatus.CLAIMED]: {
    color: "text-green-700",
    bg: "bg-green-500/20",
    border: "border-green-500/30",
  },
  [OrderStatus.REJECTED]: {
    color: "text-red-700",
    bg: "bg-red-500/20",
    border: "border-red-500/30",
  },
  [OrderStatus.CANCELLED]: {
    color: "text-zinc-700",
    bg: "bg-zinc-500/20",
    border: "border-zinc-500/30",
  },
};

/**
 * get status display configuration with label and styling
 * @param status - order status
 * @param theme - theme mode (defaults to dark)
 * @returns object with label and className
 */
export const getStatusDisplay = (
  status: string,
  theme: "dark" | "light" = "dark"
): { label: string; className: string } => {
  const label = STATUS_LABELS[status] || status;
  const styles = theme === "light" ? STATUS_STYLES_LIGHT : STATUS_STYLES_DARK;
  const style = styles[status] || styles[OrderStatus.PENDING];

  const className = `${style.color} ${style.bg} ${style.border}`;

  return { label, className };
};

/**
 * get allowed status transitions for a given status
 * @param currentStatus - current order status
 * @returns array of allowed next statuses
 */
export const getAllowedTransitions = (currentStatus: string): string[] => {
  switch (currentStatus) {
    case OrderStatus.PENDING:
      return [OrderStatus.TO_BE_CLAIMED];
    case OrderStatus.TO_BE_CLAIMED:
      return [OrderStatus.CLAIMED];
    case OrderStatus.CLAIMED:
      return []; // final state
    case OrderStatus.REJECTED:
      return []; // final state
    case OrderStatus.CANCELLED:
      return []; // final state
    default:
      return [];
  }
};

/**
 * validate if a status transition is allowed
 * @param fromStatus - current status
 * @param toStatus - target status
 * @returns true if transition is valid
 */
export const isValidTransition = (fromStatus: string, toStatus: string): boolean => {
  const allowed = getAllowedTransitions(fromStatus);
  return allowed.includes(toStatus);
};
