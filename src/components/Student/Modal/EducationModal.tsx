"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import DatePickerField from "@/components/common/DatePickerField";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";

interface EducationData {
  name: string;
  major: string;
  startDate: string;
  endDate: string;
  description: string;
  id?: string;
}

interface EducationModalProps {
  education?: EducationData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EducationData) => void;
}

const EducationModal: React.FC<EducationModalProps> = ({
  education,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<EducationData>({
    name: "",
    major: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  // OPTIMIZED VALIDATION STATES
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emptyForm = useMemo(() => ({
    name: "",
    major: "",
    startDate: "",
    endDate: "",
    description: "",
  }), []);

  // Lightweight validation
  const validateForm = useCallback((data: EducationData) => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) newErrors.name = "University name is required";
    if (!data.major?.trim()) newErrors.major = "Major is required";
    if (!data.startDate?.trim()) newErrors.startDate = "Start date is required";
    if (!data.endDate?.trim()) newErrors.endDate = "End date is required";

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) newErrors.endDate = "End date cannot be before start date";
    }

    if (data.description?.trim().length && data.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    const isValid = Object.keys(newErrors).length === 0;
    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  }, []);

  // Fast input handler - NO real-time validation
  const handleInputChange = useCallback((field: keyof EducationData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validate only onBlur
  const handleBlur = useCallback((field: keyof EducationData) => {
    validateForm(formData);
  }, [formData, validateForm]);

  useEffect(() => {
    if (isOpen) {
      if (education) {
        setFormData(education);
        setTouched({});
        validateForm(education);  // Single validation
      } else {
        setFormData(emptyForm);
        setErrors({});
        setTouched({});
        setIsFormValid(false);
      }
      setSubmitError(null);
    }
  }, [education, isOpen, validateForm, emptyForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allTouched = {
      name: true, major: true, startDate: true, endDate: true, description: true
    };
    setTouched(allTouched);
    
    const isValid = validateForm(formData);
    
    if (!isValid) {
      setSubmitError("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || "Failed to save education");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{education ? "Edit Education" : "Add Education"}</DialogTitle>
          <DialogDescription>
            {education
              ? "Update your education details such as degree, institution, and dates."
              : "Add your education background including degree, institution, and graduation year."}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="px-6 pt-4 pb-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        <form
          id="educationForm"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 px-6 py-4 overflow-y-auto"
        >
          <ParallelogramInput
            label="University Name"
            placeholder="Enter university name"
            value={formData.name}
            error={touched.name && errors.name||""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
          />

          <ParallelogramInput
            label="Major"
            placeholder="Enter major"
            value={formData.major}
            error={touched.major && errors.major ||""}
            onChange={(e) => handleInputChange("major", e.target.value)}
            onBlur={() => handleBlur("major")}
          />

          <ParallelogramInput
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            error={touched.description && errors.description ||""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            onBlur={() => handleBlur("description")}
          />

          <DatePickerField
            label="Start Date"
            value={formData.startDate}
            error={touched.startDate && errors.startDate ||""}
            onChange={(v) => handleInputChange("startDate", v)}
          />

          <DatePickerField
            label="End Date"
            value={formData.endDate}
            error={touched.endDate && errors.endDate ||""}
            onChange={(v) => handleInputChange("endDate", v)}
          />
        </form>

        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>

          <Button 
            type="submit" 
            form="educationForm" 
            disabled={loading || !isFormValid}
            className={`transition-all ${loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : education ? (
              "Update Education"
            ) : (
              "Add Education"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EducationModal;