"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";

/* ---------------- Types ---------------- */

interface ContractData {
  name: string;
  contractTitle: string;
  currency: string;
  duration: string;
  monthlyAllowance?: string;
  workLocation: "Hybrid" | "Remote" | "Onsite";
  status: "Active" | "Inactive" | "Draft";
}

interface ContractModalProps {
  contract?: ContractData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContractData) => Promise<void> | void;
}

const ContractModal: React.FC<ContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ContractData>({
    name: "",
    contractTitle: "",
    currency: "",
    duration: "",
    monthlyAllowance: "",
    workLocation: "Hybrid",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Duration state
  const [durationValue, setDurationValue] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<"day" | "month" | "year">("month");

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  /* ---------------- Build duration ---------------- */
  const buildDuration = () => `${durationValue} ${durationUnit}${durationValue > 1 ? "s" : ""}`;

  /* ---------------- Validation ---------------- */
  const validateForm = useCallback((data: ContractData = formData): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!data.name.trim()) newErrors.name = "Template name is required";
    if (!data.contractTitle.trim()) newErrors.contractTitle = "Contract title is required";
    if (!data.currency) newErrors.currency = "Currency is required";
    if (!data.status) newErrors.status = "Status is required";
    
    // Duration validation
    if (durationValue <= 0) newErrors.durationValue = "Duration must be greater than 0";

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  }, [formData, durationValue]);

  /* ---------------- Load / Reset ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    const isEditing = !!(contract as any)?.id;
    
    if (contract && isEditing) {
      setFormData({
        name: contract.name || "",
        contractTitle: contract.contractTitle || "",
        currency: contract.currency || "",
        duration: contract.duration || "",
        monthlyAllowance: contract.monthlyAllowance ?? "",
        workLocation: contract.workLocation || "Hybrid",
        status: contract.status || "Active",
      });

      if (contract.duration) {
        const match = contract.duration.match(/(\d+)\s*(day|month|year)s?/i);
        if (match) {
          setDurationValue(Number(match[1]));
          setDurationUnit(match[2].toLowerCase() as "day" | "month" | "year");
        }
      }
    } else {
      setFormData({
        name: "",
        contractTitle: "",
        currency: "",
        duration: "",
        monthlyAllowance: "",
        workLocation: "Hybrid",
        status: "Active",
      });
      setDurationValue(1);
      setDurationUnit("month");
    }
    
    // Reset states first
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setIsFormValid(false);
    
  }, [contract, isOpen]); // 🔥 REMOVED validateForm from deps

  // 🔥 SEPARATE useEffect for validation after load
  useEffect(() => {
    if (!isOpen) return;
    
    // Validate 200ms after form data changes
    const timeout = setTimeout(() => {
      validateForm();
    }, 200);
    
    return () => clearTimeout(timeout);
  }, [formData, durationValue, durationUnit, isOpen]);

  /* ---------------- Input handler ---------------- */
  const handleInputChange = (field: keyof ContractData, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Re-validate after change
    setTimeout(() => validateForm({ ...formData, [field]: value } as ContractData), 0);
  };

  const handleDurationChange = (value: number) => {
    setTouched((prev) => ({ ...prev, durationValue: true }));
    setDurationValue(value);
    setTimeout(() => validateForm(formData), 0);
  };

  const handleDurationUnitChange = (unit: "day" | "month" | "year") => {
    setTouched((prev) => ({ ...prev, durationUnit: true }));
    setDurationUnit(unit);
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    // Mark all fields as touched
    const allTouched = {
      name: true, contractTitle: true, currency: true,
      status: true, durationValue: true
    };
    setTouched(allTouched);

    if (!validateForm()) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const payload: ContractData = {
        ...formData,
        duration: buildDuration(),
      };

      await onSave(payload);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || "Failed to save contract template");
      console.error("Failed to save contract:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{contract ? "Edit Template" : "Create Template"}</DialogTitle>
          <DialogDescription>
            {contract
              ? "Update this contract template."
              : "Create a reusable contract template."}
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {submitError && (
          <div className="mx-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Template Name */}
          <ParallelogramInput
            label="Template Name *"
            placeholder="Enter template name"
            value={formData.name}
            error={touched.name && errors.name ||""}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />

          {/* Contract Title */}
          <ParallelogramInput
            label="Contract Title *"
            placeholder="Enter contract title"
            value={formData.contractTitle}
            error={touched.contractTitle && errors.contractTitle||""}
            onChange={(e) => handleInputChange("contractTitle", e.target.value)}
          />

          {/* Duration */}
          <div className="flex gap-3">
            <ParallelogramInput
              label="Duration *"
              placeholder="Enter number"
              type="number"
              value={durationValue}
              error={touched.durationValue && errors.durationValue||""}
              onChange={(e) => handleDurationChange(Number(e.target.value) || 0)}
            />
            <ParallelogramSelect
              label="Unit"
              placeholder="Unit"
              value={durationUnit}
              options={["day", "month", "year"]}
              onChange={(val) => handleDurationUnitChange(val as "day" | "month" | "year")}
            />
          </div>
          <div className="text-sm text-gray-500 ml-1">
            Current: {buildDuration()}
          </div>

          {/* Work Location */}
          <ParallelogramSelect
            label="Work Location"
            placeholder="Select location"
            value={formData.workLocation}
            options={["Hybrid", "Remote", "Onsite"]}
            onChange={(val) => handleInputChange("workLocation", val)}
          />

          {/* Monthly Allowance & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ParallelogramInput
              label="Monthly Allowance"
              placeholder="Enter amount (optional)"
              value={formData.monthlyAllowance || ""}
              onChange={(e) => handleInputChange("monthlyAllowance", e.target.value)}
            />
            <ParallelogramSelect
              label="Currency *"
              placeholder="Select currency"
              value={formData.currency}
              error={touched.currency && errors.currency ||""}
              options={["USD", "EUR", "SAR"]}
              onChange={(val) => handleInputChange("currency", val)}
            />
          </div>

          {/* Status */}
          <ParallelogramSelect
            label="Status *"
            placeholder="Select status"
            value={formData.status}
            error={touched.status && errors.status ||""}
            options={["Active", "Inactive", "Draft"]}
            onChange={(val) => handleInputChange("status", val)}
          />
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
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : contract ? (
              "Update Template"
            ) : (
              "Create Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractModal;