"use client";

import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
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
import { Input } from "@/components/ui/input";

interface CandidateData {
  email?: string;
  name?: string;
}

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: CandidateData) => Promise<void> | void;
  appliedCandidates: Array<{ email: string; name?: string }>;
  onValidateEmail: (email: string) => Promise<{ exists: boolean; name?: string }>;
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  onClose,
  onInvite,
  appliedCandidates,
  onValidateEmail,
}) => {
  const [formData, setFormData] = useState<CandidateData>({
    email: "",
    name: "",
  });
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const lastValidatedEmailRef = useRef<string>("");
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form validation function
  const validateForm = useCallback((data: CandidateData): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    if (!data.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(data.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const isValid = Object.keys(newErrors).length === 0;
    return { isValid, errors: newErrors };
  }, []);

  // Debounced validation trigger
  const triggerValidation = useCallback((data: CandidateData) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      const result = validateForm(data);
      setErrors(result.errors);
      setIsFormValid(result.isValid);
    }, 100);
  }, [validateForm]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ email: "", name: "" });
      setQuery("");
      setDebouncedQuery("");
      setError(null);
      setValidating(false);
      setErrors({});
      setTouched({});
      setIsFormValid(false);
      setSubmitError(null);
      lastValidatedEmailRef.current = "";
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    }
  }, [isOpen]);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Email validation effect
  useEffect(() => {
    const email = formData.email?.trim() || "";
    const normalizedEmail = email.toLowerCase();

    if (!email || !isValidEmail(email)) {
      lastValidatedEmailRef.current = "";
      return;
    }

    if (lastValidatedEmailRef.current === normalizedEmail) {
      return;
    }

    const t = setTimeout(async () => {
      try {
        setValidating(true);
        const result = await onValidateEmail(email);
        lastValidatedEmailRef.current = normalizedEmail;
        
        if (!result.exists) {
          setError("Invitation can only be sent to candidates who applied to this opportunity.");
          setIsFormValid(false);
          return;
        }
        
        setError(null);
        if (result.name && !formData.name?.trim()) {
          setFormData((prev) => ({ ...prev, name: result.name || "" }));
        }
      } catch {
        setError("Could not validate candidate right now.");
        setIsFormValid(false);
      } finally {
        setValidating(false);
      }
    }, 300);
    
    return () => clearTimeout(t);
  }, [formData.email, onValidateEmail, formData.name]);

  const normalizedCandidates = useMemo(
    () =>
      appliedCandidates
        .map((c) => ({
          email: (c.email || "").trim(),
          name: (c.name || "").trim(),
        }))
        .filter((c) => c.email),
    [appliedCandidates]
  );

  const allowedEmails = normalizedCandidates.map((c) => c.email.toLowerCase());

  const filteredCandidates = useMemo(() => {
    if (!debouncedQuery) return normalizedCandidates.slice(0, 8);
    return normalizedCandidates.filter(
      (c) =>
        c.email.toLowerCase().includes(debouncedQuery) ||
        c.name.toLowerCase().includes(debouncedQuery)
    );
  }, [normalizedCandidates, debouncedQuery]);

  const isAppliedCandidateEmail = (email: string) => {
    const normalized = email.trim().toLowerCase();
    return allowedEmails.includes(normalized);
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof CandidateData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      triggerValidation(newData);
      return newData;
    });
  };

  const handleCandidateSelect = (candidate: { email: string; name?: string }) => {
    setTouched({ email: true, name: true });
    setQuery(candidate.email);
    setFormData({ email: candidate.email, name: candidate.name || "" });
    triggerValidation({ email: candidate.email, name: candidate.name || "" });
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({ email: true, name: true });
    
    const validationResult = validateForm(formData);
    setErrors(validationResult.errors);
    setIsFormValid(validationResult.isValid);

    if (!validationResult.isValid) {
      setSubmitError("Please enter a valid email");
      return;
    }

    if (!isAppliedCandidateEmail(formData.email || "")) {
      setSubmitError("Invitation can only be sent to candidates who applied to this opportunity.");
      setIsFormValid(false);
      return;
    }

    setLoading(true);
    setSubmitError(null);
    setError(null);

    try {
      await onInvite({
        email: formData.email!.trim(),
        name: formData.name?.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Select Candidate</DialogTitle>
          <DialogDescription>
            Select a candidate for this private assessment. Only candidates who already applied to this opportunity will be shown.
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

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Invitation can be sent only to candidates who already applied to this opportunity.
          </div>

          {/* Server-side Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Candidate Search
                {touched.email && errors.email && (
                  <span className="text-xs text-red-500 block">{errors.email}</span>
                )}
              </label>
              <Input
                placeholder="Type candidate email or name"
                value={query}
                onChange={(e) => {
                  const next = e.target.value;
                  setQuery(next);
                  const exactMatch = normalizedCandidates.find(
                    (c) => c.email.toLowerCase() === next.trim().toLowerCase()
                  );
                  if (exactMatch) {
                    handleCandidateSelect(exactMatch);
                  } else {
                    handleInputChange("email", next);
                  }
                }}
              />
              <div className="max-h-44 overflow-y-auto rounded-md border">
                {filteredCandidates.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    No applied candidates found for this search.
                  </div>
                ) : (
                  filteredCandidates.map((c) => (
                    <button
                      key={c.email}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted first:rounded-t-md last:rounded-b-md"
                      onClick={() => handleCandidateSelect(c)}
                    >
                      <div className="font-medium">{c.email}</div>
                      {c.name ? (
                        <div className="text-xs text-muted-foreground">{c.name}</div>
                      ) : null}
                    </button>
                  ))
                )}
              </div>
              {validating && (
                <p className="text-xs text-primary mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking candidate...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading || validating}>
              Cancel
            </Button>
          </DialogClose>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || validating || !isFormValid || appliedCandidates.length === 0 || !isAppliedCandidateEmail(formData.email || "")}
            className={`transition-all ${
              loading || validating || !isFormValid || appliedCandidates.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Sending...
              </>
            ) : validating ? (
              "Checking..."
            ) : (
              "Send Invite"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateModal;