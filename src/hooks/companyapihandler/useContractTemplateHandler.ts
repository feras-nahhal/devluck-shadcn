"use client";

import { api } from "@/lib/api";
import { useState, useCallback } from "react";


/* ──────────────────────────────────────────────
   UI TYPES (STRICT - SAFE FOR COMPONENTS)
────────────────────────────────────────────── */

export type ContractStatus = "Active" | "Inactive" | "Draft";
export type WorkLocation = "Hybrid" | "Remote" | "Onsite";

export interface ContractTemplate {
  id: string;
  name: string;
  contractTitle: string;
  content?: string;
  currency: string;
  duration: string;
  monthlyAllowance?: string;
  workLocation: WorkLocation;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

/* ──────────────────────────────────────────────
   DTO (RAW API - UNSAFE)
────────────────────────────────────────────── */

interface ContractTemplateDTO {
  id?: string;
  name?: string;
  contractTitle?: string;
  content?: string;
  currency?: string;
  duration?: string;
  monthlyAllowance?:  string;
  workLocation?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ListContractTemplatesResponse {
  items: ContractTemplateDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ContractTemplateStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  latestActive: string | null;
  latestInactive: string | null;
  latestDraft: string | null;
  latest: string | null;
}

/* ──────────────────────────────────────────────
   RETURN TYPE
────────────────────────────────────────────── */

interface UseContractTemplateHandlerReturn {
  contractTemplates: ContractTemplate[];
  contractTemplate: ContractTemplate | null;
  loading: boolean;
  error: string | null;

  createContractTemplate: (
    data: Omit<ContractTemplate, "id" | "createdAt" | "updatedAt">
  ) => Promise<ContractTemplate>;

  updateContractTemplate: (
    id: string,
    data: Partial<ContractTemplate>
  ) => Promise<ContractTemplate>;

  deleteContractTemplate: (id: string) => Promise<void>;

  getContractTemplateById: (id: string) => Promise<ContractTemplate>;

  listContractTemplates: (
    page?: number,
    pageSize?: number,
    search?: string
  ) => Promise<ListContractTemplatesResponse>;

  getContractTemplateStats: () => Promise<ContractTemplateStats>;

  clearError: () => void;
}

/* ──────────────────────────────────────────────
   GUARDS
────────────────────────────────────────────── */

const isWorkLocation = (v: string): v is WorkLocation =>
  ["Hybrid", "Remote", "Onsite"].includes(v);

const isContractStatus = (v: string): v is ContractStatus =>
  ["Active", "Inactive", "Draft"].includes(v);

/* ──────────────────────────────────────────────
   MAPPER (CRITICAL FIX)
────────────────────────────────────────────── */

const normalize = (dto: ContractTemplateDTO): ContractTemplate => {
  if (!dto.id) throw new Error("ContractTemplate missing id");

  const workLocationRaw = dto.workLocation ?? "";
  const statusRaw = dto.status ?? "";

  const workLocation: WorkLocation = ["Hybrid", "Remote", "Onsite"].includes(
    workLocationRaw
  )
    ? (workLocationRaw as WorkLocation)
    : "Hybrid";

  const status: ContractStatus = ["Active", "Inactive", "Draft"].includes(
    statusRaw
  )
    ? (statusRaw as ContractStatus)
    : "Draft";

  return {
    id: dto.id,

    // ✅ FIX: fallback values
    name: dto.name?.trim() || "⚠ Add template name",
    contractTitle: dto.contractTitle?.trim() || "⚠ Add contract title",

    currency: dto.currency ?? "USD",
    duration: dto.duration ?? "-",

    monthlyAllowance: dto.monthlyAllowance
      ? String(dto.monthlyAllowance)
      : undefined,

    workLocation,
    status,

    createdAt: dto.createdAt ?? new Date().toISOString(),
    updatedAt: dto.updatedAt ?? new Date().toISOString(),
  };
};

/* ──────────────────────────────────────────────
   HOOK
────────────────────────────────────────────── */

export const useContractTemplateHandler =
  (): UseContractTemplateHandlerReturn => {
    const [contractTemplates, setContractTemplates] = useState<
      ContractTemplate[]
    >([]);

    const [contractTemplate, setContractTemplate] =
      useState<ContractTemplate | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    /* ───────── CREATE ───────── */
    const createContractTemplate = useCallback(
      async (
        data: Omit<
          ContractTemplate,
          "id" | "createdAt" | "updatedAt"
        >
      ): Promise<ContractTemplate> => {
        setLoading(true);
        setError(null);

        try {
          const response = await api.post<{
            status: string;
            data: ContractTemplateDTO;
          }>("/company/contract-templates", data);

          return normalize(response.data.data);
        } catch (err: any) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Failed to create contract template";

          setError(msg);
          throw new Error(msg);
        } finally {
          setLoading(false);
        }
      },
      []
    );

    /* ───────── UPDATE ───────── */
    const updateContractTemplate = useCallback(
      async (
        id: string,
        data: Partial<ContractTemplate>
      ): Promise<ContractTemplate> => {
        setLoading(true);
        setError(null);

        try {
          const response = await api.put<{
            status: string;
            data: ContractTemplateDTO;
          }>(`/company/contract-templates/${id}`, data);

          return normalize(response.data.data);
        } catch (err: any) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Failed to update contract template";

          setError(msg);
          throw new Error(msg);
        } finally {
          setLoading(false);
        }
      },
      []
    );

    /* ───────── DELETE ───────── */
    const deleteContractTemplate = useCallback(async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        await api.delete(`/company/contract-templates/${id}`);
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete contract template";

        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    }, []);

    /* ───────── GET BY ID ───────── */
    const getContractTemplateById = useCallback(async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<{
          status: string;
          data: ContractTemplateDTO;
        }>(`/company/contract-templates/${id}`);

        const normalized = normalize(response.data.data);
        setContractTemplate(normalized);

        return normalized;
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to get contract template";

        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    }, []);

    /* ───────── LIST ───────── */
    const listContractTemplates = useCallback(
      async (
        page: number = 1,
        pageSize: number = 10,
        search: string = ""
      ): Promise<ListContractTemplatesResponse> => {
        setLoading(true);
        setError(null);

        try {
          const params: any = { page, pageSize };
          if (search) params.search = search;

          const response = await api.get<{
            status: string;
            data: ListContractTemplatesResponse;
          }>("/company/contract-templates", { params });

          const items =
            response.data.data?.items.map(normalize) || [];

          setContractTemplates(items);

          return response.data.data;
        } catch (err: any) {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Failed to list contract templates";

          setError(msg);
          setContractTemplates([]);
          throw new Error(msg);
        } finally {
          setLoading(false);
        }
      },
      []
    );

    /* ───────── STATS ───────── */
    const getContractTemplateStats = useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<{
          status: string;
          data: ContractTemplateStats;
        }>("/company/contract-templates/stats");

        return response.data.data;
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to get contract template stats";

        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    }, []);

    return {
      contractTemplates,
      contractTemplate,
      loading,
      error,
      createContractTemplate,
      updateContractTemplate,
      deleteContractTemplate,
      getContractTemplateById,
      listContractTemplates,
      getContractTemplateStats,
      clearError,
    };
  };