'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isAuthenticated, initAuth, _hasHydrated } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Only run auth check once hydration is complete
        if (_hasHydrated) {
            initAuth();
            setIsChecking(false);
        }
    }, [_hasHydrated, initAuth]);

    useEffect(() => {
        if (!isChecking && _hasHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isChecking, _hasHydrated, router]);

    // Show loading state while hydrating or checking auth
    if (!_hasHydrated || isChecking || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return <>{children}</>;
}
