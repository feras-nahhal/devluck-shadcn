"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";
import DatePickerField from "@/components/common/DatePickerField";

interface ExperienceData {
  companyName: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  id?: string;
}

interface ExperienceModalProps {
  experience?: ExperienceData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExperienceData) => void;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({
  experience,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ExperienceData>({
    companyName: "",
    role: "",
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
    companyName: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
  }), []);

  // Lightweight validation
  const validateForm = useCallback((data: ExperienceData) => {
    const newErrors: Record<string, string> = {};

    if (!data.companyName?.trim()) newErrors.companyName = "Company name is required";
    if (!data.role?.trim()) newErrors.role = "Role is required";
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
  const handleInputChange = useCallback((field: keyof ExperienceData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validate only onBlur
  const handleBlur = useCallback((field: keyof ExperienceData) => {
    validateForm(formData);
  }, [formData, validateForm]);

  useEffect(() => {
    if (isOpen) {
      if (experience) {
        setFormData(experience);
        setTouched({});
        validateForm(experience);  // Single validation
      } else {
        setFormData(emptyForm);
        setErrors({});
        setTouched({});
        setIsFormValid(false);
      }
      setSubmitError(null);
    }
  }, [experience, isOpen, validateForm, emptyForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allTouched = {
      companyName: true,
      role: true,
      startDate: true,
      endDate: true,
      description: true
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
      setSubmitError(error.message || "Failed to save experience");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{experience ? "Edit Experience" : "Add Experience"}</DialogTitle>
          <DialogDescription>
            {experience
              ? "Update your work experience details such as role, company, and duration."
              : "Add your work experience including role, company, and employment period."}
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
          id="experienceForm"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 px-6 py-4 overflow-y-auto"
        >
          <ParallelogramInput
            label="Company Name"
            placeholder="Enter company name"
            value={formData.companyName}
            error={touched.companyName && errors.companyName ||""}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
            onBlur={() => handleBlur("companyName")}
          />

          <ParallelogramInput
            label="Role"
            placeholder="Enter role"
            value={formData.role}
            error={touched.role && errors.role ||""}
            onChange={(e) => handleInputChange("role", e.target.value)}
            onBlur={() => handleBlur("role")}
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
            form="experienceForm" 
            disabled={loading || !isFormValid}
            className={`transition-all ${loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : experience ? (
              "Update Experience"
            ) : (
              "Add Experience"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExperienceModal;