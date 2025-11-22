'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isAuthenticated, initAuth } = useAuthStore();

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (isAuthenticated && user?.role !== 'SUPER_ADMIN') {
            router.push('/dashboard');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-background">
                {children}
            </div>
        </ProtectedRoute>
    );
}

