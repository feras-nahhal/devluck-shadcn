import axios from 'axios'

// NOTE (DevLuck):
// This API configuration was taken from the DevLuck demo project.
// I modified it to fit the current project setup by adjusting the environment variable usage.
// Using VITE_API_URL from Vite env variables for backend base URL.
// Local fallback points to AI backend during development.
export const BASE = process.env.NEXT_PUBLIC_BACKENDAI_URL || 'http://localhost:8001';

// ─── Types ───────────────────────────────────────────────────────

export type Dimension =
  | 'technical_execution'
  | 'communication'
  | 'personality'
  | 'work_ethic'
  | 'motivation'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type CompanyStyle = 'standard' | 'startup' | 'corporate' | 'nonprofit'

export interface Question {
  id: string
  dimension: string
  difficulty: string
  core_concept: string
  question_type: string
  question_text: string
  code_snippet?: string | null
  choices?: string[] | null
  correct_choice?: string | null
  context_used: string
  master_id: string
  time_limit_seconds: number
}

export interface Assessment {
  session_id: string
  total_questions: number
  questions: Question[]
}

export interface EvaluationSignals {
  understood_concept: boolean
  correct_approach: boolean
  depth_of_answer: string
  red_flags: string[]
}

export interface EvaluationResult {
  question_id: string
  dimension: string
  score: number
  max_score: number
  feedback: string
  signals: EvaluationSignals
  one_line_summary: string
  evaluated_at: string
}

export interface DimensionScore {
  score: number
  questions_count: number
  top_signal: string
  concern: string
  evaluations: EvaluationResult[]
  archetype?: string
}

export interface AISignals {
  likely_used_ai: boolean
  surface_level_answers: number
  strong_answers: number
}

export interface HireSignal {
  signal: 'STRONG_HIRE' | 'HIRE' | 'MAYBE' | 'NO_HIRE'
  reason: string
}

export interface AIViolation {
  question_id: string
  dimension: string
  ai_analysis: string
  behavioral_evidence: string[]
  ai_detection?: Record<string, any>
}

export interface ExecutiveSummary {
  strengths: string[]
  weaknesses: string[]
  integrity_summary: string
  recommendation: string
}

export interface ViolationCategory {
  count: number
  severity: string
  description: string
}

export interface ViolationBreakdown {
  tab_switches: ViolationCategory
  fullscreen_exits: ViolationCategory
  paste_events: ViolationCategory
  camera_no_face: ViolationCategory
  camera_multiple_faces: ViolationCategory
  screenshot_attempts: ViolationCategory
  focus_losses: ViolationCategory
  total_violations: number
  integrity_risk: string
}

export interface ProctoringData {
  webcam_active: boolean
  no_face_incidents: number
  multiple_face_incidents: number
  proctoring_status: string
}

export interface AIDetectionTier {
  score: number
  label: string
  evidence: any[]
}

export interface AIDetectionDeep {
  tier1_behavioral: AIDetectionTier
  tier2_nlp: AIDetectionTier
  tier3_stylometric: AIDetectionTier
  composite_score: number
  verdict: string
}

export interface AssessmentReport {
  session_id: string
  company_style: string
  completed_at: string
  total_questions: number
  total_answered: number
  total_evaluated: number
  overall_score: number
  dimensions: Record<string, DimensionScore>
  red_flags: string[]
  ai_signals: AISignals
  violation_log?: AIViolation[]
  hire_signal?: HireSignal
  executive_summary?: ExecutiveSummary
  violation_breakdown?: ViolationBreakdown
  proctoring_summary?: ProctoringData
  ai_detection_deep?: AIDetectionDeep
}

export interface SessionProgress {
  total_questions: number
  answered: number
  evaluated: number
  remaining: number
}

export interface SessionData {
  session_id: string
  status: string
  company_style: string
  created_at: string
  started_at?: string
  expires_at?: string
  progress: SessionProgress
  questions: Question[]
  answers: Record<string, string>
  evaluations: Record<string, EvaluationResult>
}

// ─── Helpers ─────────────────────────────────────────────────────

const authHeaders = () => {
  const token = localStorage.getItem('devluck_token')
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
}

// ─── API ─────────────────────────────────────────────────────────

