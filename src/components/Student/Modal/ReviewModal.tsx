"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Star } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";

interface ReviewData {
  rating: number;
  comment: string;
  id?: string;
}

interface ReviewModalProps {
  review?: ReviewData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ReviewData) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  review,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ReviewData>({
    rating: 0,
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ✅ Use ref to prevent infinite loops
  const isValidatingRef = useRef(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const emptyForm: ReviewData = {
    rating: 0,
    comment: "",
  };

  // ✅ Pure validation function - NO state updates in deps
  const validateForm = useCallback((data: ReviewData): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (!data.comment?.trim()) newErrors.comment = "Review comment is required";
    if (data.rating < 1 || data.rating > 5) newErrors.rating = "Rating must be between 1 and 5";

    const isValid = Object.keys(newErrors).length === 0;
    return { isValid, errors: newErrors };
  }, []);

  // ✅ Debounced validation to prevent infinite loops
  const triggerValidation = useCallback((data: ReviewData) => {
    if (isValidatingRef.current) return;
    
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    isValidatingRef.current = true;
    validationTimeoutRef.current = setTimeout(() => {
      const result = validateForm(data);
      setErrors(result.errors);
      setIsFormValid(result.isValid);
      isValidatingRef.current = false;
    }, 0);
  }, [validateForm]);

  // Reset form when review or modal state changes
  useEffect(() => {
    if (isOpen) {
      if (review) {
        // EDIT MODE
        setFormData(review);
        setTouched({});
        setSubmitError(null);
        // Validate once after state update
        setTimeout(() => {
          const result = validateForm(review);
          setErrors(result.errors);
          setIsFormValid(result.isValid);
        }, 50);
      } else {
        // CREATE MODE
        setFormData(emptyForm);
        setErrors({});
        setTouched({});
        setIsFormValid(false);
        setSubmitError(null);
      }
    }
  }, [review, isOpen, validateForm]);

  // Handle input changes
  const handleInputChange = (field: keyof ReviewData, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Debounced validation
      triggerValidation(newData);
      return newData;
    });
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({ rating: true, comment: true });
    
    const result = validateForm(formData);
    setErrors(result.errors);
    setIsFormValid(result.isValid);

    if (!result.isValid) {
      setSubmitError("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to save review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{review ? "Edit Review" : "Add Review"}</DialogTitle>
          <DialogDescription>
            Provide a rating and write your feedback about the experience.
          </DialogDescription>
        </DialogHeader>

        {/* Submit Error */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
            <p className="text-sm text-red-800">{submitError}</p>
          </div>
        )}

        <div className="flex flex-col gap-4 py-4">
          {/* Comment */}
          <ParallelogramInput
            label="Review"
            placeholder="Write your review..."
            value={formData.comment}
            type="textarea"
            error={touched.comment && errors.comment || ""}
            onChange={(e) => handleInputChange("comment", e.target.value)}
          />

          {/* ⭐ Rating */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Rating</span>
            
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => handleInputChange("rating", star)}
                  className="transition-all hover:scale-110 p-1 rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <Star
                    size={22}
                    className={
                      star <= formData.rating
                        ? "fill-primary text-primary"
                        : "fill-muted-foreground text-muted-foreground"
                    }
                  />
                </button>
              ))}
            </div>
            
            {touched.rating && errors.rating && (
              <p className="text-xs text-red-500 mt-1">{errors.rating}</p>
            )}
            {formData.rating === 0 && touched.rating && (
              <p className="text-xs text-red-500 mt-1">Please select a rating</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !isFormValid}
            className={`transition-all ${
              loading || !isFormValid 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-primary-500"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : review ? (
              "Update Review"
            ) : (
              "Add Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;