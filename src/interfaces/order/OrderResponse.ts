import type { MerchType } from "../../enums/MerchType";
import type { OrderStatus } from "../../enums/OrderStatus";
import type { FreebieAssignmentSummary } from "../freebie/FreebieAssignment";

export interface OrderItemResponse {
  orderItemId: number;
  orderId: number;
  studentId: string;
  studentName: string;
  merchId?: number;
  merchName: string;
  color?: string | null;
  design?: string | null;
  size?: string | null;
  quantity: number;
  totalPrice: number;
  s3ImageKey?: string | null;
  merchType: MerchType;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
  freebieAssignments?: FreebieAssignmentSummary[];
}

export interface OrderResponse {
  orderId: number;
  studentName: string;
  totalPrice: number;
  orderDate: string;
  orderItems: OrderItemResponse[];
  orderStatus: OrderStatus;
}

export interface PaginatedOrdersResponse {
  content: OrderResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  numberOfElements: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export interface PaginatedOrderItemsResponse {
  content: OrderItemResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  numberOfElements: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}
