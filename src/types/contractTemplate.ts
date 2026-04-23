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