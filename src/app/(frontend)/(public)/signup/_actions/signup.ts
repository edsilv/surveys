'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { cookies } from 'next/headers';
import { SIGNUP_ERROR_CODES, SignupResponse, Result } from './signupTypes';

interface SignupParams {
  email: string;
  password: string;
}

export async function signup({ email, password }: SignupParams): Promise<SignupResponse> {
  const payload = await getPayload({ config });

  try {
    await payload.create({
      collection: 'members',
      data: {
        email,
        password,
      },
    });

    const result: Result = await payload.login({
      collection: 'members',
      data: {
        email,
        password,
      },
    });

    if (result.token) {
      const cookieStore = await cookies();
      cookieStore.set({
        name: 'payload-token',
        value: result.token,
        httpOnly: true,
        path: '/',
      });
      return { success: true };
    } else {
      return {
        success: false,
        errorCode: SIGNUP_ERROR_CODES.SIGNUP_FAILED,
        error: 'Signup failed.',
      };
    }
  } catch (error) {
    console.error('Signup error:', error);

    // Map specific errors to error codes
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('E11000') || errorMessage.includes('duplicate') || errorMessage.includes('email')) {
      return {
        success: false,
        errorCode: SIGNUP_ERROR_CODES.EMAIL_EXISTS,
        error: 'Email already exists.',
      };
    }

    if (errorMessage.includes('validation') || errorMessage.includes('required')) {
      return {
        success: false,
        errorCode: SIGNUP_ERROR_CODES.VALIDATION_ERROR,
        error: 'Validation error.',
      };
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        success: false,
        errorCode: SIGNUP_ERROR_CODES.NETWORK_ERROR,
        error: 'Network error.',
      };
    }

    return {
      success: false,
      errorCode: SIGNUP_ERROR_CODES.SERVER_ERROR,
      error: 'An error occurred during signup.',
    };
  }
}
