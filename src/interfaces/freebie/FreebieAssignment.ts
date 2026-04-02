/**
 * freebie assignment interfaces for order items
 * used during checkout and admin backfill
 */

export type FreebieFulfillmentStatus =
  | "PENDING_DETAILS"
  | "DETAILS_COMPLETED"
  | "CLAIMED"
  | "FULFILLED";

/**
 * freebie choice for clothing items
 */
export interface ClothingFreebieAssignment {
  ticketFreebieConfigId?: number;
  selectedSize: string;
  selectedColor: string;
}

/**
 * freebie choice for non-clothing items
 */
export interface NonClothingFreebieAssignment {
  ticketFreebieConfigId?: number;
  selectedDesign: string;
}

export type FreebieAssignment =
  | ClothingFreebieAssignment
  | NonClothingFreebieAssignment;

export interface FreebieSelection {
  ticketFreebieConfigId?: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedDesign?: string;
}

export interface FreebieAssignmentSummary {
  ticketFreebieConfigId: number;
  displayOrder?: number;
  hasFreebie?: boolean;
  category: "CLOTHING" | "NON_CLOTHING";
  freebieName: string;
  clothingSubtype?: string | null;
  selectedSize?: string | null;
  selectedColor?: string | null;
  selectedDesign?: string | null;
  fulfillmentStatus?: FreebieFulfillmentStatus;
}

export interface CartItemEditableFreebie {
  ticketFreebieConfigId: number;
  displayOrder?: number;
  category: "CLOTHING" | "NON_CLOTHING";
  freebieName: string;
  clothingSubtype?: string | null;
  availableSizes?: string[];
  availableColors?: string[];
  availableDesigns?: string[];
  selectedSize?: string | null;
  selectedColor?: string | null;
  selectedDesign?: string | null;
}

export interface CartItemFreebieSelectionResponse {
  merchVariantItemId: number;
  merchId: number;
  freebies: CartItemEditableFreebie[];
}

/**
 * response from GET /api/order-items/{orderItemId}/freebie-assignment
 */
export interface OrderItemFreebieResponse {
  ticketFreebieAssignmentId?: number;
  ticketFreebieConfigId: number;
  orderItemId: number;
  hasFreebie: boolean;
  displayOrder?: number;
  category: "CLOTHING" | "NON_CLOTHING";
  freebieName: string;
  clothingSubtype?: string | null;
  allowedSizes?: string[];
  allowedColors?: string[];
  allowedDesigns?: string[];
  selectedSize?: string | null;
  selectedColor?: string | null;
  selectedDesign?: string | null;
  fulfillmentStatus?: FreebieFulfillmentStatus;
}

export interface OrderItemFreebieUpdate {
  ticketFreebieConfigId: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedDesign?: string;
  fulfillmentStatus: FreebieFulfillmentStatus;
}

/**
 * payload for PUT /api/order-items/{orderItemId}/freebie-assignment
 */
export type UpdateFreebieAssignmentRequest = OrderItemFreebieUpdate[];
