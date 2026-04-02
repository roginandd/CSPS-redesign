import type { MerchType } from "../../enums/MerchType";

import type { FreebieAssignmentSummary } from "../freebie/FreebieAssignment";

export interface CartItemResponse {
  merchId?: number;
  merchVariantItemId: number;
  merchName: string;
  size?: string;
  color?: string;
  design?: string;
  s3ImageKey: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
  merchType: MerchType;
  hasFreebie?: boolean;
  freebieAssignments?: FreebieAssignmentSummary[];
}
