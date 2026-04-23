// src/lib/mappers/applicant.mapper.ts

import { Applicant, ApplicantStatus } from "@/src/types/applicant";



export function normalizeStatus(status: string): ApplicantStatus {
  if (status === "accepted") return "accepted";
  if (status === "rejected") return "rejected";
  return "pending"; // fallback (handles "withdrawn")
}

export function mapApplicant(app: any, index: number): Applicant {
  const student = app.student;

  const applicantId = student?.id || app.id;
  const truncatedId = applicantId.slice(-3);

  return {
    applicantId,
    applicationId: app.id,
    truncatedId,

    transferId: `316400ACZ${String(index + 1).padStart(2, "0")}`,

    name: student?.name || "Unknown",
    appliedAt: app.appliedAt,

    experience: "N/A",
    education: "N/A",
    language: "N/A",

    portfolio: {
      github: "",
      linkedin: "",
    },

    skills: [],
    description: student?.description || "",

    profileRanking: student?.profileRanking || 0,
    profileComplete: student?.profileComplete || 0,

    status: normalizeStatus(app.status),
    assessmentStatus: app.assessmentStatus || "not_started",

    salaryPaid: "$0",
    salaryExpectation: student?.salaryExpectation ?? null,

    startDate: "",
    endDate: "",

    workProgress: 0,

    contractStatus: "",
    contractTitle: "",

    paymentStatus: "",

    availability: student?.availability || "Remote",

    image: student?.image || "",
    image1: "/images/A11.jpeg",

    city: "",
    email: student?.email || "—",
  };
}