import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/lib/store';
import { CustomSplashScreen } from '@/components/splash-screen';
import { ThemeProvider, useTheme } from '@/components/providers/theme-provider';
import '../global.css';

function AppContent() {
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const [showSplash, setShowSplash] = useState(true);
    const { isDark } = useTheme();

    // Wait for store to hydrate before rendering
    if (!_hasHydrated || showSplash) {
        return <CustomSplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen 
                    name="index" 
                    options={{
                        // Prevent going back to landing page when authenticated
                        gestureEnabled: !isAuthenticated,
                    }}
                />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}
