import { z } from 'zod';

// User-related types
export enum UserRole {
  PLAYER = 'PLAYER',
  COACH = 'COACH',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN'
}

export enum TeamRole {
  PLAYER = 'PLAYER',
  CAPTAIN = 'CAPTAIN',
  COACH = 'COACH'
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

// Base entity interfaces
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  school?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  school: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  status: MemberStatus;
  joinedAt: Date;
}

// Question-related types
export enum QuestionCategory {
  LITERATURE = 'LITERATURE',
  HISTORY = 'HISTORY',
  SCIENCE = 'SCIENCE',
  FINE_ARTS = 'FINE_ARTS',
  RELIGION = 'RELIGION',
  MYTHOLOGY = 'MYTHOLOGY',
  PHILOSOPHY = 'PHILOSOPHY',
  SOCIAL_SCIENCE = 'SOCIAL_SCIENCE',
  CURRENT_EVENTS = 'CURRENT_EVENTS',
  GEOGRAPHY = 'GEOGRAPHY',
  OTHER = 'OTHER'
}

export enum QuestionDifficulty {
  MIDDLE_SCHOOL = 'MIDDLE_SCHOOL',
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  COLLEGIATE = 'COLLEGIATE',
  OPEN = 'OPEN'
}

export interface Question {
  id: string;
  text: string;
  answer: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  source?: string;
  year?: number;
  tournament?: string;
  packet?: number;
  questionNumber?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response schemas
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  school: z.string().optional()
});

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const CreateQuestionSchema = z.object({
  text: z.string().min(10),
  answer: z.string().min(1),
  category: z.nativeEnum(QuestionCategory),
  difficulty: z.nativeEnum(QuestionDifficulty),
  source: z.string().optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear()).optional(),
  tournament: z.string().optional(),
  packet: z.number().int().positive().optional(),
  questionNumber: z.number().int().positive().optional()
});

// Type exports from schemas
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type CreateQuestionRequest = z.infer<typeof CreateQuestionSchema>;

// API Response types
export interface AuthResponse {
  success: boolean;
  user?: Omit<User, 'password'>;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// Practice session types
export interface PracticeSession {
  id: string;
  userId: string;
  name?: string;
  filters: {
    categories?: QuestionCategory[];
    difficulties?: QuestionDifficulty[];
    questionCount: number;
  };
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  currentQuestionIndex: number;
  startedAt: Date;
  completedAt?: Date;
  totalQuestions: number;
}

export interface PracticeResponse {
  id: string;
  sessionId: string;
  questionId: string;
  userAnswer?: string;
  isCorrect?: boolean;
  responseTime?: number; // milliseconds
  answeredAt?: Date;
}