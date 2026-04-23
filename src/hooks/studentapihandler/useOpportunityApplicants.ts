"use client"

import { api } from "@/lib/api";
import { useState, useCallback } from "react";


export type EmployeeApplicant = {
  applicantId: string;
  contractTitle?: string;
  contractStatus?: string;
  contractNumber?: string;
  availability?: string;
  profileComplete?: number;
  student: {
    id: string;
    name: string | null;
    image?: string | null;
    profileComplete?: number;
    status?: string;
    availability?: string;
  };
};

interface UseOpportunityApplicantsReturn {
  applicants: EmployeeApplicant[];
  loading: boolean;
  error: string | null;
  getApplicantsByCompany: (companyId: string) => Promise<EmployeeApplicant[]>;
  clearError: () => void;
}

export const useOpportunityApplicants = (): UseOpportunityApplicantsReturn => {
  const [applicants, setApplicants] = useState<EmployeeApplicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null)
  }, []);

  const getApplicantsByCompany = useCallback(
    async (companyId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<{ status: string; data: any[] }>(
          `/api/student/companies/${companyId}/employees`
        )

        const employees = response.data.data.map((emp: any) => ({
          applicantId: emp.student?.id || emp.id,
          contractTitle: emp.contractTitle,
          contractStatus: emp.status,
          contractNumber: emp.contractNumber,
          availability: emp.student?.availability,
          profileComplete: emp.student?.profileComplete,
          student: {
            id: emp.student?.id || '',
            name: emp.student?.name || 'Employee',
            image: emp.student?.image,
            profileComplete: emp.student?.profileComplete,
            status: emp.student?.status,
            availability: emp.student?.availability
          }
        }))

        setApplicants(employees);
        setLoading(false);
        return employees;
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch employees'
        setError(errorMessage)
        setApplicants([])
        setLoading(false);
        throw new Error(errorMessage)
      }
    },
    []
  );

  return {
    applicants,
    loading,
    error,
    getApplicantsByCompany,
    clearError,
  };
};
