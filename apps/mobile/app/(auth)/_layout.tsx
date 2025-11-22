import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';

export default function AuthLayout() {
    const { isAuthenticated, _hasHydrated } = useAuthStore();
    const { colors } = useTheme();

    if (!_hasHydrated) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/chat" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
