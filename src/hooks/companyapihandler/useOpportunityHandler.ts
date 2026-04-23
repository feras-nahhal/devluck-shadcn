"use client";


import { api } from "@/lib/api";
import { OpportunityData } from "@/types/opportunity";
import { useState, useCallback } from "react";




interface Opportunity extends OpportunityData {
  id: string;
  applicantCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ListOpportunitiesResponse {
  items: Opportunity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface RecentOpportunitiesResponse {
  items: Opportunity[];
  limit: number;
}

interface ApiResponse<T> {
  status: string;
  data: T;
}

interface UseOpportunityHandlerReturn {
  opportunities: Opportunity[];
  opportunity: Opportunity | null;
  loading: boolean;
  error: string | null;

  createOpportunity: (data: OpportunityData) => Promise<Opportunity>;
  updateOpportunity: (
    id: string,
    data: Partial<OpportunityData>
  ) => Promise<Opportunity>;
  deleteOpportunity: (id: string) => Promise<void>;
  getOpportunityById: (id: string) => Promise<Opportunity>;
  listOpportunities: (
    page?: number,
    pageSize?: number
  ) => Promise<ListOpportunitiesResponse>;
  getRecentOpportunities: (
    limit?: number
  ) => Promise<RecentOpportunitiesResponse>;
  clearError: () => void;
}

/* ──────────────────────────────────────────────
   Helpers (DRY + Safe error handling)
────────────────────────────────────────────── */
function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return (
      err.response?.data?.message ??
      "Request failed"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error occurred";
}

/* ──────────────────────────────────────────────
   Hook
────────────────────────────────────────────── */
function useOpportunityHandler(): UseOpportunityHandlerReturn {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const createOpportunity = useCallback(
    async (data: OpportunityData): Promise<Opportunity> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post<ApiResponse<Opportunity>>(
          "/company/opportunities",
          data
        );

        return response.data.data;
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateOpportunity = useCallback(
    async (
      id: string,
      data: Partial<OpportunityData>
    ): Promise<Opportunity> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.put<ApiResponse<Opportunity>>(
          `/company/opportunities/${id}`,
          data
        );

        return response.data.data;
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteOpportunity = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await api.delete(`/company/opportunities/${id}`);
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getOpportunityById = useCallback(
    async (id: string): Promise<Opportunity> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<ApiResponse<Opportunity>>(
          `/company/opportunities/${id}`
        );

        setOpportunity(response.data.data);
        return response.data.data;
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const listOpportunities = useCallback(
    async (
      page: number = 1,
      pageSize: number = 10
    ): Promise<ListOpportunitiesResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<
          ApiResponse<ListOpportunitiesResponse>
        >("/company/opportunities", {
          params: { page, pageSize },
        });

        const items = response.data.data.items ?? [];
        setOpportunities(items);

        return response.data.data;
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setError(message);
        setOpportunities([]);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getRecentOpportunities = useCallback(
    async (limit: number = 5): Promise<RecentOpportunitiesResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<
          ApiResponse<RecentOpportunitiesResponse>
        >("/company/opportunities/recent", {
          params: { limit },
        });

        const items = response.data.data.items ?? [];
        setOpportunities(items);

        return response.data.data;
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setError(message);
        setOpportunities([]);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    opportunities,
    opportunity,
    loading,
    error,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    getOpportunityById,
    listOpportunities,
    getRecentOpportunities,
    clearError,
  };
}

export { useOpportunityHandler };