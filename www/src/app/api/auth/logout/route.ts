import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'subconverter_auth';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      success: true,
    });

    // Clear the auth cookie
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}

