import { Tabs, Redirect } from 'expo-router';
import { Home, MessageSquare, FolderKanban, Settings, Shield, Crown } from 'lucide-react-native';
import { useAuthStore } from '@/lib/store';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';

export default function TabsLayout() {
    const { user, isAuthenticated, _hasHydrated } = useAuthStore();
    const { colors } = useTheme();

    if (!_hasHydrated) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    const isAdmin = user?.role === 'ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const canSeeDashboard = isAdmin || isSuperAdmin;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    height: 80,
                    paddingBottom: 12,
                    paddingTop: 12,
                    elevation: 12,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                },
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: '600',
                    marginTop: 6,
                    marginBottom: 0,
                },
                tabBarIconStyle: {
                    marginTop: 0,
                },
            }}
            initialRouteName="chat"
        >
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, size }) => <MessageSquare size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <Home size={26} color={color} />,
                    href: canSeeDashboard ? '/(tabs)/dashboard' : null,
                }}
            />
            <Tabs.Screen
                name="projects"
                options={{
                    title: 'Projects',
                    tabBarIcon: ({ color, size }) => <FolderKanban size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => <Settings size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="admin"
                options={{
                    href: null, // Hidden from tab bar, accessible from settings
                }}
            />
            <Tabs.Screen
                name="empire"
                options={{
                    href: null, // Hidden from tab bar, accessible from settings
                }}
            />
        </Tabs>
    );
}
