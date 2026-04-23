"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    if (review) setFormData(review);
    else setFormData({ rating: 0, comment: "" });
  }, [review, isOpen]);

  const handleInputChange = (field: keyof ReviewData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">

        {/* Header */}
        <DialogHeader>
          <DialogTitle>
            {review ? "Edit Review" : "Add Review"}
          </DialogTitle>
            <DialogDescription>
              Provide a rating and write your feedback about the experience.
            </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex flex-col gap-4 py-4">

          {/* Comment */}
          <ParallelogramInput
            label="Review"
            placeholder="Write your review..."
            value={formData.comment}
            type="textarea"
            onChange={(e) =>
              handleInputChange("comment", e.target.value)
            }
          />

          {/* ⭐ Rating */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Rating</span>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() =>
                    handleInputChange("rating", star)
                  }
                  className="transition hover:scale-110"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={
                      star <= formData.rating
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }
                  >
                    <path d="M10 1.6l2.6 5.3 5.9.9-4.3 4.2 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.2 5.9-.9L10 1.6z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : review ? (
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

export default ReviewModal;