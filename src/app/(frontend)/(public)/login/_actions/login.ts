'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { cookies } from 'next/headers';
import { LOGIN_ERROR_CODES, LoginResponse, Result } from './loginTypes';

interface LoginParams {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginParams): Promise<LoginResponse> {
  console.log('Login action called with:', { email, password });
  const payload = await getPayload({ config });

  try {
    const result: Result = await payload.login({
      collection: 'members',
      data: {
        email,
        password,
      },
    });

    console.log('Login result received:', result);

    if (result.token) {
      const cookieStore = await cookies();
      cookieStore.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      });

      console.log('Login successful, token set in cookies');

      return { success: true };
    } else {
      return {
        success: false,
        errorCode: LOGIN_ERROR_CODES.INVALID_CREDENTIALS,
        error: 'Invalid email or password.',
      };
    }
  } catch (error: unknown) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Determine error code based on error type
    let errorCode: number = LOGIN_ERROR_CODES.SERVER_ERROR;
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      errorCode = LOGIN_ERROR_CODES.NETWORK_ERROR;
    } else if (errorMessage.includes('validation')) {
      errorCode = LOGIN_ERROR_CODES.VALIDATION_ERROR;
    }

    return {
      success: false,
      errorCode,
      error: errorMessage,
    };
  }
}
