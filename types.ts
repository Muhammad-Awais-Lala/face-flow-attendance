
export interface Employee {
  id: string;
  name: string;
  designation: string;
  photoBase64: string;
  registeredAt: string;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  isLate?: boolean;
}

export interface AppSettings {
  confidenceThreshold: number;
  autoScanInterval: number;
  strictMode: boolean;
  workStartTime: string; // HH:mm format
  workEndTime: string;   // HH:mm format
  enableNotifications: boolean;
}

export interface ApiUsage {
  totalRequests: number;
  quotaViolations: number;
  lastReset: string;
  lastStatus: 'healthy' | 'degraded' | 'exhausted';
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ATTENDANCE = 'ATTENDANCE',
  REGISTER = 'REGISTER',
  LOGS = 'LOGS',
  EMPLOYEES = 'EMPLOYEES',
  SETTINGS = 'SETTINGS',
  LOGIN = 'LOGIN'
}

export interface RecognitionResult {
  matchId: string | null;
  confidence: number;
  message: string;
}
