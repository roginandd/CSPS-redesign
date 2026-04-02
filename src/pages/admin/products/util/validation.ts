import type { FreebieDraft, MerchFormState } from "../../../../hooks/useMerchForm";

export interface ValidationErrors {
  [key: string]: string;
}

const hasDuplicateValues = (values?: string[]) => {
  if (!values?.length) return false;

  const normalized = values
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return new Set(normalized).size !== normalized.length;
};

export const validateMerchInfo = (
  formState: MerchFormState,
): { isValid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {};

  if (!formState.merchName.trim()) {
    errors.merchName = "Merchandise name is required";
  } else if (formState.merchName.length > 100) {
    errors.merchName = "Merchandise name must not exceed 100 characters";
  }

  if (!formState.merchType) {
    errors.merchType = "Merchandise type is required";
  }

  // Only validate base price for non-clothing items
  if (formState.merchType !== "CLOTHING") {
    if (formState.basePrice === 0 || formState.basePrice === ("" as any)) {
      errors.basePrice = "Price is required and must be greater than 0";
    } else if (
      isNaN(Number(formState.basePrice)) ||
      Number(formState.basePrice) <= 0
    ) {
      errors.basePrice = "Price must be a positive number";
    }
  }

  if (!formState.merchImageFile) {
    errors.merchImage = "Product image is required";
  }

  if (formState.description.length > 500) {
    errors.description = "Description must not exceed 500 characters";
  }

  if (formState.merchType === "TICKET" && formState.hasFreebie) {
    if (formState.freebieConfigs.length === 0) {
      errors.freebieConfigs = "Add at least one freebie.";
    }

    formState.freebieConfigs.forEach((config, index) => {
      if (!config.freebieName.trim()) {
        errors[`freebieConfigs.${index}.freebieName`] =
          "Freebie name is required.";
      }

      if (config.category === "CLOTHING") {
        if (!config.sizes?.length) {
          errors[`freebieConfigs.${index}.sizes`] = "Select at least one size.";
        } else if (hasDuplicateValues(config.sizes)) {
          errors[`freebieConfigs.${index}.sizes`] =
            "Duplicate sizes are not allowed.";
        }

        if (!config.colors?.length) {
          errors[`freebieConfigs.${index}.colors`] =
            "Select at least one color.";
        } else if (hasDuplicateValues(config.colors)) {
          errors[`freebieConfigs.${index}.colors`] =
            "Duplicate colors are not allowed.";
        }
      } else if (!config.designs?.length) {
        errors[`freebieConfigs.${index}.designs`] =
          "Add at least one design or variant.";
      } else if (hasDuplicateValues(config.designs)) {
        errors[`freebieConfigs.${index}.designs`] =
          "Duplicate designs are not allowed.";
      }
    });
  }

  // reject freebies on non-ticket merch
  if (formState.merchType !== "TICKET" && formState.hasFreebie) {
    errors.hasFreebie = "Freebies are only allowed for ticket merch.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateFreebieDraft = (
  draft: FreebieDraft,
): { isValid: boolean; message?: string } => {
  if (!draft.merchName.trim()) {
    return { isValid: false, message: "Freebie name is required" };
  }

  if (!draft.merchType) {
    return { isValid: false, message: "Freebie type is required" };
  }

  if (draft.merchType !== "CLOTHING") {
    if (!draft.basePrice || draft.basePrice <= 0) {
      return { isValid: false, message: "Freebie base price is required" };
    }
  }

  if (!draft.merchImageFile) {
    return { isValid: false, message: "Freebie image is required" };
  }

  if (draft.merchType === "CLOTHING") {
    if (draft.clothingVariants.length === 0) {
      return { isValid: false, message: "Add at least one freebie variant" };
    }
    const hasValidVariant = draft.clothingVariants.every((variant) => {
      const checkedSizes = variant.sizeStock.filter((item) => item.checked);
      return (
        variant.color.trim() &&
        variant.imageFile &&
        checkedSizes.length > 0 &&
        checkedSizes.every((size) => size.stock !== "" && Number(size.stock) > 0)
      );
    });
    return hasValidVariant
      ? { isValid: true }
      : { isValid: false, message: "Complete freebie size/color details" };
  }

  if (draft.nonClothingVariants.length === 0) {
    return { isValid: false, message: "Add at least one freebie variant" };
  }

  const hasValidNonClothing = draft.nonClothingVariants.every((variant) => {
    return (
      variant.design.trim() &&
      variant.imageFile &&
      variant.stock !== "" &&
      Number(variant.stock) > 0
    );
  });

  return hasValidNonClothing
    ? { isValid: true }
    : { isValid: false, message: "Complete freebie design/stock details" };
};

export const validateVariants = (
  formState: MerchFormState,
): { isValid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {};
  const { merchType, clothingVariants, nonClothingVariants } = formState;

  if (merchType === "CLOTHING") {
    if (clothingVariants.length === 0) {
      errors.variants = "At least one variant is required";
    } else {
      clothingVariants.forEach((variant, idx) => {
        if (!variant.color.trim()) {
          errors[`variant_${idx}_color`] = "Color is required";
        }

        if (!variant.imageFile) {
          errors[`variant_${idx}_image`] = "Variant image is required";
        }

        if (variant.price === "" || variant.price === 0) {
          errors[`variant_${idx}_price`] =
            "Price is required and must be greater than 0";
        } else if (isNaN(Number(variant.price)) || Number(variant.price) <= 0) {
          errors[`variant_${idx}_price`] = "Price must be a positive number";
        }

        const checkedSizes = variant.sizeStock.filter((s) => s.checked);
        if (checkedSizes.length === 0) {
          errors[`variant_${idx}_sizes`] = "At least one size must be selected";
        }

        checkedSizes.forEach((size, sizeIdx) => {
          if (size.stock === "" || size.stock <= 0) {
            errors[`variant_${idx}_size_${sizeIdx}`] =
              "Stock quantity must be greater than 0";
          }
        });
      });
    }
  } else {
    if (nonClothingVariants.length === 0) {
      errors.variants = "At least one variant is required";
    } else {
      nonClothingVariants.forEach((variant, idx) => {
        if (!variant.design.trim()) {
          errors[`variant_${idx}_design`] = "Design is required";
        }

        if (!variant.imageFile) {
          errors[`variant_${idx}_image`] = "Variant image is required";
        }

        if (variant.price === "" || variant.price === 0) {
          errors[`variant_${idx}_price`] =
            "Price is required and must be greater than 0";
        } else if (isNaN(Number(variant.price)) || Number(variant.price) <= 0) {
          errors[`variant_${idx}_price`] = "Price must be a positive number";
        }

        if (variant.stock === "" || variant.stock <= 0) {
          errors[`variant_${idx}_stock`] =
            "Stock quantity must be greater than 0";
        }
      });
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
