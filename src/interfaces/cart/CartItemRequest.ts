import type { FreebieSelection } from "../freebie/FreebieAssignment";

export interface CartItemRequest {
  merchVariantItemId: number;
  quantity: number;
  freebies?: { merchVariantItemId: number }[];
  freebieSelections?: FreebieSelection[];
}
