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

interface PortfolioData {
  id?: string;
  name: string;
  link: string;
}

interface PortfolioModalProps {
  portfolio?: PortfolioData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PortfolioData) => void;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({
  portfolio,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<PortfolioData>({
    name: "",
    link: "",
  });

  const [loading, setLoading] = useState(false);

  // OPTIMIZED VALIDATION STATES
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emptyForm = useMemo(() => ({
    name: "",
    link: "",
  }), []);

  // Lightweight validation
  const validateForm = useCallback((data: PortfolioData) => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) newErrors.name = "Portfolio name is required";
    if (!data.link?.trim()) {
      newErrors.link = "Link is required";
    } else {
      // Basic URL validation
      try {
        new URL(data.link);
      } catch {
        newErrors.link = "Please enter a valid URL (e.g., https://github.com/username/project)";
      }
    }

    const isValid = Object.keys(newErrors).length === 0;
    setErrors(newErrors);
    setIsFormValid(isValid);
    return isValid;
  }, []);

  // Fast input handler - NO real-time validation
  const handleInputChange = useCallback((field: keyof PortfolioData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Validate only onBlur
  const handleBlur = useCallback((field: keyof PortfolioData) => {
    validateForm(formData);
  }, [formData, validateForm]);

  useEffect(() => {
    if (isOpen) {
      if (portfolio) {
        setFormData(portfolio);
        setTouched({});
        validateForm(portfolio);  // Single validation
      } else {
        setFormData(emptyForm);
        setErrors({});
        setTouched({});
        setIsFormValid(false);
      }
      setSubmitError(null);
    }
  }, [portfolio, isOpen, validateForm, emptyForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const allTouched = { name: true, link: true };
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
      setSubmitError(error.message || "Failed to save portfolio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{portfolio ? "Edit Portfolio" : "Add Portfolio"}</DialogTitle>
          <DialogDescription>
            {portfolio
              ? "Update your project links such as GitHub, LinkedIn, and live demo URLs."
              : "Add your project and include links like GitHub, LinkedIn, or a live demo to showcase your work."}
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

        <form
          id="portfolioForm"
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col gap-4 px-6 py-4 overflow-y-auto"
        >
          <ParallelogramInput
            label="Portfolio Name"
            placeholder="e.g., E-commerce Website, Portfolio App"
            value={formData.name}
            error={touched.name && errors.name ||""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
          />

          <ParallelogramInput
            label="Link / URL"
            placeholder="https://github.com/username/project or https://yourapp.com"
            value={formData.link}
            error={touched.link && errors.link ||""}
            onChange={(e) => handleInputChange("link", e.target.value)}
            onBlur={() => handleBlur("link")}
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
            form="portfolioForm" 
            disabled={loading || !isFormValid}
            className={`transition-all ${loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : portfolio ? (
              "Update Portfolio"
            ) : (
              "Add Portfolio"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioModal;