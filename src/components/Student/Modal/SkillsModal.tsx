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

interface SkillsData {
  skills: string[];
}

interface SkillsModalProps {
  skills?: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SkillsData) => void;
}

const SkillsModal: React.FC<SkillsModalProps> = ({
  skills,
  isOpen,
  onClose,
  onSave,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  // OPTIMIZED VALIDATION STATES
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Lightweight validation - at least one skill required
  const validateForm = useCallback((value: string) => {
    const newErrors: Record<string, string> = {};
    
    const skillsArray = Array.from(
      new Set(
        value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );

    if (skillsArray.length === 0) {
      newErrors.skills = "At least one skill is required";
    }

    const isValid = Object.keys(newErrors).length === 0;
    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  }, []);

  // Fast input handler - NO real-time validation
  const handleInputChange = useCallback((value: string) => {
    setTouched((prev) => ({ ...prev, skills: true }));
    setInputValue(value);
  }, []);

  // Validate only onBlur
  const handleBlur = useCallback(() => {
    validateForm(inputValue);
  }, [inputValue, validateForm]);

  useEffect(() => {
    if (isOpen) {
      const initialSkills = (skills ?? []).join(", ");
      setInputValue(initialSkills);
      setTouched({});
      validateForm(initialSkills);
      setSubmitError(null);
    }
  }, [skills, isOpen, validateForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ skills: true });
    const isValid = validateForm(inputValue);
    
    if (!isValid) {
      setSubmitError("Please add at least one skill");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const skillsArray = Array.from(
        new Set(
          inputValue
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      );

      await onSave({ skills: skillsArray });
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || "Failed to save skills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">

        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            {skills && skills.length > 0 ? "Edit Skills" : "Add Skills"}
          </DialogTitle>

          <DialogDescription>
            {skills && skills.length > 0
              ? "Update your technical and professional skills."
              : "Add your technical and professional skills such as React, Node.js, or UI/UX design."}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="px-6 pt-4 pb-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        {/* Body */}
        <form
          id="skillsForm"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 px-6 py-4 overflow-y-auto"
        >
          <ParallelogramInput
            label="Skills"
            placeholder="Ex: HTML, CSS, PHP, JavaScript, React"
            value={inputValue}
            error={touched.skills && errors.skills || ""}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleBlur}
          />

          <span className="text-xs text-muted-foreground">
            Add multiple skills separated by comma (at least one required)
          </span>
        </form>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>

          <Button 
            type="submit" 
            form="skillsForm" 
            disabled={loading || !isFormValid}
            className={`transition-all ${loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : skills && skills.length > 0 ? (
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

export default SkillsModal;