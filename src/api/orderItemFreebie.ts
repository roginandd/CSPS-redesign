import api from "./api";
import type {
  OrderItemFreebieResponse,
  UpdateFreebieAssignmentRequest,
} from "../interfaces/freebie/FreebieAssignment";

/**
 * get freebie assignment for a single order item
 * endpoint: GET /api/order-items/{orderItemId}/freebie-assignment
 */
export const getOrderItemFreebieAssignment = async (
  orderItemId: number,
): Promise<OrderItemFreebieResponse[]> => {
  try {
    const response = await api.get(
      `/order-items/${orderItemId}/freebie-assignment`,
    );
    return response.data;
  } catch (err) {
    console.error(
      `error fetching freebie assignment for order item ${orderItemId}:`,
      err,
    );
    throw err;
  }
};

/**
 * update freebie assignment for a single order item (admin backfill)
 * endpoint: PUT /api/order-items/{orderItemId}/freebie-assignment
 */
export const updateOrderItemFreebieAssignment = async (
  orderItemId: number,
  payload: UpdateFreebieAssignmentRequest,
): Promise<OrderItemFreebieResponse[]> => {
  try {
    const response = await api.put(
      `/order-items/${orderItemId}/freebie-assignment`,
      payload,
    );
    return response.data;
  } catch (err: any) {
    console.error(
      `error updating freebie assignment for order item ${orderItemId}:`,
      err,
    );
    // propagate backend error message if available
    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      "failed to update freebie assignment";
    throw new Error(errorMessage);
  }
};
