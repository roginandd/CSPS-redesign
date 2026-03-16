import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createMerch } from "../../../../api/merch";
import { useMerchForm } from "../../../../hooks/useMerchForm";
import MerchInfoStep from "./MerchInfoStep";
import VariantStep from "./VariantStep";
import type {
  MerchInfoActions,
  VariantActions,
} from "./productForm.types";
import { validateMerchInfo, validateVariants } from "../util/validation";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    formState,
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
    resetForm,
  } = useMerchForm();

  const handleClose = useCallback(() => {
    resetForm();
    setCurrentStep(1);
    setValidationErrors({});
    setSubmitError(null);
    onClose();
  }, [onClose, resetForm]);

  const handleNextStep = useCallback(() => {
    const validation = validateMerchInfo(formState);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors({});
    setCurrentStep(2);
  }, [formState]);

  const handleBackStep = useCallback(() => {
    setCurrentStep(1);
    setValidationErrors({});
  }, []);

  const handleSuccessDismiss = useCallback(() => {
    setShowSuccessModal(false);
    handleClose();
    onSuccess?.();
  }, [handleClose, onSuccess]);

  const handleSubmit = useCallback(async () => {
    const variantValidation = validateVariants(formState);
    if (!variantValidation.isValid) {
      setValidationErrors(variantValidation.errors);
      setSubmitError("Please fix all validation errors before proceeding");
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    setValidationErrors({});

    try {
      const result = await createMerch(formState);

      if (result.success) {
        resetForm();
        setCurrentStep(1);
        setValidationErrors({});
        setShowSuccessModal(true);
      } else {
        const message = result.error || "Failed to create product";
        setSubmitError(message);
        toast.error(message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formState, resetForm]);

  useEffect(() => {
    if (!isOpen && !showSuccessModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (showSuccessModal) {
        handleSuccessDismiss();
        return;
      }

      handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, handleSuccessDismiss, isOpen, showSuccessModal]);

  if (!isOpen && !showSuccessModal) return null;

  const stepContent = {
    1: {
      title: "Create Product",
      description: "Add the core merchandise details before setting up variants.",
    },
    2: {
      title: "Set Up Variants",
      description: "Configure stock, prices, and options for each product variant.",
    },
  } as const;

  const merchInfoActions: MerchInfoActions = {
    setMerchName,
    setDescription,
    setMerchType,
    setBasePrice,
    uploadMerchImage: handleMerchImageUpload,
    goToVariants: handleNextStep,
  };

  const variantActions: VariantActions = {
    goBack: handleBackStep,
    addClothingVariant: handleAddClothingVariant,
    addNonClothingVariant: handleAddNonClothingVariant,
    updateClothingVariant: handleClothingVariantChange,
    updateNonClothingVariant: handleNonClothingVariantChange,
    toggleSize: handleSizeCheckChange,
    updateSizeStock: handleStockQuantityChange,
    updateSizePrice: handlePriceChangeForSize,
    uploadVariantImage: handleVariantImageUpload,
    removeClothingVariant: handleDeleteClothingVariant,
    removeNonClothingVariant: handleDeleteNonClothingVariant,
    submit: handleSubmit,
  };

  const StepIndicator = () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[
        {
          step: 1,
          label: "Product Info",
          description: "Name, category, image, and description",
        },
        {
          step: 2,
          label: "Variants",
          description: "Stock levels, prices, and product options",
        },
      ].map(({ step, label, description }) => {
        const isActive = currentStep === step;
        const isComplete = currentStep > step;

        return (
          <div
            key={step}
            className={`rounded-xl border px-4 py-4 transition-colors sm:px-5 ${
              isActive
                ? "border-purple-500/35 bg-purple-500/10"
                : isComplete
                  ? "border-white/10 bg-[#1a1635]"
                  : "border-white/10 bg-[#140f33]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-white/45">
                  Step {step}
                </p>
                <p
                  className={`mt-2 text-sm font-semibold sm:text-base ${
                    isActive || isComplete ? "text-white" : "text-white/70"
                  }`}
                >
                  {label}
                </p>
                <p className="mt-1 text-sm leading-5 text-white/55">
                  {description}
                </p>
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                  isActive
                    ? "border-purple-500/35 bg-purple-500/15 text-white"
                    : isComplete
                      ? "border-white/10 bg-[#241d49] text-white"
                      : "border-white/10 bg-[#181238] text-white/50"
                }`}
              >
                {step.toString().padStart(2, "0")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const SuccessModal = ({ isSuccess }: { isSuccess: boolean }) =>
    isSuccess && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-success-title"
          className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#110e31] p-6 shadow-2xl shadow-black/50 sm:p-8"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-white/45">
            Product Added
          </p>
          <h3
            id="product-success-title"
            className="mt-3 text-2xl font-bold text-white"
          >
            Product created successfully.
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/65 sm:text-base">
            The product has been added to the catalog and is ready for inventory
            management.
          </p>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSuccessDismiss}
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-900/30 transition-colors hover:bg-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#110e31]"
              type="button"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <>
      <SuccessModal isSuccess={showSuccessModal} />
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm sm:p-6">
          <div className="flex min-h-full items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
              aria-describedby="product-modal-description"
              className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-[#110e31] text-white shadow-2xl shadow-black/50 animate-in fade-in zoom-in duration-300"
            >
              <div className="border-b border-white/10 px-6 py-5 md:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-white/45">
                      Product Setup
                    </p>
                    <h2
                      id="product-modal-title"
                      className="mt-2 text-2xl font-bold text-white"
                    >
                      {stepContent[currentStep].title}
                    </h2>
                    <p
                      id="product-modal-description"
                      className="mt-2 max-w-2xl text-sm leading-6 text-white/65"
                    >
                      {stepContent[currentStep].description}
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="shrink-0 self-start rounded-lg border border-white/10 bg-[#1a1635] px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/15 hover:bg-[#241d49] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#110e31]"
                    aria-label="Close product modal"
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="border-b border-white/10 px-6 py-4 md:px-8">
                <StepIndicator />
              </div>

              <div className="max-h-[72vh] overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent md:px-8 md:py-8">
                {submitError && (
                  <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-4">
                    <p className="text-sm font-medium text-red-300">
                      We couldn&apos;t create the product yet.
                    </p>
                    <p className="mt-1 text-sm leading-6 text-red-200/80">
                      {submitError}
                    </p>
                  </div>
                )}

                {currentStep === 1 && (
                  <MerchInfoStep
                    formState={formState}
                    errors={validationErrors}
                    actions={merchInfoActions}
                  />
                )}

                {currentStep === 2 && (
                  <VariantStep
                    formState={formState}
                    errors={validationErrors}
                    isLoading={isLoading}
                    actions={variantActions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductModal;
