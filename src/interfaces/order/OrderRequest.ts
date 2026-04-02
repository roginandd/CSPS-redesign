import type { FreebieSelection } from "../freebie/FreebieAssignment";

export interface OrderPostRequest {
  orderItems: OrderItemRequest[];
}

export interface OrderItemRequest {
  orderId?: number;
  merchVariantItemId: number;
  quantity: number; // >= 1
  freebies?: { merchVariantItemId: number }[];
  freebieSelections?: FreebieSelection[];
}
