import { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface TopStudent {
  id: string;
  name: string;
  email: string;
  image: string | null;
  profileComplete: number;
  profileRanking: number | null;
  availability: string | null;
  description: string | null;
  salaryExpectation: number | null;
  applicationCount: number;
  contractCount: number;
  totalActivity: number;
}

export interface TopStudentDetail extends TopStudent {
  status: string;
  skills: string[];
  experiences: any[];
  educations: any[];
  languages: any[];
  portfolios: any[];
  applications: any[];
  contracts: any[];
}

export interface TopStudentsResponse {
  students: TopStudent[];
  totalPages: number;
  currentPage: number;
  totalStudents: number;
}

export const useTopStudentsHandler = () => {
  const [students, setStudents] = useState<TopStudent[]>([]);
  const [student, setStudent] = useState<TopStudentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const getTopStudents = async (page = 1, limit = 10, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<TopStudentsResponse>(`${API_URL}/api/student/top-students`, {
        params: { page, limit, search },
      });
      setStudents(response.data.students);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setTotalStudents(response.data.totalStudents);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch top students';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getTopStudentById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<TopStudentDetail>(`${API_URL}/api/student/top-students/${id}`);
      setStudent(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch student';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    students,
    student,
    loading,
    error,
    totalPages,
    currentPage,
    totalStudents,
    getTopStudents,
    getTopStudentById,
  };
};

