import type { MerchType } from "../../enums/MerchType";
import type { MerchVariantRequest } from "../merch_variant/MerchVariantRequest";
import type { FreebieConfig } from "../freebie/FreebieConfig";

export interface MerchRequest {
  merchName: string;
  description: string;
  merchType: MerchType;
  basePrice: number;
  s3ImageKey: number;
  variants: MerchVariantRequest[];
  hasFreebie?: boolean;
  freebieConfigs?: FreebieConfig[];
}
