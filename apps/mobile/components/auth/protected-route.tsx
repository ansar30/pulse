import { useEffect } from 'react';
import { useRouter, Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import { View, ActivityIndicator } from 'react-native';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, _hasHydrated } = useAuthStore();

    if (!_hasHydrated) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return <>{children}</>;
}

