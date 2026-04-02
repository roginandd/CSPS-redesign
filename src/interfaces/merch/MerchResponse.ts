import type { MerchType } from "../../enums/MerchType";
import type { MerchVariantResponse } from "../merch_variant/MerchVariantResponse";
import type { FreebieConfigWithId } from "../freebie/FreebieConfig";

/**
 * Detailed merchandise response with all variants and items.
 * Returned from GET /api/merch/{merchId}
 */
export interface MerchDetailedResponse {
  merchId: number;
  merchName: string;
  description: string;
  merchType: MerchType;
  basePrice: number;
  s3ImageKey: string;
  variants: MerchVariantResponse[];
  hasFreebie?: boolean;
  freebieConfigs?: FreebieConfigWithId[];
  purchaseBlocked?: boolean;
  purchaseBlockMessage?: string | null;
}

/**
 * Summary merchandise response without variant details.
 * Returned from GET /api/merch/summary and GET /api/merch/type/{type}
 */
export interface MerchSummaryResponse {
  merchId: number;
  merchName: string;
  description: string;
  merchType: MerchType;
  basePrice: number;
  s3ImageKey: string;
  totalStockQuantity?: number;
}
