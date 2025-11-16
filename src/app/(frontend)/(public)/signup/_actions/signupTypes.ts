import { Respondent } from '@/payload-types';

// Error codes for signup failures
export const SIGNUP_ERROR_CODES = {
  EMAIL_EXISTS: 2001,
  VALIDATION_ERROR: 2002,
  PASSWORD_MISMATCH: 2003,
  NETWORK_ERROR: 2004,
  SERVER_ERROR: 2005,
  SIGNUP_FAILED: 2006,
} as const;

export interface SignupResponse {
  success: boolean;
  errorCode?: number;
  error?: string; // Keep for debugging, but use errorCode for UI
}

export type Result = {
  exp?: number;
  token?: string;
  user?: Respondent;
};
