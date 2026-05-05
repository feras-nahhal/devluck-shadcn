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

interface ProgramsData {
  Program: string[];
}

interface ProgramsModalProps {
  Program?: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProgramsData) => void;
}

const ProgramsModal: React.FC<ProgramsModalProps> = ({
  Program,
  isOpen,
  onClose,
  onSave,
}) => {
  const [programText, setProgramText] = useState("");
  const [loading, setLoading] = useState(false);

  // OPTIMIZED VALIDATION STATES
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Lightweight validation - at least one program required
  const validateForm = useCallback((value: string) => {
    const newErrors: Record<string, string> = {};
    
    const programsArray = Array.from(
      new Set(
        value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );

    if (programsArray.length === 0) {
      newErrors.programs = "At least one program is required";
    }

    const isValid = Object.keys(newErrors).length === 0;
    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  }, []);

  // Fast input handler - NO real-time validation
  const handleInputChange = useCallback((value: string) => {
    setTouched((prev) => ({ ...prev, programs: true }));
    setProgramText(value);
  }, []);

  // Validate only onBlur
  const handleBlur = useCallback(() => {
    validateForm(programText);
  }, [programText, validateForm]);

  useEffect(() => {
    if (isOpen) {
      const incoming = Program ?? [];
      const initialText = incoming.join(", ");
      setProgramText(initialText);
      setTouched({});
      validateForm(initialText);
      setSubmitError(null);
    }
  }, [Program, isOpen, validateForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ programs: true });
    const isValid = validateForm(programText);
    
    if (!isValid) {
      setSubmitError("Please add at least one program");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const parsed = Array.from(
        new Set(
          programText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      );

      await onSave({ Program: parsed });
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || "Failed to save programs");
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
            {Program && Program.length > 0 ? "Edit Programs" : "Add Programs"}
          </DialogTitle>

          <DialogDescription>
            {Program && Program.length > 0
              ? "Update the programs your company offers."
              : "Add programs your company offers such as Internship, Full-time, Part-time."}
          </DialogDescription>
        </DialogHeader>

        {submitError && (
          <div className="px-6 pt-4 pb-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <form
          id="programsForm"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 px-6 py-4 overflow-y-auto"
        >
          <div className="flex flex-col gap-3">
            <ParallelogramInput
              label="Programs"
              placeholder="Ex: Internship, Full-time, Part-time"
              value={programText}
              error={touched.programs && errors.programs || ""}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleBlur}
            />

            <p className="text-xs text-muted-foreground">
              Add multiple programs separated by commas (at least one required)
            </p>
          </div>
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
            form="programsForm" 
            disabled={loading || !isFormValid}
            className={`transition-all ${loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : Program && Program.length > 0 ? (
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

export default ProgramsModal;