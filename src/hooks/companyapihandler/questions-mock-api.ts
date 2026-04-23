// ─── mock-api.ts ───────────────────────────────────────────────
import axios from 'axios'

// ─── Base URL ─────────────────────────────────────────────────────
export const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
  progress: SessionProgress
  questions: Question[]
  answers: Record<string, string>
  evaluations: Record<string, EvaluationResult>
}

export const mockApi = {
  // Health
  health: () => Promise.resolve({ data: { status: 'ok' } }),

  // ─── Master questions ──────────────────
  getMasterQuestions: () => Promise.resolve({
    data: {
      total: 5,
      by_dimension: {
        technical_execution: 2,
        communication: 1,
        personality: 1,
        work_ethic: 1,
        motivation: 1,
      },
      questions: [
        { id: 'q1', dimension: 'technical_execution', difficulty: 'medium', core_concept: 'loops', question_type: 'mcq', question_text: 'What is a for loop?', context_used: 'none', master_id: 'm1', time_limit_seconds: 60 },
        { id: 'q2', dimension: 'communication', difficulty: 'easy', core_concept: 'email', question_type: 'text', question_text: 'Explain how you handle emails.', context_used: 'none', master_id: 'm2', time_limit_seconds: 60 },
        { id: 'q3', dimension: 'personality', difficulty: 'medium', core_concept: 'teamwork', question_type: 'text', question_text: 'Describe your teamwork style.', context_used: 'none', master_id: 'm3', time_limit_seconds: 60 },
        { id: 'q4', dimension: 'work_ethic', difficulty: 'hard', core_concept: 'time_management', question_type: 'text', question_text: 'How do you manage multiple deadlines?', context_used: 'none', master_id: 'm4', time_limit_seconds: 60 },
        { id: 'q5', dimension: 'motivation', difficulty: 'medium', core_concept: 'learning', question_type: 'text', question_text: 'What motivates you to learn new skills?', context_used: 'none', master_id: 'm5', time_limit_seconds: 60 },
      ],
    }
  }),

  // ─── Generate questions / assessments ─────────────
  generateQuestion: (params: any) => Promise.resolve({
    data: {
      id: `q_mock_${Math.random().toString(36).slice(2, 8)}`,
      dimension: params.dimension,
      difficulty: params.difficulty || 'medium',
      core_concept: 'mocked_concept',
      question_type: 'text',
      question_text: 'This is a fully mocked question.',
      context_used: 'none',
      master_id: 'm_mock',
      time_limit_seconds: 60,
    } as Question
  }),

  generateAssessment: (params: any) => Promise.resolve({
    data: {
      session_id: 'sess_mock_123',
      total_questions: 5,
      questions: [
        { id: 'q1', dimension: 'technical_execution', difficulty: 'medium', core_concept: 'loops', question_type: 'mcq', question_text: 'What is a for loop?', context_used: 'none', master_id: 'm1', time_limit_seconds: 60 },
        { id: 'q2', dimension: 'communication', difficulty: 'easy', core_concept: 'email', question_type: 'text', question_text: 'Explain how you handle emails.', context_used: 'none', master_id: 'm2', time_limit_seconds: 60 },
        { id: 'q3', dimension: 'personality', difficulty: 'medium', core_concept: 'teamwork', question_type: 'text', question_text: 'Describe your teamwork style.', context_used: 'none', master_id: 'm3', time_limit_seconds: 60 },
        { id: 'q4', dimension: 'work_ethic', difficulty: 'hard', core_concept: 'time_management', question_type: 'text', question_text: 'How do you manage multiple deadlines?', context_used: 'none', master_id: 'm4', time_limit_seconds: 60 },
        { id: 'q5', dimension: 'motivation', difficulty: 'medium', core_concept: 'learning', question_type: 'text', question_text: 'What motivates you to learn new skills?', context_used: 'none', master_id: 'm5', time_limit_seconds: 60 },
      ],
    } as Assessment
  }),

  // ─── Session management ─────────────
  createSession: (params: any) => Promise.resolve({
    data: { session_id: params.session_id, questions_generated: params.question_count || 5, status: 'created' }
  }),
  startFromInvite: (invite_token: string) => Promise.resolve({
    data: { session_id: 'sess_mock_123', questions_generated: 5, status: 'started', already_started: false }
  }),
  submitAssessment: (sessionId: string) => Promise.resolve({
    data: { status: 'submitted', report_generated: true }
  }),
  getSession: (sessionId: string) => Promise.resolve({
    data: {
      session_id: sessionId,
      status: 'in_progress',
      company_style: 'startup',
      created_at: new Date().toISOString(),
      progress: { total_questions: 5, answered: 2, evaluated: 0, remaining: 3 },
      questions: [],
      answers: {},
      evaluations: {},
    } as SessionData
  }),
  submitAnswer: (sessionId: string, questionId: string, answer: string) => Promise.resolve({
    data: { saved: true, question_id: questionId, answered_count: Math.floor(Math.random() * 5) + 1 }
  }),
  evaluateAnswers: (sessionId: string) => Promise.resolve({
    data: { evaluated_count: Math.floor(Math.random() * 5) + 1, evaluations: [] as EvaluationResult[] }
  }),
getReport: (sessionId: string) => Promise.resolve({
  data: {
    session_id: sessionId,
    company_style: 'startup',
    completed_at: new Date().toISOString(),
    total_questions: 5,
    total_answered: 5,
    total_evaluated: 5,
    overall_score: 85,

    dimensions: {
      technical_execution: {
        score: 8,
        questions_count: 2,
        top_signal: 'Good understanding of loops and algorithms',
        concern: 'Minor syntax errors',
        evaluations: [
          {
            question_id: 'q1',
            dimension: 'technical_execution',
            score: 8,
            max_score: 10,
            feedback: 'Answered correctly with slight syntax mistakes',
            signals: {
              understood_concept: true,
              correct_approach: true,
              depth_of_answer: 'deep',
              red_flags: []
            },
            one_line_summary: 'Strong in loops',
            evaluated_at: new Date().toISOString(),
          }
        ],
        archetype: 'Analytical Thinker',
      },

      communication: {
        score: 7,
        questions_count: 1,
        top_signal: 'Clear and concise explanation',
        concern: 'Could expand more on examples',
        evaluations: [
          {
            question_id: 'q2',
            dimension: 'communication',
            score: 7,
            max_score: 10,
            feedback: 'Good explanation but needs more examples',
            signals: {
              understood_concept: true,
              correct_approach: true,
              depth_of_answer: 'medium',
              red_flags: []
            },
            one_line_summary: 'Good communicator',
            evaluated_at: new Date().toISOString(),
          }
        ],
        archetype: 'Effective Communicator',
      },

      personality: {
        score: 9,
        questions_count: 1,
        top_signal: 'Friendly and positive attitude',
        concern: 'Tends to be shy in group discussions',
        evaluations: [
          {
            question_id: 'q3',
            dimension: 'personality',
            score: 9,
            max_score: 10,
            feedback: 'Strong interpersonal skills',
            signals: {
              understood_concept: true,
              correct_approach: true,
              depth_of_answer: 'high',
              red_flags: []
            },
            one_line_summary: 'Great personality fit',
            evaluated_at: new Date().toISOString(),
          }
        ],
        archetype: 'Team Player',
      },

      work_ethic: {
        score: 6,
        questions_count: 1,
        top_signal: 'Completes tasks on time',
        concern: 'Sometimes needs supervision',
        evaluations: [
          {
            question_id: 'q4',
            dimension: 'work_ethic',
            score: 6,
            max_score: 10,
            feedback: 'Shows effort but needs guidance',
            signals: {
              understood_concept: true,
              correct_approach: true,
              depth_of_answer: 'medium',
              red_flags: []
            },
            one_line_summary: 'Reliable but needs guidance',
            evaluated_at: new Date().toISOString(),
          }
        ],
        archetype: 'Dependable Worker',
      },

      motivation: {
        score: 8,
        questions_count: 1,
        top_signal: 'High enthusiasm for learning',
        concern: 'Occasionally gets distracted',
        evaluations: [
          {
            question_id: 'q5',
            dimension: 'motivation',
            score: 8,
            max_score: 10,
            feedback: 'Shows strong drive and initiative',
            signals: {
              understood_concept: true,
              correct_approach: true,
              depth_of_answer: 'high',
              red_flags: []
            },
            one_line_summary: 'Highly motivated',
            evaluated_at: new Date().toISOString(),
          }
        ],
        archetype: 'Self-Starter',
      }
    },

    // 🔴 Red flags
    red_flags: [
      'Minor inconsistency in communication clarity',
      'Occasional lack of depth in technical explanations'
    ],

    // 🤖 AI signals
    ai_signals: {
      likely_used_ai: false,
      surface_level_answers: 1,
      strong_answers: 4
    },

    // 🚨 Violations (NEW)
    violation_log: [
      {
        question_id: 'q2',
        dimension: 'communication',
        ai_analysis: 'Possible external assistance detected',
        behavioral_evidence: ['Quick response time', 'Perfect grammar']
      }
    ],

    // 🧠 Hiring decision (NEW)
    hire_signal: {
      signal: 'HIRE',
      reason: 'Strong technical skills and good cultural fit'
    },

    // 📊 Executive summary (NEW)
    executive_summary: {
      strengths: [
        'Strong technical fundamentals',
        'Positive attitude and teamwork',
        'High motivation'
      ],
      weaknesses: [
        'Needs more depth in explanations',
        'Occasional communication gaps'
      ],
      integrity_summary: 'No major integrity concerns detected',
      recommendation: 'Proceed to next interview stage'
    },

    // ⚠️ Violation breakdown (NEW)
    violation_breakdown: {
      tab_switches: { count: 1, severity: 'low', description: 'User switched tab once' },
      fullscreen_exits: { count: 0, severity: 'none', description: 'No fullscreen exits' },
      paste_events: { count: 1, severity: 'medium', description: 'One paste detected' },
      camera_no_face: { count: 0, severity: 'none', description: 'Face always visible' },
      camera_multiple_faces: { count: 0, severity: 'none', description: 'Single face detected' },
      screenshot_attempts: { count: 0, severity: 'none', description: 'No screenshots' },
      focus_losses: { count: 1, severity: 'low', description: 'Minor focus loss' },
      total_violations: 3,
      integrity_risk: 'Low'
    },

    // 🎥 Proctoring summary (NEW)
    proctoring_summary: {
      webcam_active: true,
      no_face_incidents: 0,
      multiple_face_incidents: 0,
      proctoring_status: 'normal'
    },

    // 🤖 Deep AI detection (NEW)
    ai_detection_deep: {
      tier1_behavioral: { score: 20, label: 'Low', evidence: [] },
      tier2_nlp: { score: 35, label: 'Moderate', evidence: ['Highly structured sentences'] },
      tier3_stylometric: { score: 25, label: 'Low', evidence: [] },
      composite_score: 27,
      verdict: 'Low likelihood of AI usage'
    }

  } as AssessmentReport
}),

 // ─── Auth ─────────────
  register: (data: any) => Promise.resolve({
    data: { user: { id: 'u1', name: data.name, email: data.email }, token: 'mock_token' }
  }),
  login: (data: any) => Promise.resolve({
    data: { token: 'mock_token', role: data.role, user: { id: 'u1', name: 'Mock User', email: data.email } }
  }),

  // ─── Opportunities ─────────────
  listOpportunities: () => Promise.resolve({
    data: { total: 2, sessions: [
      { id: 'opp1', role_title: 'Frontend Dev' },
      { id: 'opp2', role_title: 'Backend Dev' }
    ]}
  }),
  createOpportunity: (data: any) => Promise.resolve({ data: { id: `opp_mock_${Math.random().toString(36).slice(2,6)}`, ...data } }),
  applyToOpportunity: (oppId: string) => Promise.resolve({ data: { applied: true, opportunity_id: oppId } }),

  // ─── Additional mocks ─────────────
  getProctoringData: (sessionId: string) => Promise.resolve({
    data: {
      webcam_active: true,
      no_face_incidents: 0,
      multiple_face_incidents: 0,
      proctoring_status: 'normal'
    } as ProctoringData
  }),
  getAIDetection: (sessionId: string) => Promise.resolve({
    data: {
      tier1_behavioral: { score: 20, label: 'Low', evidence: [] },
      tier2_nlp: { score: 30, label: 'Moderate', evidence: [] },
      tier3_stylometric: { score: 25, label: 'Low', evidence: [] },
      composite_score: 25,
      verdict: 'No AI detected'
    } as AIDetectionDeep
  })
}

