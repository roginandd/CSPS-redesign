import { useState, useCallback } from "react";
import { ClothingSizing } from "../enums/ClothingSizing";
import { MerchType } from "../enums/MerchType";
import type { MerchRequest } from "../interfaces/merch/MerchRequest";
import type {
  FreebieConfigWithId,
  ClothingSubtype,
  FreebieCategory,
} from "../interfaces/freebie/FreebieConfig";

export interface FreebieDraft {
  merchName: string;
  description: string;
  merchType: MerchType;
  basePrice: number;
  merchImagePreview: string;
  merchImageFile: File | null;
  imageThumbnails: string[];
  thumbnailFiles: (File | null)[];
  clothingVariants: ClothingVariant[];
  nonClothingVariants: NonClothingVariant[];
}

export interface MerchFormState extends Omit<MerchRequest, "merchType"> {
  merchType: MerchType | "";
  merchImagePreview?: string;
  merchImageFile?: File | null;
  imageThumbnails: string[];
  thumbnailFiles: (File | null)[];
  clothingVariants: ClothingVariant[];
  nonClothingVariants: NonClothingVariant[];
  hasFreebies: boolean;
  freebieDrafts: FreebieDraft[];
  hasFreebie?: boolean;
  freebieConfigs: EditableFreebieConfig[];
}

export type EditableFreebieConfig =
  | {
      ticketFreebieConfigId?: number;
      displayOrder: number;
      category: "CLOTHING";
      freebieName: string;
      clothingSubtype?: ClothingSubtype;
      sizes: string[];
      colors: string[];
      designs?: never;
    }
  | {
      ticketFreebieConfigId?: number;
      displayOrder: number;
      category: "NON_CLOTHING";
      freebieName: string;
      clothingSubtype?: never;
      sizes?: never;
      colors?: never;
      designs: string[];
    };

export interface ClothingVariant {
  color: string;
  price: number | "";
  imagePreview: string;
  imageFile: File | null;
  imageThumbnails: string[];
  thumbnailFiles: (File | null)[];
  sizeStock: Array<{
    size: ClothingSizing | "";
    stock: number | "";
    price: number | "";
    checked: boolean;
  }>;
}

export interface NonClothingVariant {
  design: string;
  price: number | "";
  imagePreview: string;
  imageFile: File | null;
  imageThumbnails: string[];
  thumbnailFiles: (File | null)[];
  stock: number | "";
}

/**
 * Convert MerchFormState to MerchRequest for API submission
 */
export const convertFormStateToMerchRequest = (
  formState: MerchFormState & {
    merchImageFile?: File | null;
    thumbnailFiles?: (File | null)[];
    clothingVariants?: ClothingVariant[];
    nonClothingVariants?: NonClothingVariant[];
  },
): MerchRequest => {
  const { ...merchRequest } = formState;

  return merchRequest as MerchRequest;
};

