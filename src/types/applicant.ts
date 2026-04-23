export type ApplicantStatus =
  | "pending"
  | "accepted"
  | "rejected";

export interface Portfolio {
  github?: string;
  linkedin?: string;
}

export interface Applicant {
  applicantId: string;
  applicationId?: string;

  transferId: string;
  truncatedId?: string;

  name: string;

  appliedAt?: string;

  experience: string;
  education: string;
  language: string;

  portfolio: Portfolio;
  skills: string[];

  description: string;

  profileRanking: number;
  profileComplete: number;

  status: ApplicantStatus;
  assessmentStatus?: string;

  salaryPaid: string;
  salaryExpectation?: number | null;

  startDate: string;
  endDate: string;

  workProgress: number;

  contractStatus: string;
  contractTitle: string;

  paymentStatus: string;

  availability: string;

  image: string;
  image1?: string;

  city: string;
  email?: string;
}