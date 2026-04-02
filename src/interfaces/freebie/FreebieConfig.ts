/**
 * freebie configuration for ticket merchandise
 * embedded inline in ticket merch records
 */

export type FreebieCategory = "CLOTHING" | "NON_CLOTHING";
export type ClothingSubtype =
  | "shirt"
  | "hoodie"
  | "jacket"
  | "pants"
  | "shorts";

/**
 * freebie config for clothing items
 */
export interface ClothingFreebieConfig {
  displayOrder?: number;
  category: "CLOTHING";
  freebieName: string;
  clothingSubtype?: ClothingSubtype | string | null;
  sizes: string[];
  colors: string[];
}

/**
 * freebie config for non-clothing items
 */
export interface NonClothingFreebieConfig {
  displayOrder?: number;
  category: "NON_CLOTHING";
  freebieName: string;
  designs: string[] | null;
}

/**
 * union type for all freebie configs
 */
export type FreebieConfig = ClothingFreebieConfig | NonClothingFreebieConfig;

/**
 * freebie config with backend-assigned ID (read from GET)
 */
export type FreebieConfigWithId = FreebieConfig & {
  ticketFreebieConfigId: number;
};
