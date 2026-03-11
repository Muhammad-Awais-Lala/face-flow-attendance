
import { Employee, AttendanceLog, AppSettings, ApiUsage } from '../types';

const EMPLOYEES_KEY = 'faceflow_employees';
const ATTENDANCE_KEY = 'faceflow_attendance';
const SETTINGS_KEY = 'faceflow_settings';
const API_USAGE_KEY = 'faceflow_api_usage';

const DEFAULT_SETTINGS: AppSettings = {
  confidenceThreshold: 0.85,
  autoScanInterval: 10,
  strictMode: false,
  workStartTime: "09:00",
  workEndTime: "17:00",
  enableNotifications: true
};

export const storageService = {
  getEmployees: (): Employee[] => {
    const data = localStorage.getItem(EMPLOYEES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveEmployee: (employee: Employee): void => {
    const employees = storageService.getEmployees();
    employees.push(employee);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  },

  updateEmployee: (updatedEmployee: Employee): void => {
    const employees = storageService.getEmployees();
    const index = employees.findIndex(e => e.id === updatedEmployee.id);
    if (index !== -1) {
      employees[index] = updatedEmployee;
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    }
  },

  getAttendanceLogs: (): AttendanceLog[] => {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  },

  logAttendance: (employee: Employee): AttendanceLog => {
    const logs = storageService.getAttendanceLogs();
    const settings = storageService.getSettings();
    const today = new Date().toLocaleDateString();
    const nowObj = new Date();
    const nowStr = nowObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const existingLogIndex = logs.findIndex(
      log => log.employeeId === employee.id && log.date === today
    );

    if (existingLogIndex !== -1) {
      const log = logs[existingLogIndex];
      if (!log.checkOut) {
        log.checkOut = nowStr;
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(logs));
        return log;
      }
      return log;
    } else {
      const [startH, startM] = settings.workStartTime.split(':').map(Number);
      const startTimeToday = new Date();
      startTimeToday.setHours(startH, startM, 0, 0);
      
      const isLate = nowObj > startTimeToday;

      const newLog: AttendanceLog = {
        id: crypto.randomUUID(),
        employeeId: employee.id,
        employeeName: employee.name,
        designation: employee.designation,
        date: today,
        checkIn: nowStr,
        checkOut: null,
        isLate: isLate
      };
      logs.push(newLog);
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(logs));
      return newLog;
    }
  },

  getMissedCheckouts: (): AttendanceLog[] => {
    const logs = storageService.getAttendanceLogs();
    const today = new Date().toLocaleDateString();
    return logs.filter(log => log.date !== today && log.checkOut === null);
  },

  deleteEmployee: (id: string): void => {
    const employees = storageService.getEmployees().filter(e => e.id !== id);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },

  updateSettings: (settings: AppSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  getApiUsage: (): ApiUsage => {
    const data = localStorage.getItem(API_USAGE_KEY);
    if (!data) {
      return { 
        totalRequests: 0, 
        quotaViolations: 0, 
        lastReset: new Date().toISOString(),
        lastStatus: 'healthy'
      };
    }
    return JSON.parse(data);
  },

  trackApiCall: (isQuotaViolation = false) => {
    const usage = storageService.getApiUsage();
    usage.totalRequests += 1;
    if (isQuotaViolation) {
      usage.quotaViolations += 1;
      usage.lastStatus = 'exhausted';
    } else {
      usage.lastStatus = 'healthy';
    }
    localStorage.setItem(API_USAGE_KEY, JSON.stringify(usage));
  },

  exportDatabase: () => {
    const data = {
      employees: storageService.getEmployees(),
      attendance: storageService.getAttendanceLogs(),
      settings: storageService.getSettings(),
      version: '1.0',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faceflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importDatabase: (jsonContent: string) => {
    try {
      const data = JSON.parse(jsonContent);
      if (data.employees) localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(data.employees));
      if (data.attendance) localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(data.attendance));
      if (data.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  }
};
