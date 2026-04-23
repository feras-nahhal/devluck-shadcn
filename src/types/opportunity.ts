// src/types/opportunity.ts

export interface OpportunityData {
  id?: string;
  title: string;
  type: string;
  timeLength: string;
  currency: string;
  allowance?: string;
  location?: string;
  description: string;
  details?: string;
  skills?: string[];
  whyYouWillLoveWorkingHere?: string[];
  benefits?: string[];
  keyResponsibilities?: string[];
  startDate?: string;
}

export interface OpportunityUI {
  id: string;

  jobNumber: string;
  jobName: string;
  country: string;
  jobtype: string;

  title: string;
  type: string;

  timeLength: string;
  currency: string;
  allowance?: string;
  location?: string;

  description: string;
  startDate?: string;

  skills: string[];
  whyYouWillLoveWorkingHere: string[];
  benefits: string[];
  keyResponsibilities: string[];

  numberOfApplicants: string;
}