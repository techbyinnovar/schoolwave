"use client";

import { useEffect, useState, ComponentType } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const DEMO_CODE_STORAGE_KEY = 'demo_code';
const DEMO_2FA_PATH = '/demo_2fa';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
    <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading & Verifying Access...</p>
  </div>
);

export default function withDemoAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Ensure this runs only on the client
      if (typeof window !== 'undefined') {
        const demoCode = localStorage.getItem(DEMO_CODE_STORAGE_KEY);
        const isValidCode = demoCode && demoCode.trim() !== ''; // Simple presence check

        if (!isValidCode) {
          // Avoid redirecting if already on the 2FA page or if it's a non-browser environment during SSR pass
          if (pathname !== DEMO_2FA_PATH) {
            const redirectUrl = `${DEMO_2FA_PATH}?redirect_url=${encodeURIComponent(pathname)}`;
            router.replace(redirectUrl);
            // No need to setIsLoading(false) here as redirection will unmount this component
          } else {
            // If already on 2FA page and no code, just stop loading and let the 2FA page render
            setIsLoading(false);
          }
        } else {
          setIsAuthorized(true);
          setIsLoading(false);
        }
      }
    }, [router, pathname]);

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (isAuthorized) {
        return <WrappedComponent {...props} />;
    }
    
    // If not loading and not authorized, it means we are likely on the 2FA page itself,
    // or the redirection hasn't happened yet. The 2FA page should render.
    // If this HOC is somehow used on the 2FA page itself (it shouldn't be),
    // this prevents an infinite loop of rendering LoadingSpinner.
    // For any other page, redirection should have occurred.
    if (pathname === DEMO_2FA_PATH && !isAuthorized) {
        return <LoadingSpinner />; // Or null, or a specific message if preferred
    }

    return <LoadingSpinner />; // Fallback for safety, though redirection should handle most cases.
  };

  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithAuth.displayName = `withDemoAuth(${wrappedComponentName})`;
  
  return ComponentWithAuth;
}
