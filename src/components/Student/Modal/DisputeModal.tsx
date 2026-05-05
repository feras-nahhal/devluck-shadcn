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

import { useStudentDisputeHandler } from "@/hooks/studentapihandler/useStudentDisputeHandler";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";

interface ContractDispute {
  reason: string;
  note: string;
}

interface ContractDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  onSuccess?: () => void;
}

const DisputeModal: React.FC<ContractDisputeModalProps> = ({
  isOpen,
  onClose,
  contractId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ContractDispute>({
    reason: "",
    note: "",
  });

  const { createDispute, loading } = useStudentDisputeHandler();

  // ✅ VALIDATION STATES
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Validation function
  const validateForm = useCallback((data: ContractDispute): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (!data.reason?.trim()) newErrors.reason = "Please select a dispute reason";
    if (data.note?.trim().length && data.note.trim().length < 10) {
      newErrors.note = "Note must be at least 10 characters";
    }

    const isValid = Object.keys(newErrors).length === 0;
    return { isValid, errors: newErrors };
  }, []);

  // ✅ Debounced validation
  const triggerValidation = useCallback((data: ContractDispute) => {
    if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
    
    validationTimeoutRef.current = setTimeout(() => {
      const result = validateForm(data);
      setErrors(result.errors);
      setIsFormValid(result.isValid);
    }, 100);
  }, [validateForm]);

  useEffect(() => {
    if (isOpen) {
      setFormData({ reason: "", note: "" });
      setErrors({});
      setTouched({});
      setIsFormValid(false);
      setSubmitError(null);
      setSubmitSuccess(false);
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
    }
  }, [isOpen]);

  // ✅ Enhanced change handler
  const handleInputChange = (field: keyof ContractDispute, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      triggerValidation(newData);
      return newData;
    });
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({ reason: true, note: true });

    const result = validateForm(formData);
    setErrors(result.errors);
    setIsFormValid(result.isValid);

    if (!result.isValid) {
      setSubmitError("Please fill in all required fields correctly");
      return;
    }

    try {
      await createDispute(contractId, {
        reason: formData.reason.trim(),
        note: formData.note.trim() || undefined,  // ✅ Fixed syntax error
      });

      setSubmitSuccess(true);
      setSubmitError(null);

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to file dispute");
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Send Contract Dispute</DialogTitle>
          <DialogDescription>
            Report an issue with this contract. The dispute will be reviewed by the company or system admin.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">

            {/* ✅ Reason with validation */}
            <ParallelogramSelect
              label="Select Reason"
              placeholder="Choose dispute reason"
              value={formData.reason}
              error={touched.reason && errors.reason || ""}
              options={[
                "Payment Issue",
                "Contract Terms", 
                "Work Scope Disagreement",
                "Delay / Deadline Issue",
                "Other",
              ]}
              onChange={(value) => handleInputChange("reason", value)}
            />

            {/* ✅ Note with validation */}
            <ParallelogramInput
              label="Note"
              placeholder="Write your dispute details here..."
              value={formData.note}
              type="textarea"
              error={touched.note && errors.note || ""}
              onChange={(e) => handleInputChange("note", e.target.value)}
            />

            {/* ✅ Submit Error */}
            {submitError && !submitSuccess && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {submitError}
              </div>
            )}

            {/* Success */}
            {submitSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
                ✓ Dispute filed successfully! The company will be notified.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading || submitSuccess}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleSubmit}
            disabled={loading || submitSuccess || !isFormValid}
            className={`transition-all ${loading || submitSuccess || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : submitSuccess ? (
              "Sent ✓"
            ) : (
              "Send Dispute"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeModal;