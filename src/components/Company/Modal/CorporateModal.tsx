"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";

interface CorporateData {
  description: string;
  id?: string;
}

interface CorporateModalProps {
  Corporate?: CorporateData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CorporateData) => void;
}

const CorporateModal: React.FC<CorporateModalProps> = ({
  Corporate,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<CorporateData>({
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  /* ---------------- Validation ---------------- */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const trimmedDesc = formData.description.trim();
    if (!trimmedDesc) {
      newErrors.description = "Description is required";
    } else if (trimmedDesc.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  }, [formData.description]);

  useEffect(() => {
    if (Corporate) {
      setFormData(Corporate);
    } else {
      setFormData({ description: "" });
    }
    
    // Reset validation states
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setIsFormValid(false);
  }, [Corporate, isOpen]);

  // Auto-validate after data changes
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(validateForm, 200);
    return () => clearTimeout(timeout);
  }, [formData.description, isOpen, validateForm]);

  const handleInputChange = (field: keyof CorporateData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setTouched({ description: true });

    if (!validateForm()) {
      setSubmitError("Please enter a valid description");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      // Trim description before save
      const payload = {
        ...formData,
        description: formData.description.trim(),
      };
      
      await onSave(payload);
      onClose();
    } catch (error: any) {
      console.error(error);
      setSubmitError(error.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Simple counter (0 to 10)
  const charCount = formData.description.trim().length;
  const isValid = charCount >= 10;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {Corporate ? "Edit Corporate Description" : "Add Corporate Description"}
          </DialogTitle>
          <DialogDescription>
            {Corporate
              ? "Update the description for this corporate entity."
              : "Add a description to define this corporate entity."}
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {submitError && (
          <div className="mx-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        {/* Scrollable Content ONLY */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-2">
            <ParallelogramInput
              label="Description *"
              placeholder="Enter description (minimum 50 characters)"
              value={formData.description}
              type="textarea"
              error={touched.description && errors.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />

            {/* 🔥 SIMPLE COUNTER 0 to 10 - Red/Green */}
            <div className="text-right">
              <span 
                className={`text-md font-bold ${
                  isValid 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}
              >
                {charCount}/50
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className={`transition-all ${
              loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : Corporate ? (
              "Update"
            ) : (
              "Add"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CorporateModal;