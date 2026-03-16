export const MerchType = {
  CLOTHING: "CLOTHING",
  PIN: "PIN",
  STICKER: "STICKER",
  KEYCHAIN: "KEYCHAIN",
  MEMBERSHIP: "MEMBERSHIP",
  TICKET: "TICKET",
} as const;

export type MerchType = (typeof MerchType)[keyof typeof MerchType];
