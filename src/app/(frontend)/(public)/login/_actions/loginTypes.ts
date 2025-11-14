import { Member } from '@/payload-types';

// Error codes for login failures
export const LOGIN_ERROR_CODES = {
  INVALID_CREDENTIALS: 1001,
  USER_NOT_FOUND: 1002,
  ACCOUNT_DISABLED: 1003,
  NETWORK_ERROR: 1004,
  SERVER_ERROR: 1005,
  VALIDATION_ERROR: 1006,
} as const;

export interface LoginResponse {
  success: boolean;
  errorCode?: number;
  error?: string; // Keep for debugging, but use errorCode for UI
}

export type Result = {
  exp?: number;
  token?: string;
  user?: Member;
};
