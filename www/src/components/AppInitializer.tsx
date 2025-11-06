'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Path for the startup page
const STARTUP_PATH = '/startup';
// Key for localStorage flag
const INIT_FLAG_KEY = 'webappInitialized';

export default function AppInitializer({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isInitialized, setIsInitialized] = useState<boolean | null>(null); // null initially, true/false after check

    useEffect(() => {
        // Check both localStorage and cookie on the client side
        // Cookie is checked by middleware, localStorage is for client-side logic
        const localStorageInitialized = localStorage.getItem(INIT_FLAG_KEY) === 'true';
        
        // Also check if cookie exists (should match localStorage)
        const cookieInitialized = document.cookie.split('; ').some(cookie => cookie === 'app_initialized=true');
        
        // If localStorage says initialized but cookie doesn't exist, set the cookie
        if (localStorageInitialized && !cookieInitialized) {
            console.log('AppInitializer: Setting missing initialization cookie');
            document.cookie = 'app_initialized=true; path=/; max-age=31536000; SameSite=Lax';
        }
        
        const initialized = localStorageInitialized || cookieInitialized;
        setIsInitialized(initialized);

        console.log(`AppInitializer: Initialized flag = ${initialized} (localStorage: ${localStorageInitialized}, cookie: ${cookieInitialized})`);

        // If not initialized and not already on the startup page, redirect
        if (!initialized && pathname !== STARTUP_PATH) {
            console.log(`AppInitializer: Redirecting to ${STARTUP_PATH}`);
            router.replace(STARTUP_PATH);
        } else if (initialized && pathname === STARTUP_PATH) {
            // If somehow initialized but still on startup, redirect home
            console.log(`AppInitializer: Already initialized, redirecting from ${STARTUP_PATH} to /`);
            router.replace('/');
        }
    }, [pathname, router]);

    // Don't render children until the initialization check is complete and successful,
    // or if we are already on the startup page (let it handle its own rendering)
    if (isInitialized === null || (!isInitialized && pathname !== STARTUP_PATH) || (isInitialized && pathname === STARTUP_PATH)) {
        // Render minimal content or a loading indicator while checking/redirecting
        // Returning null prevents rendering children during the redirect flicker
        return null;
    }

    // Render children only if initialized and not on the startup page
    return <>{children}</>;
} 