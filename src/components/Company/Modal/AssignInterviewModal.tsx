"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/common/TimePicker";

/* ================================
   TYPES
================================ */
interface InterviewData {
  interviewDate?: string;
  interviewTime: string;
  meetingLink: string;
  notes: string;
}

interface AssignInterviewModalProps {
  interview?: InterviewData | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: InterviewData) => void;
}

/* ================================
   SAFE DATE FORMAT
================================ */
const formatDateSafe = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ================================
   COMPONENT
================================ */
export default function AssignInterviewModal({
  interview,
  isOpen,
  onClose,
  onAssign,
}: AssignInterviewModalProps) {
  const [formData, setFormData] = useState<InterviewData>({
    interviewDate: "",
    interviewTime: "12:00 AM",
    meetingLink: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  
  // ✅ VALIDATION STATES
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Validation function
  const validateForm = useCallback((data: InterviewData): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (!data.interviewDate?.trim()) newErrors.interviewDate = "Interview date is required";
    
    // ✅ Works with TimePicker's 12hr output
    if (!data.interviewTime?.trim() || data.interviewTime === "12:00 AM") {
      newErrors.interviewTime = "Please select a valid time";
    }
    
    if (!data.meetingLink?.trim()) newErrors.meetingLink = "Meeting link is required";

    const isValid = Object.keys(newErrors).length === 0;
    return { isValid, errors: newErrors };
  }, []);

  // ✅ Debounced validation
  const triggerValidation = useCallback((data: InterviewData) => {
    if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
    
    validationTimeoutRef.current = setTimeout(() => {
      const result = validateForm(data);
      setErrors(result.errors);
      setIsFormValid(result.isValid);
    }, 100);
  }, [validateForm]);

  /* ================================
     RESET / LOAD DATA
  ================================= */
  useEffect(() => {
    if (isOpen) {
      if (interview) {
        // EDIT MODE
        setFormData(interview);
        setTouched({});
        setTimeout(() => {
          const result = validateForm(interview);
          setErrors(result.errors);
          setIsFormValid(result.isValid);
        }, 50);
      } else {
        // CREATE MODE
        setFormData({
          interviewDate: "",
          interviewTime: "12:00 AM",
          meetingLink: "",
          notes: "",
        });
        setErrors({});
        setTouched({});
        setIsFormValid(false);
      }
      setSubmitError(null);
    }
  }, [interview, isOpen, validateForm]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
    };
  }, []);

  // ✅ Enhanced change handler
  const handleChange = (field: keyof InterviewData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      triggerValidation(newData);
      return newData;
    });
  };

  // ✅ Enhanced submit
  const handleSubmit = async () => {
    setTouched({
      interviewDate: true,
      interviewTime: true,
      meetingLink: true
    });

    const result = validateForm(formData);
    setErrors(result.errors);
    setIsFormValid(result.isValid);

    if (!result.isValid) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      await onAssign(formData);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || "Failed to assign interview");
    } finally {
      setLoading(false);
    }
  };

  /* ================================
     UI
  ================================= */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{interview ? "Edit Interview" : "Assign Interview"}</DialogTitle>
          <DialogDescription>
            {interview
              ? "Update interview details such as schedule, interviewer, or notes."
              : "Assign an interview to a candidate by selecting the role, time, and interviewer."}
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Submit Error */}
        {submitError && (
          <div className="px-6 pt-4 pb-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{submitError}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">

            {/* ================= DATE ================= */}
            <div className="space-y-2">
              <Label>Interview Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    {formData.interviewDate
                      ? format(new Date(formData.interviewDate + "T00:00:00"), "PPP")
                      : <span className="text-muted-foreground">Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 rounded-xl border bg-background shadow-lg">
                  <Calendar
                    mode="single"
                    selected={formData.interviewDate ? new Date(formData.interviewDate + "T00:00:00") : undefined}
                    onSelect={(date) => handleChange("interviewDate", date ? formatDateSafe(date) : "")}
                  />
                </PopoverContent>
              </Popover>
              {touched.interviewDate && errors.interviewDate && (
                <p className="text-xs text-red-500 mt-1">{errors.interviewDate}</p>
              )}
            </div>

            {/* ================= TIME ================= */}
            <div className="space-y-2">
              <Label>Interview Time</Label>
              <TimePicker
                value={formData.interviewTime}
                onChange={(val: string) => handleChange("interviewTime", val)}
              />
              {touched.interviewTime && errors.interviewTime && (
                <p className="text-xs text-red-500 mt-1">{errors.interviewTime}</p>
              )}
            </div>

            {/* ================= LINK ================= */}
            <div className="space-y-2">
              <Label>Meeting Link / Location</Label>
              <Input
                placeholder="Zoom / Google Meet / Office"
                value={formData.meetingLink}
                onChange={(e) => handleChange("meetingLink", e.target.value)}
              />
              {touched.meetingLink && errors.meetingLink && (
                <p className="text-xs text-red-500 mt-1">{errors.meetingLink}</p>
              )}
            </div>

            {/* ================= NOTES ================= */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Notes for interviewer"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6 flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !isFormValid}
            className={`transition-all ${loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : interview ? (
              "Update Interview"
            ) : (
              "Assign Interview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}