export const api = {
  // Health
  health: () => axios.get(`${BASE}/health`),

  // Master questions
  getMasterQuestions: () =>
    axios.get<{ total: number; by_dimension: Record<string, number>; questions: any[] }>(
      `${BASE}/api/master-questions`
    ),

  // Phase 1: Single generation
  generateQuestion: (params: {
    dimension: Dimension
    difficulty?: Difficulty
    company_style?: CompanyStyle
    session_id?: string
  }) => axios.post<Question>(`${BASE}/api/generate/question`, params),

  generateAssessment: (params: {
    company_style?: CompanyStyle
    session_id?: string
  }) => axios.post<Assessment>(`${BASE}/api/generate/assessment`, params),

  // Phase 2: Session management
  createSession: (params: {
    session_id: string
    company_style?: CompanyStyle
    question_count?: number
  }) => axios.post<{
    session_id: string
    questions_generated: number
    status: string
  }>(`${BASE}/api/session/create`, params, authHeaders()),

  startFromInvite: (invite_token: string) =>
    axios.post<{
      session_id: string
      questions_generated: number
      status: string
      already_started: boolean
    }>(`${BASE}/api/session/start-from-invite`, { invite_token }),

  submitAssessment: (sessionId: string) =>
    axios.post<{ status: string; report_generated: boolean }>(
      `${BASE}/api/session/${sessionId}/submit`
    ),

  getSession: (sessionId: string) =>
    axios.get<SessionData>(`${BASE}/api/session/${sessionId}`),

  startAssessment: (sessionId: string) =>
    axios.post<{ message: string }>(`${BASE}/api/session/${sessionId}/start`),

  retryGeneration: (sessionId: string) =>
    axios.post<{ message: string; session_id: string }>(`${BASE}/api/session/${sessionId}/retry-generation`),

  submitAnswer: (sessionId: string, questionId: string, answer: string) =>
    axios.post<{ saved: boolean; question_id: string; answered_count: number }>(
      `${BASE}/api/session/${sessionId}/answer`,
      { question_id: questionId, answer }
    ),

  evaluateAnswers: (sessionId: string) =>
    axios.post<{ evaluated_count: number; evaluations: EvaluationResult[] }>(
      `${BASE}/api/session/${sessionId}/evaluate`
    ),

  getReport: (sessionId: string) =>
    axios.get<AssessmentReport>(`${BASE}/api/session/${sessionId}/report`, authHeaders()),

  listSessions: () =>
    axios.get<{ total: number; sessions: any[] }>(`${BASE}/api/sessions`, authHeaders()),

  // Auth
  register: (data: { name: string; email: string; password: string; role: string }) =>
    axios.post(`${BASE}/api/auth/register`, data),

  login: (data: { email: string; password: string; role: string }) =>
    axios.post<{ token: string; role: string; user: { id: string; name: string; email: string }; company?: { id: string; name: string; email: string } }>(
      `${BASE}/api/auth/login`, data),

  // Invites
  getInvite: (inviteToken: string) =>
    axios.get(`${BASE}/api/invite/${inviteToken}`),

  createInvite: (data: { opportunity_id: string; candidate_name?: string; candidate_email?: string }) =>
    axios.post(`${BASE}/api/invites`, data, authHeaders()),

  // Opportunities
  listOpportunities: (page: number = 1, limit: number = 20) =>
    axios.get(`${BASE}/api/opportunities?page=${page}&limit=${limit}`, authHeaders()),

  createOpportunity: (data: { role_title: string; company_style?: string; description?: string; fit_profile?: string; question_count?: number; visibility?: string }) =>
    axios.post(`${BASE}/api/opportunities`, data, authHeaders()),

  getCandidates: (oppId: string) =>
    axios.get<{ candidates: any[] }>(`${BASE}/api/opportunities/${oppId}/candidates`, authHeaders()),

  getCandidateDashboard: () =>
    axios.get<{ user: any; assessments: any[] }>(`${BASE}/api/candidate/dashboard`, authHeaders()),

  getCandidateFeed: (page: number = 1, limit: number = 20) =>
    axios.get<{ data: any[]; total: number; pages: number; page: number; limit: number }>(`${BASE}/api/candidate/feed?page=${page}&limit=${limit}`, authHeaders()),

  applyToOpportunity: (oppId: string) =>
    axios.post(`${BASE}/api/candidate/apply/${oppId}`, {}, authHeaders()),
}
