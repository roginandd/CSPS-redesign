import { MerchType } from "../../../../enums/MerchType";
import type {
  ClothingVariant,
  MerchFormState,
  NonClothingVariant,
} from "../../../../hooks/useMerchForm";
import type { ValidationErrors } from "../util/validation";

export interface MerchInfoActions {
  setMerchName: (name: string) => void;
  setDescription: (description: string) => void;
  setMerchType: (type: MerchType | "") => void;
  setBasePrice: (price: string) => void;
  uploadMerchImage: (index: number, file: File) => void;
  goToVariants: () => void;
}

export interface MerchInfoStepProps {
  formState: MerchFormState;
  errors?: ValidationErrors;
  actions: MerchInfoActions;
}

export interface VariantActions {
  goBack: () => void;
  addClothingVariant: () => void;
  addNonClothingVariant: () => void;
  updateClothingVariant: (
    index: number,
    field: "color" | "price",
    value: string,
  ) => void;
  updateNonClothingVariant: (
    index: number,
    field: "design" | "stock" | "price",
    value: string,
  ) => void;
  toggleSize: (
    variantIndex: number,
    sizeIndex: number,
    checked: boolean,
  ) => void;
  updateSizeStock: (
    variantIndex: number,
    sizeIndex: number,
    value: string,
  ) => void;
  updateSizePrice?: (
    variantIndex: number,
    sizeIndex: number,
    value: string,
  ) => void;
  uploadVariantImage: (
    type: "clothing" | "nonClothing",
    variantIndex: number,
    imageIndex: number,
    file: File,
  ) => void;
  removeClothingVariant: (index: number) => void;
  removeNonClothingVariant: (index: number) => void;
  submit: () => void;
}

export interface VariantStepProps {
  formState: MerchFormState;
  errors?: ValidationErrors;
  isLoading?: boolean;
  actions: VariantActions;
}

export interface ClothingVariantCardActions {
  updateColor: (value: string) => void;
  updatePrice: (value: string) => void;
  uploadImage: (imageIndex: number, file: File) => void;
  toggleSize: (sizeIndex: number, checked: boolean) => void;
  updateSizeStock: (sizeIndex: number, value: string) => void;
  updateSizePrice?: (sizeIndex: number, value: string) => void;
  remove: () => void;
}

export interface ClothingVariantCardProps {
  variant: ClothingVariant;
  variantIndex: number;
  errors?: ValidationErrors;
  actions: ClothingVariantCardActions;
}

export interface NonClothingVariantCardActions {
  updateDesign: (value: string) => void;
  updatePrice: (value: string) => void;
  uploadImage: (imageIndex: number, file: File) => void;
  updateStock: (value: string) => void;
  remove: () => void;
}

export interface NonClothingVariantCardProps {
  variant: NonClothingVariant;
  variantIndex: number;
  errors?: ValidationErrors;
  actions: NonClothingVariantCardActions;
}
