"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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

interface LanguageData {
  id?: string;
  name: string;
  level: string;
}

interface LanguageModalProps {
  language?: LanguageData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LanguageData) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({
  language,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<LanguageData>({
    name: "",
    level: "",
  });

  const [loading, setLoading] = useState(false);

  // OPTIMIZED VALIDATION STATES
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emptyForm = useMemo(() => ({
    name: "",
    level: "",
  }), []);

  // Lightweight validation
  const validateForm = useCallback((data: LanguageData) => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) newErrors.name = "Language name is required";
    if (!data.level?.trim()) newErrors.level = "Please select a proficiency level";

    const isValid = Object.keys(newErrors).length === 0;
    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  }, []);

  // Fast input handler - NO real-time validation
  const handleInputChange = useCallback((field: keyof LanguageData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validate only onBlur
  const handleBlur = useCallback((field: keyof LanguageData) => {
    validateForm(formData);
  }, [formData, validateForm]);

  useEffect(() => {
    if (isOpen) {
      if (language) {
        setFormData(language);
        setTouched({});
        validateForm(language);  // Single validation
      } else {
        setFormData(emptyForm);
        setErrors({});
        setTouched({});
        setIsFormValid(false);
      }
      setSubmitError(null);
    }
  }, [language, isOpen, validateForm, emptyForm]);

  const handleSubmit = async () => {
    const allTouched = { name: true, level: true };
    setTouched(allTouched);
    
    const isValid = validateForm(formData);
    
    if (!isValid) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || "Failed to save language");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{language ? "Edit Language" : "Add Language"}</DialogTitle>
          <DialogDescription>
            {language
              ? "Update language name and proficiency level."
              : "Add a language you speak and specify your proficiency level."}
          </DialogDescription>
        </DialogHeader>

        {/* Submit Error */}
        {submitError && (
          <div className="px-6 pt-4 pb-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {/* Level */}
          <ParallelogramSelect
            label="Proficiency Level"
            placeholder="Select level"
            value={formData.level}
            error={touched.level && errors.level ||""}
            options={["Basic", "Conversational", "Fluent", "Native"]}
            onChange={(value) => handleInputChange("level", value)}
          />

          {/* Language Name */}
          <ParallelogramInput
            label="Language Name"
            placeholder="Enter language name (e.g., English, Spanish, Mandarin)"
            value={formData.name}
            error={touched.name && errors.name ||""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
          />
        </div>

        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !isFormValid}
            className={`transition-all ${loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : language ? (
              "Update Language"
            ) : (
              "Add Language"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageModal;