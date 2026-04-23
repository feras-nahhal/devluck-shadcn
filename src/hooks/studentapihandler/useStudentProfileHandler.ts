"use client"

import { api } from '@/lib/api'
import { useState, useCallback } from 'react'


// Profile interfaces
interface ProfileData {
  name?: string
  email?: string
  description?: string
  status?: string
  availability?: string
  salaryExpectation?: number | string
  image?: string
  profileRanking?: number
  profileComplete?: number
}

interface StudentProfile extends ProfileData {
  id: string
  userId: string
  createdAt: string
  updatedAt: string
}

// Skill interfaces
interface Skill {
  id: string
  name: string
  createdAt?: string
}

// Experience interfaces
interface ExperienceData {
  role: string
  companyName: string
  startDate?: string
  endDate?: string
  description?: string
}

interface Experience extends ExperienceData {
  id: string
  studentId: string
  createdAt: string
  updatedAt: string
}

// Education interfaces
interface EducationData {
  name: string
  major: string
  startDate?: string
  endDate?: string
  description?: string
}

interface Education extends EducationData {
  id: string
  studentId: string
  createdAt: string
  updatedAt: string
}

// Language interfaces
interface LanguageData {
  name: string
  level: string
}

interface Language extends LanguageData {
  id: string
  studentId: string
  createdAt: string
  updatedAt: string
}

// Portfolio interfaces
interface PortfolioData {
  name: string
  link: string
}

interface Portfolio extends PortfolioData {
  id: string
  studentId: string
  createdAt: string
  updatedAt: string
}

interface UseStudentProfileHandlerReturn {
  // Profile
  profile: StudentProfile | null
  profileLoading: boolean
  profileError: string | null
  getProfile: () => Promise<StudentProfile>
  updateProfile: (data: ProfileData) => Promise<StudentProfile>
  createProfile: (data: ProfileData) => Promise<StudentProfile>
  deleteProfile: () => Promise<void>

  // Skills
  skills: Skill[]
  skillsLoading: boolean
  skillsError: string | null
  getSkills: () => Promise<Skill[]>
  addSkills: (skills: string[] | { name: string }[]) => Promise<Skill[]>
  removeSkill: (skillId: string) => Promise<void>

  // Experience
  experiences: Experience[]
  experience: Experience | null
  experienceLoading: boolean
  experienceError: string | null
  getExperiences: () => Promise<Experience[]>
  getExperience: (id: string) => Promise<Experience>
  createExperience: (data: ExperienceData) => Promise<Experience>
  updateExperience: (id: string, data: Partial<ExperienceData>) => Promise<Experience>
  deleteExperience: (id: string) => Promise<void>

  // Education
  educations: Education[]
  education: Education | null
  educationLoading: boolean
  educationError: string | null
  getEducations: () => Promise<Education[]>
  getEducation: (id: string) => Promise<Education>
  createEducation: (data: EducationData) => Promise<Education>
  updateEducation: (id: string, data: Partial<EducationData>) => Promise<Education>
  deleteEducation: (id: string) => Promise<void>

  // Language
  languages: Language[]
  language: Language | null
  languageLoading: boolean
  languageError: string | null
  getLanguages: () => Promise<Language[]>
  createLanguage: (data: LanguageData) => Promise<Language>
  updateLanguage: (id: string, data: Partial<LanguageData>) => Promise<Language>
  deleteLanguage: (id: string) => Promise<void>

  // Portfolio
  portfolios: Portfolio[]
  portfolio: Portfolio | null
  portfolioLoading: boolean
  portfolioError: string | null
  getPortfolios: () => Promise<Portfolio[]>
  getPortfolio: (id: string) => Promise<Portfolio>
  createPortfolio: (data: PortfolioData) => Promise<Portfolio>
  updatePortfolio: (id: string, data: Partial<PortfolioData>) => Promise<Portfolio>
  deletePortfolio: (id: string) => Promise<void>

  // Utilities
  clearError: () => void
}

export const useStudentProfileHandler = (): UseStudentProfileHandlerReturn => {
  // Profile states
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Skills states
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [skillsError, setSkillsError] = useState<string | null>(null)

  // Experience states
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [experience, setExperience] = useState<Experience | null>(null)
  const [experienceLoading, setExperienceLoading] = useState(false)
  const [experienceError, setExperienceError] = useState<string | null>(null)

  // Education states
  const [educations, setEducations] = useState<Education[]>([])
  const [education, setEducation] = useState<Education | null>(null)
  const [educationLoading, setEducationLoading] = useState(false)
  const [educationError, setEducationError] = useState<string | null>(null)

  // Language states
  const [languages, setLanguages] = useState<Language[]>([])
  const [language, setLanguage] = useState<Language | null>(null)
  const [languageLoading, setLanguageLoading] = useState(false)
  const [languageError, setLanguageError] = useState<string | null>(null)

  // Portfolio states
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [portfolioLoading, setPortfolioLoading] = useState(false)
  const [portfolioError, setPortfolioError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setProfileError(null)
    setSkillsError(null)
    setExperienceError(null)
    setEducationError(null)
    setLanguageError(null)
    setPortfolioError(null)
  }, [])

  // Profile functions
  const getProfile = useCallback(async (): Promise<StudentProfile> => {
    setProfileLoading(true)
    setProfileError(null)
    try {
      const response = await api.get<{ status: string; data: StudentProfile }>('/api/student/profile')
      setProfile(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get profile'
      setProfileError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const createProfile = useCallback(async (data: ProfileData): Promise<StudentProfile> => {
    setProfileLoading(true)
    setProfileError(null)
    try {
      const response = await api.post<{ status: string; data: StudentProfile }>('/api/student/profile', data)
      setProfile(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create profile'
      setProfileError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: ProfileData): Promise<StudentProfile> => {
    setProfileLoading(true)
    setProfileError(null)
    try {
      const response = await api.put<{ status: string; data: StudentProfile }>('/api/student/profile', data)
      setProfile(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile'
      setProfileError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const deleteProfile = useCallback(async (): Promise<void> => {
    setProfileLoading(true)
    setProfileError(null)
    try {
      await api.delete('/api/student/profile')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete profile'
      setProfileError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  // Skills functions
  const getSkills = useCallback(async (): Promise<Skill[]> => {
    setSkillsLoading(true)
    setSkillsError(null)
    try {
      const response = await api.get<{ status: string; data: Skill[] }>('/api/student/skills')
      setSkills(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get skills'
      setSkillsError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setSkillsLoading(false)
    }
  }, [])

  const addSkills = useCallback(async (skillsData: string[] | { name: string }[]): Promise<Skill[]> => {
    setSkillsLoading(true)
    setSkillsError(null)
    try {
      const response = await api.post<{ status: string; data: Skill[] }>('/api/student/skills', {
        skills: skillsData
      })
      const newSkills = response.data.data
      setSkills(prev => [...prev, ...newSkills])
      await getProfile()
      return newSkills
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add skills'
      setSkillsError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setSkillsLoading(false)
    }
  }, [getProfile])

  const removeSkill = useCallback(async (skillId: string): Promise<void> => {
    setSkillsLoading(true)
    setSkillsError(null)
    try {
      await api.delete(`/api/student/skills/${skillId}`)
      setSkills(prev => prev.filter(skill => skill.id !== skillId))
      await getProfile()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove skill'
      setSkillsError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setSkillsLoading(false)
    }
  }, [getProfile])

  // Experience functions
  const getExperiences = useCallback(async (): Promise<Experience[]> => {
    setExperienceLoading(true)
    setExperienceError(null)
    try {
      const response = await api.get<{ status: string; data: Experience[] }>('/api/student/experience')
      setExperiences(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get experiences'
      setExperienceError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setExperienceLoading(false)
    }
  }, [])

  const getExperience = useCallback(async (id: string): Promise<Experience> => {
    setExperienceLoading(true)
    setExperienceError(null)
    try {
      const response = await api.get<{ status: string; data: Experience }>(`/api/student/experience/${id}`)
      setExperience(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get experience'
      setExperienceError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setExperienceLoading(false)
    }
  }, [])

  const createExperience = useCallback(async (data: ExperienceData): Promise<Experience> => {
    setExperienceLoading(true)
    setExperienceError(null)
    try {
      const response = await api.post<{ status: string; data: Experience }>('/api/student/experience', data)
      setExperiences(prev => [response.data.data, ...prev])
      await getProfile()
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create experience'
      setExperienceError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setExperienceLoading(false)
    }
  }, [getProfile])

  const updateExperience = useCallback(async (id: string, data: Partial<ExperienceData>): Promise<Experience> => {
    setExperienceLoading(true)
    setExperienceError(null)
    try {
      const response = await api.put<{ status: string; data: Experience }>(`/api/student/experience/${id}`, data)
      setExperiences(prev => prev.map(exp => exp.id === id ? response.data.data : exp))
      await getProfile()
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update experience'
      setExperienceError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setExperienceLoading(false)
    }
  }, [getProfile])

  const deleteExperience = useCallback(async (id: string): Promise<void> => {
    setExperienceLoading(true)
    setExperienceError(null)
    try {
      await api.delete(`/api/student/experience/${id}`)
      setExperiences(prev => prev.filter(exp => exp.id !== id))
      await getProfile()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete experience'
      setExperienceError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setExperienceLoading(false)
    }
  }, [getProfile])

  // Education functions
  const getEducations = useCallback(async (): Promise<Education[]> => {
    setEducationLoading(true)
    setEducationError(null)
    try {
      const response = await api.get<{ status: string; data: Education[] }>('/api/student/education')
      setEducations(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get educations'
      setEducationError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setEducationLoading(false)
    }
  }, [])

  const getEducation = useCallback(async (id: string): Promise<Education> => {
    setEducationLoading(true)
    setEducationError(null)
    try {
      const response = await api.get<{ status: string; data: Education }>(`/api/student/education/${id}`)
      setEducation(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get education'
      setEducationError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setEducationLoading(false)
    }
  }, [])

  const createEducation = useCallback(async (data: EducationData): Promise<Education> => {
    setEducationLoading(true)
    setEducationError(null)
    try {
      const response = await api.post<{ status: string; data: Education }>('/api/student/education', data)
      setEducations(prev => [response.data.data, ...prev])
      await getProfile()
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create education'
      setEducationError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setEducationLoading(false)
    }
  }, [getProfile])

  const updateEducation = useCallback(async (id: string, data: Partial<EducationData>): Promise<Education> => {
    setEducationLoading(true)
    setEducationError(null)
    try {
      const response = await api.put<{ status: string; data: Education }>(`/api/student/education/${id}`, data)
      setEducations(prev => prev.map(edu => edu.id === id ? response.data.data : edu))
      await getProfile()
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update education'
      setEducationError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setEducationLoading(false)
    }
  }, [getProfile])

  const deleteEducation = useCallback(async (id: string): Promise<void> => {
    setEducationLoading(true)
    setEducationError(null)
    try {
      await api.delete(`/api/student/education/${id}`)
      setEducations(prev => prev.filter(edu => edu.id !== id))
      await getProfile()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete education'
      setEducationError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setEducationLoading(false)
    }
  }, [getProfile])

  // Language functions
  const getLanguages = useCallback(async (): Promise<Language[]> => {
    setLanguageLoading(true)
    setLanguageError(null)
    try {
      const response = await api.get<{ status: string; data: Language[] }>('/api/student/languages')
      setLanguages(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get languages'
      setLanguageError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLanguageLoading(false)
    }
  }, [])

  const createLanguage = useCallback(async (data: LanguageData): Promise<Language> => {
    setLanguageLoading(true)
    setLanguageError(null)
    try {
      const response = await api.post<{ status: string; data: Language }>('/api/student/languages', data)
      setLanguages(prev => [response.data.data, ...prev])
      await getProfile()
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create language'
      setLanguageError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLanguageLoading(false)
    }
  }, [getProfile])

  const updateLanguage = useCallback(async (id: string, data: Partial<LanguageData>): Promise<Language> => {
    setLanguageLoading(true)
    setLanguageError(null)
    try {
      const response = await api.put<{ status: string; data: Language }>(`/api/student/languages/${id}`, data)
      setLanguages(prev => prev.map(lang => lang.id === id ? response.data.data : lang))
      await getProfile()
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update language'
      setLanguageError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLanguageLoading(false)
    }
  }, [getProfile])

  const deleteLanguage = useCallback(async (id: string): Promise<void> => {
    setLanguageLoading(true)
    setLanguageError(null)
    try {
      await api.delete(`/api/student/languages/${id}`)
      setLanguages(prev => prev.filter(lang => lang.id !== id))
      await getProfile()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete language'
      setLanguageError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLanguageLoading(false)
    }
  }, [getProfile])

  // Portfolio functions
  const getPortfolios = useCallback(async (): Promise<Portfolio[]> => {
    setPortfolioLoading(true)
    setPortfolioError(null)
    try {
      const response = await api.get<{ status: string; data: Portfolio[] }>('/api/student/portfolio')
      setPortfolios(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get portfolios'
      setPortfolioError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setPortfolioLoading(false)
    }
  }, [])

  const getPortfolio = useCallback(async (id: string): Promise<Portfolio> => {
    setPortfolioLoading(true)
    setPortfolioError(null)
    try {
      const response = await api.get<{ status: string; data: Portfolio }>(`/api/student/portfolio/${id}`)
      setPortfolio(response.data.data)
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to get portfolio'
      setPortfolioError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setPortfolioLoading(false)
    }
  }, [])

  const createPortfolio = useCallback(async (data: PortfolioData): Promise<Portfolio> => {
    setPortfolioLoading(true)
    setPortfolioError(null)
    try {
      const response = await api.post<{ status: string; data: Portfolio }>('/api/student/portfolio', data)
      setPortfolios(prev => [response.data.data, ...prev])
      await getProfile()
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create portfolio'
      setPortfolioError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setPortfolioLoading(false)
    }
  }, [getProfile])

  const updatePortfolio = useCallback(async (id: string, data: Partial<PortfolioData>): Promise<Portfolio> => {
    setPortfolioLoading(true)
    setPortfolioError(null)
    try {
      const response = await api.put<{ status: string; data: Portfolio }>(`/api/student/portfolio/${id}`, data)
      setPortfolios(prev => prev.map(port => port.id === id ? response.data.data : port))
      await getProfile()
      return response.data.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update portfolio'
      setPortfolioError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setPortfolioLoading(false)
    }
  }, [getProfile])

  const deletePortfolio = useCallback(async (id: string): Promise<void> => {
    setPortfolioLoading(true)
    setPortfolioError(null)
    try {
      await api.delete(`/api/student/portfolio/${id}`)
      setPortfolios(prev => prev.filter(port => port.id !== id))
      await getProfile()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete portfolio'
      setPortfolioError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setPortfolioLoading(false)
    }
  }, [getProfile])

  return {
    // Profile
    profile,
    profileLoading,
    profileError,
    getProfile,
    updateProfile,
    createProfile,
    deleteProfile,

    // Skills
    skills,
    skillsLoading,
    skillsError,
    getSkills,
    addSkills,
    removeSkill,

    // Experience
    experiences,
    experience,
    experienceLoading,
    experienceError,
    getExperiences,
    getExperience,
    createExperience,
    updateExperience,
    deleteExperience,

    // Education
    educations,
    education,
    educationLoading,
    educationError,
    getEducations,
    getEducation,
    createEducation,
    updateEducation,
    deleteEducation,

    // Language
    languages,
    language,
    languageLoading,
    languageError,
    getLanguages,
    createLanguage,
    updateLanguage,
    deleteLanguage,

    // Portfolio
    portfolios,
    portfolio,
    portfolioLoading,
    portfolioError,
    getPortfolios,
    getPortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,

    // Utilities
    clearError
  }
}

