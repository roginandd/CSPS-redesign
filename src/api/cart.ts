import type { CartItemRequest } from "../interfaces/cart/CartItemRequest";
import type { CartItemResponse } from "../interfaces/cart/CartItemResponse";
import type { CartResponse } from "../interfaces/cart/CartResponse";
import type {
  CartItemFreebieSelectionResponse,
  FreebieSelection,
} from "../interfaces/freebie/FreebieAssignment";
import api from "./api";

// add a cart item
export const addCartItem = async (
  cartItem: CartItemRequest
): Promise<CartItemResponse> => {
  try {
    if (!cartItem || !cartItem.merchVariantItemId || cartItem.quantity <= 0) {
      throw new Error("Invalid cart item data");
    }

    const response = await api.post<CartItemResponse>(`cart-items`, cartItem);

    if (response.status === 400)
      throw new Error("Bad request: Unable to add cart item");

    return response.data;
  } catch (err) {
    console.error("Error adding cart item:", err);
    throw err;
  }
};

// get cart  by student
export const getCart = async (): Promise<CartResponse> => {
  try {
    const response = await api.get(`cart`);

    if (response.status === 404)
      throw new Error("Cart not found for the student");

    const cart = response.data.data;


    return cart;
  } catch (err) {
    console.error("Error fetching cart:", err);
    throw err;
  }
};

/**
 * Removes a cart item by its merchVariantItemId.
 * Called in the background after optimistic UI removal — the item
 * disappears from the UI instantly, and this request syncs with the server.    
 *
 * @param merchVariantItemId - The unique identifier of the cart item to remove 
 * @returns The API response data on success
 * @throws Propagates the error so the caller can revert the optimistic removal 
 */
export const removeCartItem = async (
  merchVariantItemId: number,
): Promise<void> => {
  try {
    await api.delete(`cart-items/${merchVariantItemId}`);
  } catch (err) {
    console.error("Error removing cart item:", err);
    throw err;
  }
};

/**
 * Updates a cart item's quantity.
 * Setting quantity to 0 will behave as a successful remove.
 * 
 * @param merchVariantItemId - The unique identifier of the cart item to update
 * @param quantity - The new quantity
 */
export const updateCartItemQuantity = async (
  merchVariantItemId: number,
  quantity: number
): Promise<CartItemResponse | null> => {
  try {
    const response = await api.put(`cart-items/${merchVariantItemId}?quantity=${quantity}`);
    
    // If setting to 0, the backend may return 200 OK with data: null
    // We treat this as a successful remove and allow data to be null
    return response.data?.data || null;
  } catch (err) {
    console.error("Error updating cart item quantity:", err);
    throw err;
  }
};

export const updateCartItemFreebieSelection = async (
  merchVariantItemId: number,
  freebieSelection: FreebieSelection[],
): Promise<CartItemResponse> => {
  try {
    const response = await api.put(
      `cart-items/${merchVariantItemId}/freebie-selection`,
      freebieSelection,
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    console.error("Error updating cart freebie selection:", err);
    throw err;
  }
};

export const getCartItemFreebieSelection = async (
  merchVariantItemId: number,
): Promise<CartItemFreebieSelectionResponse> => {
  try {
    const response = await api.get(
      `cart-items/${merchVariantItemId}/freebie-selection`,
    );
    return response.data?.data ?? response.data;
  } catch (err) {
    console.error("Error fetching cart freebie selection:", err);
    throw err;
  }
};
