'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function LogoutButton() {
  const t = useTranslations('Logout');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push('/login');
      } else {
        console.error('Logout failed');
        // Still redirect to login even if the API call fails
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if there's an error
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
    >
      {isLoading ? t('loggingOut') : t('button')}
    </button>
  );
}

