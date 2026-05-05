"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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

import { useCompanyApplicationHandler } from "@/hooks/companyapihandler/useCompanyApplicationHandler";
import { useContractHandler } from "@/hooks/companyapihandler/useContractHandler";
import { useOpportunityHandler } from "@/hooks/companyapihandler/useOpportunityHandler";
import { ParallelogramSelect } from "@/components/common/ParallelogramSelect";
import { ParallelogramEmailAutocomplete } from "@/components/common/ParallelogramEmailAutocomplete";
import { ParallelogramInput } from "@/components/common/ParallelogramInput";
import DatePickerField from "@/components/common/DatePickerField";

/* ---------------- Types ---------------- */

interface ContractData {
  email: string;
  name: string;
  contractTitle: string;
  durationValue: number;
  contractStatus: string;
  startDate: string;
  salary?: string;
  note?: string;
  opportunityId?: string;
  currency: string;
}

interface ContractModalProps {
  contract?: ContractData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContractData) => void;
}

/* ---------------- Main Component ---------------- */

const ContractModal: React.FC<ContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ContractData>({
    email: "",
    name: "",
    contractTitle: "",
    durationValue: 1,
    startDate: "",
    salary: "",
    note: "",
    contractStatus: "",
    opportunityId: "",
    currency: "USD",
  });

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSuggestions, setEmailSuggestions] = useState<Array<{ email: string; id: string; name: string }>>([]);
  const [isSearchingEmail, setIsSearchingEmail] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { searchUserByEmail } = useCompanyApplicationHandler();
  const { createContract, updateContract } = useContractHandler();
  const { opportunities, listOpportunities } = useOpportunityHandler();

  // Load opportunities when modal opens
  useEffect(() => {
    if (isOpen) {
      listOpportunities(1, 1000).catch(console.error);
    }
  }, [isOpen, listOpportunities]);

  // Reset form when contract or modal state changes
  useEffect(() => {
    const isEditing = !!(contract as any)?.id;
    
    if (contract && isEditing) {
      setFormData({
        email: contract.email || "",
        name: contract.name || "",
        contractTitle: contract.contractTitle || "",
        durationValue: contract.durationValue || 1,
        startDate: contract.startDate || "",
        salary: contract.salary || "",
        note: contract.note || "",
        contractStatus: contract.contractStatus || "",
        opportunityId: contract.opportunityId || "",
        currency: contract.currency || "USD",
      });
    } else {
      setFormData({
        email: "",
        name: "",
        contractTitle: "",
        durationValue: 1,
        startDate: "",
        salary: "",
        note: "",
        contractStatus: "",
        opportunityId: "",
        currency: "USD",
      });
    }
    
    // Reset states
    setErrors({});
    setTouched({});
    setEmailError(null);
    setSubmitError(null);
    setIsFormValid(false);
  }, [contract, isOpen]);

  // Form validation function
  const validateForm = useCallback((data: ContractData = formData): boolean => {
    const newErrors: Record<string, string> = {};
    const isEditing = !!(contract as any)?.id;

    // Required field validations
    if (!data.opportunityId?.trim()) newErrors.opportunityId = "Opportunity is required";
    if (!data.name.trim()) newErrors.name = "Name is required";
    if (!data.contractTitle.trim()) newErrors.contractTitle = "Contract title is required";
    if (!data.contractStatus) newErrors.contractStatus = "Status is required";
    if (!data.currency) newErrors.currency = "Currency is required";
    if (!data.startDate) newErrors.startDate = "Start date is required";
    
    // Email required only for new contracts
    if (!data.email.trim() && !isEditing) newErrors.email = "Email is required";
    
    // Number validations
    const durationNum = Number(data.durationValue);
    if (!durationNum || durationNum <= 0) newErrors.durationValue = "Duration must be greater than 0";
    
    if (!data.salary?.trim()) newErrors.salary = "Salary is required";

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  }, [formData, contract]);

  // Handle input changes
  const handleInputChange = (field: keyof ContractData, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setFormData((prev) => ({ ...prev, [field]: value as any }));

    // Re-validate form after change
    setTimeout(() => validateForm({ ...formData, [field]: value } as ContractData), 0);

    // Email specific logic
    if (field === "email") {
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      setEmailError(null);

      const email = value.trim();
      if (email.length < 1) {
        setEmailSuggestions([]);
        setIsSearchingEmail(false);
        setValidatingEmail(false);
        return;
      }

      // Autocomplete search
      setIsSearchingEmail(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await searchUserByEmail(email);
          setEmailSuggestions(res || []);
        } catch {
          setEmailSuggestions([]);
        } finally {
          setIsSearchingEmail(false);
        }
      }, 200);

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        setValidatingEmail(true);
        validationTimeoutRef.current = setTimeout(async () => {
          try {
            const res = await searchUserByEmail(email);
            const exists = res?.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
            if (!exists) {
              setEmailError("User does not exist or is not a student");
            } else {
              setEmailError(null);
            }
          } catch {
            setEmailError("User validation failed");
          } finally {
            setValidatingEmail(false);
          }
        }, 500);
      }
    }
  };

  const handleEmailSuggestionSelect = (email: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      email,
      name: name || prev.name
    }));
    setEmailSuggestions([]);
    setEmailError(null);
    validateForm();
  };

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) clearTimeout(validationTimeoutRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const isEditing = !!(contract as any)?.id;

    // Mark all fields as touched
    const allTouched = {
      name: true, contractTitle: true, contractStatus: true,
      durationValue: true, email: true, currency: true,
      startDate: true, opportunityId: true, salary: true
    };
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    // Additional email validation for new contracts
    if (!isEditing && (emailError || validatingEmail || !formData.email.trim())) {
      setSubmitError("Please enter a valid student email");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const duration = `${formData.durationValue}`;
      
      if (isEditing) {
        const contractId = (contract as any).id;
        const contractData = {
          contractTitle: formData.contractTitle,
          name: formData.name.trim(),
          email: formData.email.trim() || undefined, // Fixed syntax error
          duration,
          salary: formData.salary ? parseFloat(formData.salary) : undefined,
          note: formData.note || undefined,
          status: formData.contractStatus,
          currency: formData.currency,
        };
        await updateContract(contractId, contractData);
      } else {
        const contractNumber = `CNT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const contractData = {
          contractTitle: formData.contractTitle,
          email: formData.email.trim(),
          name: formData.name.trim(),
          inContractNumber: contractNumber,
          inContractList: [],
          currency: formData.currency,
          duration,
          monthlyAllowance: 0,
          salary: formData.salary ? parseFloat(formData.salary) : undefined,
          workLocation: "",
          note: formData.note || undefined,
          status: formData.contractStatus,
          opportunityId: formData.opportunityId || undefined,
        };
        await createContract(contractData);
      }

      onSave(formData);
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || (isEditing ? "Failed to update contract" : "Failed to create contract"));
    } finally {
      setLoading(false);
    }
  };

  // Show submit error
  {submitError && (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
      <p className="text-sm text-red-800">{submitError}</p>
    </div>
  )}

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[640px] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{contract ? "Edit Contract" : "Create Contract"}</DialogTitle>
          <DialogDescription>
            {contract
              ? "Update contract terms such as salary, duration, or conditions."
              : "Create a new contract to define terms between the company and the candidate."}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Opportunity */}
          <ParallelogramSelect
            label="Opportunity"
            placeholder="Select opportunity"
            error={touched.opportunityId && errors.opportunityId ||""}
            value={
              formData.opportunityId
                ? opportunities.find((opp) => opp.id === formData.opportunityId)?.title || ""
                : ""
            }
            options={opportunities.map((opp) => opp.title)}
            onChange={(value) => {
              const selectedOpp = opportunities.find((opp) => opp.title === value);
              handleInputChange("opportunityId", selectedOpp?.id || "");
            }}
          />

          {/* Email */}
          <div className="flex flex-col gap-1">
            <ParallelogramEmailAutocomplete
              label="Email"
              placeholder="Enter student email"
              value={formData.email}
              error={touched.email && errors.email ||""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              suggestions={emailSuggestions}
              isLoading={isSearchingEmail}
              onSuggestionSelect={handleEmailSuggestionSelect}
            />
            {validatingEmail && (
              <p className="text-xs text-gray-500 ml-5">Checking user...</p>
            )}
            {emailError && (
              <p className="text-xs text-red-500 ml-5">{emailError}</p>
            )}
          </div>

          {/* Name */}
          <ParallelogramInput
            label="Name"
            placeholder="Enter applicant name"
            error={touched.name && errors.name ||""}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
          />

          {/* Contract Title */}
          <ParallelogramInput
            label="Contract Title"
            placeholder="Enter contract title"
            error={touched.contractTitle && errors.contractTitle ||""}
            value={formData.contractTitle}
            onChange={(e) => handleInputChange("contractTitle", e.target.value)}
          />

          {/* Status */}
          <ParallelogramSelect
            label="Contract Status"
            placeholder="Select contract status"
            value={formData.contractStatus}
            error={touched.contractStatus && errors.contractStatus||""}
            options={["Running", "Completed"]}
            onChange={(val) => handleInputChange("contractStatus", val)}
          />

          {/* Salary & Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ParallelogramInput
              label="Salary"
              placeholder="Enter salary amount"
              type="number"
              error={touched.salary && errors.salary ||""}
              value={formData.salary ?? ""}
              onChange={(e) => handleInputChange("salary", e.target.value)}
            />
            <ParallelogramSelect
              label="Currency"
              placeholder="Select currency"
              value={formData.currency}
              error={touched.currency && errors.currency ||""}
              options={["USD", "EUR", "SAR"]}
              onChange={(val) => handleInputChange("currency", val)}
            />
          </div>

          {/* Start Date */}
          <DatePickerField
            label="Start Date"
            value={formData.startDate}
            error={touched.startDate && errors.startDate ||""}
            onChange={(val) => handleInputChange("startDate", val)}
          />

          {/* Duration */}
          <ParallelogramInput
            label="Duration (in months)"
            placeholder="Enter number of months"
            type="number"
            error={touched.durationValue && errors.durationValue ||""}
            value={formData.durationValue.toString()}
            onChange={(e) => handleInputChange("durationValue", e.target.value)}
          />

          {/* Note */}
          <ParallelogramInput
            label="Note"
            placeholder="Optional note"
            value={formData.note ?? ""}
            onChange={(e) => handleInputChange("note", e.target.value)}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className={`transition-all ${
              loading || !isFormValid ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : contract ? (
              "Update Contract"
            ) : (
              "Create Contract"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContractModal;