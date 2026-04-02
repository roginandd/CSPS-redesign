export interface FreebiePresetItem {
  merchVariantItemId: number;
  color: string | null;
  design: string | null;
  size: string | null;
  stockQuantity: number;
  s3ImageKey: string | null;
}

export interface FreebiePreset {
  ticketMerchId: number;
  freebieMerchId: number;
  freebieMerchName: string;
  freebieMerchType: string;
  requiresSize: boolean;
  availableItems: FreebiePresetItem[];
}

export interface FreebiePresetRequestItem {
  merchId: number;
}

export interface FreebiePresetUpdateRequest {
  freebies: FreebiePresetRequestItem[];
}
