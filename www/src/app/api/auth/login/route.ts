import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, generateAuthToken } from '@/lib/auth';

const AUTH_COOKIE_NAME = 'subconverter_auth';

export async function POST(request: NextRequest) {
  try {
    // Check if authentication is enabled
    const authEnabled = process.env.AUTH_ENABLE === 'true';
    
    if (!authEnabled) {
      return NextResponse.json(
        { success: false, error: 'Authentication is not enabled' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Validate credentials
    const valid = validateCredentials(username, password);

    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateAuthToken(username);

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      token,
    });

    // Set cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

