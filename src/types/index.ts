// ============================================================
// Domain types — business entities
// ============================================================

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: number;
  authors: string[];
  creationDate: string;
}

export interface Author {
  id: string;
  name: string;
}

export interface User {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Enrollment {
  id: string;
  userEmail: string;
  courseId: string;
  enrolledAt: string;
  courseName?: string;
}

// ============================================================
// API response types
// ============================================================

export interface ApiResponse<T> {
  successful: boolean;
  result?: T;
  errors?: string[];
}

export interface LoginApiResponse {
  successful: boolean;
  result: string;
  user: User;
}

export interface RegisterApiResponse {
  successful: boolean;
  user: User;
}

// ============================================================
// Redux slice state types
// ============================================================

export type LoadingStatus =
  | 'idle'
  | 'bootstrapping'
  | 'loading'
  | 'succeeded'
  | 'failed';

export interface UserState {
  name: string | null;
  email: string | null;
  isAuth: boolean;
  role: 'admin' | 'user' | null;
  status: LoadingStatus;
  error: string | null;
}

export interface CoursesState {
  courses: Course[];
  status: LoadingStatus;
  error: string | null;
}

export interface AuthorsState {
  authors: Author[];
  status: LoadingStatus;
  error: string | null;
}

export interface EnrollmentsState {
  enrollments: Enrollment[];
  status: LoadingStatus;
  error: string | null;
}

// ============================================================
// Form types
// ============================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
}

export interface CourseFormFields {
  title: string;
  description: string;
  duration: string | number;
  newAuthorName: string;
}

// ============================================================
// Utility types
// ============================================================

export type UserRole = 'admin' | 'user';