export const useMerchForm = () => {
  const [formState, setFormState] = useState<MerchFormState>({
    merchName: "",
    description: "",
    merchType: "" as MerchType,
    basePrice: 0,
    s3ImageKey: 0,
    variants: [],
    merchImagePreview: "",
    merchImageFile: null,
    imageThumbnails: ["", "", "", ""],
    thumbnailFiles: [null, null, null, null],
    clothingVariants: [],
    nonClothingVariants: [],
    hasFreebies: false,
    freebieDrafts: [],
    hasFreebie: false,
    freebieConfigs: [],
  });

  // --- Merch Info Handlers ---
  const setMerchName = useCallback((name: string) => {
    setFormState((prev) => ({ ...prev, merchName: name }));
  }, []);

  const setDescription = useCallback((desc: string) => {
    setFormState((prev) => ({ ...prev, description: desc.slice(0, 500) }));
  }, []);

  const setMerchType = useCallback((type: MerchType | "") => {
    setFormState((prev) => ({
      ...prev,
      merchType: type,
      hasFreebies: type === MerchType.TICKET ? prev.hasFreebies : false,
      freebieDrafts: type === MerchType.TICKET ? prev.freebieDrafts : [],
      hasFreebie: type === MerchType.TICKET ? prev.hasFreebie : false,
      freebieConfigs: type === MerchType.TICKET ? prev.freebieConfigs : [],
    }));
  }, []);

  const setBasePrice = useCallback((price: string) => {
    if (price === "" || price === "0") {
      setFormState((prev) => ({ ...prev, basePrice: 0 }));
    } else {
      const numPrice = parseFloat(price) || 0;
      setFormState((prev) => ({ ...prev, basePrice: numPrice }));
    }
  }, []);

  const handleMerchImageUpload = useCallback((index: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      setFormState((prev) => {
        if (index === 0) {
          return {
            ...prev,
            merchImagePreview: preview,
            merchImageFile: file,
          };
        } else {
          const updated = { ...prev };
          updated.imageThumbnails[index] = preview;
          updated.thumbnailFiles[index] = file;
          return updated;
        }
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // --- Clothing Variant Handlers ---
  const handleAddClothingVariant = useCallback(() => {
    const newVariant: ClothingVariant = {
      color: "",
      price: "",
      imagePreview: "",
      imageFile: null,
      imageThumbnails: ["", "", "", ""],
      thumbnailFiles: [null, null, null, null],
      sizeStock: Object.values(ClothingSizing).map((size) => ({
        size,
        stock: "",
        price: "",
        checked: false,
      })),
    };
    setFormState((prev) => ({
      ...prev,
      clothingVariants: [...prev.clothingVariants, newVariant],
    }));
  }, []);

  const handleClothingVariantChange = useCallback(
    (index: number, field: "color" | "price", value: string) => {
      setFormState((prev) => {
        const updated = [...prev.clothingVariants];
        if (field === "price") {
          updated[index] = {
            ...updated[index],
            [field]: value === "" ? "" : Number(value),
          };
        } else {
          updated[index] = { ...updated[index], [field]: value };
        }
        return { ...prev, clothingVariants: updated };
      });
    },
    [],
  );

  const handleSizeCheckChange = useCallback(
    (variantIndex: number, sizeIndex: number, checked: boolean) => {
      setFormState((prev) => {
        const updated = [...prev.clothingVariants];
        updated[variantIndex].sizeStock[sizeIndex] = {
          ...updated[variantIndex].sizeStock[sizeIndex],
          checked,
        };
        return { ...prev, clothingVariants: updated };
      });
    },
    [],
  );

  const handleStockQuantityChange = useCallback(
    (variantIndex: number, sizeIndex: number, value: string) => {
      setFormState((prev) => {
        const updated = [...prev.clothingVariants];
        updated[variantIndex].sizeStock[sizeIndex] = {
          ...updated[variantIndex].sizeStock[sizeIndex],
          stock: value === "" ? "" : Number(value),
        };
        return { ...prev, clothingVariants: updated };
      });
    },
    [],
  );

  const handlePriceChangeForSize = useCallback(
    (variantIndex: number, sizeIndex: number, value: string) => {
      setFormState((prev) => {
        const updated = [...prev.clothingVariants];
        updated[variantIndex].sizeStock[sizeIndex] = {
          ...updated[variantIndex].sizeStock[sizeIndex],
          price: value === "" ? "" : Number(value),
        };
        return { ...prev, clothingVariants: updated };
      });
    },
    [],
  );

  const handleDeleteClothingVariant = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      clothingVariants: prev.clothingVariants.filter((_, i) => i !== index),
    }));
  }, []);

  const handleVariantImageUpload = useCallback(
    (
      type: "clothing" | "nonClothing",
      variantIndex: number,
      imageIndex: number,
      file: File,
    ) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setFormState((prev) => {
          if (type === "clothing") {
            const updated = [...prev.clothingVariants];
            if (imageIndex === 0) {
              updated[variantIndex] = {
                ...updated[variantIndex],
                imagePreview: preview,
                imageFile: file,
              };
            } else {
              updated[variantIndex].imageThumbnails[imageIndex] = preview;
              updated[variantIndex].thumbnailFiles[imageIndex] = file;
            }
            return { ...prev, clothingVariants: updated };
          } else {
            const updated = [...prev.nonClothingVariants];
            if (imageIndex === 0) {
              updated[variantIndex] = {
                ...updated[variantIndex],
                imagePreview: preview,
                imageFile: file,
              };
            } else {
              updated[variantIndex].imageThumbnails[imageIndex] = preview;
              updated[variantIndex].thumbnailFiles[imageIndex] = file;
            }
            return { ...prev, nonClothingVariants: updated };
          }
        });
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  // --- Non-Clothing Variant Handlers ---
  const handleAddNonClothingVariant = useCallback(() => {
    const newVariant: NonClothingVariant = {
      design: "",
      price: "",
      imagePreview: "",
      imageFile: null,
      imageThumbnails: ["", "", "", ""],
      thumbnailFiles: [null, null, null, null],
      stock: "",
    };
    setFormState((prev) => ({
      ...prev,
      nonClothingVariants: [...prev.nonClothingVariants, newVariant],
    }));
  }, []);

  const handleNonClothingVariantChange = useCallback(
    (index: number, field: "design" | "stock" | "price", value: string) => {
      setFormState((prev) => {
        const updated = [...prev.nonClothingVariants];
        if (field === "stock" || field === "price") {
          updated[index] = {
            ...updated[index],
            [field]: value === "" ? "" : Number(value),
          };
        } else {
          updated[index] = { ...updated[index], [field]: value };
        }
        return { ...prev, nonClothingVariants: updated };
      });
    },
    [],
  );

  const handleDeleteNonClothingVariant = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      nonClothingVariants: prev.nonClothingVariants.filter(
        (_, i) => i !== index,
      ),
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormState({
      merchName: "",
      description: "",
      merchType: "" as MerchType,
      basePrice: 0,
      s3ImageKey: 0,
      variants: [],
      merchImagePreview: "",
      merchImageFile: null,
      imageThumbnails: ["", "", "", ""],
      thumbnailFiles: [null, null, null, null],
      clothingVariants: [],
      nonClothingVariants: [],
      hasFreebies: false,
      freebieDrafts: [],
      hasFreebie: false,
      freebieConfigs: [],
    });
  }, []);

  const setHasFreebies = useCallback((value: boolean) => {
    setFormState((prev) => ({
      ...prev,
      hasFreebies: value,
      freebieDrafts: value ? prev.freebieDrafts : [],
    }));
  }, []);

  const addFreebieDraft = useCallback((draft: FreebieDraft) => {
    setFormState((prev) => ({
      ...prev,
      freebieDrafts: [...prev.freebieDrafts, draft],
    }));
  }, []);

  const updateFreebieDraft = useCallback((index: number, draft: FreebieDraft) => {
    setFormState((prev) => ({
      ...prev,
      freebieDrafts: prev.freebieDrafts.map((item, idx) =>
        idx === index ? draft : item,
      ),
    }));
  }, []);

  const removeFreebieDraft = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      freebieDrafts: prev.freebieDrafts.filter((_, idx) => idx !== index),
    }));
  }, []);

  const setHasFreebie = useCallback((value: boolean) => {
    setFormState((prev) => ({
      ...prev,
      hasFreebie: value,
      freebieConfigs: value ? prev.freebieConfigs : [],
    }));
  }, []);

  const addFreebieConfig = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      freebieConfigs: [
        ...prev.freebieConfigs,
        {
          displayOrder: prev.freebieConfigs.length,
          category: "CLOTHING",
          freebieName: "",
          clothingSubtype: undefined,
          sizes: [],
          colors: [],
        },
      ],
    }));
  }, []);

  const removeFreebieConfig = useCallback((index: number) => {
    setFormState((prev) => ({
      ...prev,
      freebieConfigs: prev.freebieConfigs
        .filter((_, configIndex) => configIndex !== index)
        .map((config, configIndex) => ({
          ...config,
          displayOrder: configIndex,
        })),
    }));
  }, []);

  const updateFreebieConfig = useCallback(
    (
      index: number,
      patch: Partial<EditableFreebieConfig> & {
        category?: FreebieCategory;
      },
    ) => {
      setFormState((prev) => ({
        ...prev,
        freebieConfigs: prev.freebieConfigs.map((config, configIndex) => {
          if (configIndex !== index) {
            return config;
          }

          if (patch.category && patch.category !== config.category) {
            if (patch.category === "CLOTHING") {
              return {
                ticketFreebieConfigId: config.ticketFreebieConfigId,
                displayOrder: config.displayOrder,
                category: "CLOTHING",
                freebieName: patch.freebieName ?? config.freebieName,
                clothingSubtype: undefined,
                sizes: [],
                colors: [],
              };
            }

            return {
              ticketFreebieConfigId: config.ticketFreebieConfigId,
              displayOrder: config.displayOrder,
              category: "NON_CLOTHING",
              freebieName: patch.freebieName ?? config.freebieName,
              designs: [],
            };
          }

          return { ...config, ...patch } as EditableFreebieConfig;
        }),
      }));
    },
    [],
  );

  const hydrateFreebieConfigs = useCallback(
    (configs: FreebieConfigWithId[]) => {
      setFormState((prev) => ({
        ...prev,
        hasFreebie: configs.length > 0,
        freebieConfigs: configs
          .slice()
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((config, index) => ({
            ...config,
            displayOrder: config.displayOrder ?? index,
            ...(config.category === "CLOTHING"
              ? {
                  sizes: config.sizes || [],
                  colors: config.colors || [],
                }
              : {
                  designs: config.designs || [],
                }),
          })) as EditableFreebieConfig[],
      }));
    },
    [],
  );

  const setFreebieName = useCallback((index: number, name: string) => {
    updateFreebieConfig(index, { freebieName: name });
  }, [updateFreebieConfig]);

  const setFreebieCategory = useCallback(
    (index: number, category: FreebieCategory) => {
      updateFreebieConfig(index, { category });
    },
    [updateFreebieConfig],
  );

  const setClothingSubtype = useCallback(
    (index: number, subtype: ClothingSubtype) => {
      updateFreebieConfig(index, { clothingSubtype: subtype });
    },
    [updateFreebieConfig],
  );

  const setFreebieSizes = useCallback((index: number, sizes: string[]) => {
    updateFreebieConfig(index, { sizes });
  }, [updateFreebieConfig]);

  const setFreebieColors = useCallback((index: number, colors: string[]) => {
    updateFreebieConfig(index, { colors });
  }, [updateFreebieConfig]);

  const setFreebieDesigns = useCallback((index: number, designs: string[]) => {
    updateFreebieConfig(index, { designs });
  }, []);

  const getMerchRequest = useCallback((): MerchRequest => {
    return convertFormStateToMerchRequest(formState);
  }, [formState]);

  return {
    formState,
    getMerchRequest,
    setMerchName,
    setDescription,
    setMerchType,
    setBasePrice,
    handleMerchImageUpload,
    handleAddClothingVariant,
    handleClothingVariantChange,
    handleSizeCheckChange,
    handleStockQuantityChange,
    handlePriceChangeForSize,
    handleDeleteClothingVariant,
    handleVariantImageUpload,
    handleAddNonClothingVariant,
    handleNonClothingVariantChange,
    handleDeleteNonClothingVariant,
    setHasFreebies,
    addFreebieDraft,
    updateFreebieDraft,
    removeFreebieDraft,
    resetForm,
    setHasFreebie,
    addFreebieConfig,
    removeFreebieConfig,
    hydrateFreebieConfigs,
    setFreebieCategory,
    setFreebieName,
    setClothingSubtype,
    setFreebieSizes,
    setFreebieColors,
    setFreebieDesigns,
  };
};
