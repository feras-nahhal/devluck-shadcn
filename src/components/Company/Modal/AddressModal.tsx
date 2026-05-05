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

interface AddressData {
  name: string;
  tag: string;
  address: string;
  phoneNumber: string;
  id?: string;
}

interface AddressModalProps {
  Address?: AddressData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddressData) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
  Address,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<AddressData>({
    name: "",
    tag: "",
    address: "",
    phoneNumber: "",
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

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.tag.trim()) newErrors.tag = "Tag is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    
    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = "Enter valid phone number";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  useEffect(() => {
    if (Address) {
      setFormData(Address);
    } else {
      setFormData({ name: "", tag: "", address: "", phoneNumber: "" });
    }
    
    // Reset validation states
    setErrors({});
    setTouched({});
    setSubmitError(null);
    setIsFormValid(false);
  }, [Address, isOpen]);

  // Auto-validate after data changes
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(validateForm, 200);
    return () => clearTimeout(timeout);
  }, [formData, isOpen, validateForm]);

  const handleInputChange = (field: keyof AddressData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      tag: true,
      address: true,
      phoneNumber: true,
    });

    if (!validateForm()) {
      setSubmitError("Please fill all required fields correctly");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      // Trim all string fields
      const payload: AddressData = {
        id: formData.id,
        name: formData.name.trim(),
        tag: formData.tag.trim(),
        address: formData.address.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      };
      
      await onSave(payload);
      onClose();
    } catch (error: any) {
      console.error(error);
      setSubmitError(error.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{Address ? "Edit Address" : "Add Address"}</DialogTitle>
          <DialogDescription>
            {Address
              ? "Update your address details below. Make sure the information is accurate."
              : "Add a new address so we can use it for delivery and billing purposes."}
          </DialogDescription>
        </DialogHeader>

        {/* Error Display */}
        {submitError && (
          <div className="mx-6 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">
            <ParallelogramInput
              label="Name *"
              placeholder="Enter address name (e.g., Headquarters)"
              value={formData.name}
              error={touched.name && errors.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />

            <ParallelogramInput
              label="Tag *"
              placeholder="Enter tag (e.g., Office, Branch)"
              value={formData.tag}
              error={touched.tag && errors.tag || ""}
              onChange={(e) => handleInputChange("tag", e.target.value)}
            />

            <ParallelogramInput
              label="Address *"
              placeholder="Enter full address"
              value={formData.address}
              type="textarea"
              error={touched.address && errors.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />

            <ParallelogramInput
              label="Phone Number *"
              placeholder="Enter phone number (e.g., +1234567890)"
              value={formData.phoneNumber}
              error={touched.phoneNumber && errors.phoneNumber || ""}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
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
            ) : Address ? (
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

export default AddressModal;