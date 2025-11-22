import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/providers/theme-provider';
import { Users, MessageSquare, TrendingUp, Activity, ArrowUpRight, Briefcase } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { adminApi, usersApi, chatApi, projectsApi } from '@/lib/api-client';
import { ErrorState } from '@/components/error-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { Redirect } from 'expo-router';

interface DashboardStats {
    teamMembers: number;
    activeChats: number;
    projects: number;
    tasks: number;
}

interface ActivityItem {
    id: string;
    type: 'message' | 'user_joined' | 'project_created' | 'task_completed';
    title: string;
    description?: string;
    timestamp: string;
    user?: {
        name: string;
    };
}

export default function DashboardScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { colors } = useTheme();
    const [stats, setStats] = useState<DashboardStats>({ teamMembers: 0, activeChats: 0, projects: 0, tasks: 0 });
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Redirect non-admin users to chat
    const isAdmin = user?.role === 'ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    if (!isAdmin && !isSuperAdmin) {
        return <Redirect href="/(tabs)/chat" />;
    }

    const fetchDashboardData = async () => {
        try {
            setError(null);

            if (!user?.tenantId) {
                throw new Error('No tenant ID found');
            }

            // Fetch data in parallel
            const [usersResponse, channelsResponse, projectsResponse] = await Promise.all([
                usersApi.getAll(user.tenantId),
                chatApi.getChannels(user.tenantId),
                projectsApi.getAll(user.tenantId),
            ]);

            const users = usersResponse.data || [];
            const channels = channelsResponse.data || [];
            const projects = projectsResponse.data || [];

            // Calculate tasks from projects metadata
            const totalTasks = projects.reduce((sum: number, project: any) => {
                const tasks = project.settings?.tasks || [];
                return sum + tasks.length;
            }, 0);

            setStats({
                teamMembers: users.length,
                activeChats: channels.length,
                projects: projects.length,
                tasks: totalTasks || 0,
            });

            // Generate recent activities
            const recentActivities: ActivityItem[] = [];

            channels.slice(0, 3).forEach((channel: any) => {
                recentActivities.push({
                    id: `channel-${channel.id}`,
                    type: 'message',
                    title: `New activity in #${channel.name}`,
                    description: channel.description || 'Channel activity',
                    timestamp: channel.updatedAt,
                });
            });

            users.slice(0, 2).forEach((u: any) => {
                recentActivities.push({
                    id: `user-${u.id}`,
                    type: 'user_joined',
                    title: `${u.profile?.firstName || 'User'} ${u.profile?.lastName || ''} joined`,
                    description: u.email,
                    timestamp: u.createdAt || new Date().toISOString(),
                });
            });

            projects.slice(0, 2).forEach((project: any) => {
                recentActivities.push({
                    id: `project-${project.id}`,
                    type: 'project_created',
                    title: `Project "${project.name}" created`,
                    description: project.description || 'New project',
                    timestamp: project.createdAt || new Date().toISOString(),
                });
            });

            recentActivities.sort((a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            setActivities(recentActivities.slice(0, 8));
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.tenantId) {
            fetchDashboardData();
        } else if (user && !user.tenantId) {
            // User exists but no tenantId - set error and stop loading
            setError(new Error('No tenant ID found'));
            setLoading(false);
        } else if (!user) {
            // No user at all - stop loading
            setLoading(false);
        }
    }, [user?.tenantId, user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    // Get user's full name
    const getUserName = () => {
        if (user?.profile?.firstName && user?.profile?.lastName) {
            return `${user.profile.firstName} ${user.profile.lastName}`;
        }
        if (user?.profile?.firstName) {
            return user.profile.firstName;
        }
        if (user?.email) {
            return user.email.split('@')[0];
        }
        return 'User';
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <LoadingSkeleton width={120} height={18} style={{ marginBottom: 8 }} />
                        <LoadingSkeleton width={200} height={28} />
                    </View>
                    <LoadingSkeleton width={70} height={28} borderRadius={14} />
                </View>
                <View style={styles.statsGrid}>
                    {[1, 2, 3, 4].map((i) => (
                        <View key={i} style={styles.statCardWrapper}>
                            <LoadingSkeleton width="100%" height="100%" borderRadius={16} />
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    if (error) {
        const isTenantIdError = error.message === 'No tenant ID found';
        const errorMessage = isTenantIdError 
            ? 'Your session data is incomplete. Please log out and log back in to refresh your account information.'
            : error.message;
        return <ErrorState error={errorMessage} onRetry={isTenantIdError ? undefined : fetchDashboardData} />;
    }

    const statsData = [
        {
            icon: Users,
            label: 'Team Members',
            value: stats.teamMembers,
            gradient: ['#667eea', '#764ba2'],
            iconBg: '#f0f4ff'
        },
        {
            icon: MessageSquare,
            label: 'Active Chats',
            value: stats.activeChats,
            gradient: ['#f093fb', '#f5576c'],
            iconBg: '#fff0f6'
        },
        {
            icon: Briefcase,
            label: 'Projects',
            value: stats.projects,
            gradient: ['#4facfe', '#00f2fe'],
            iconBg: '#f0faff'
        },
        {
            icon: Activity,
            label: 'Tasks',
            value: stats.tasks,
            gradient: ['#43e97b', '#38f9d7'],
            iconBg: '#f0fff4'
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 4, backgroundColor: colors.surface }]}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back,</Text>
                    <Text style={[styles.userName, { color: colors.text }]}>{getUserName()}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.badgeText, { color: colors.primary }]}>{user?.role || 'MEMBER'}</Text>
                </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {statsData.map((stat, index) => (
                    <View key={index} style={styles.statCardWrapper}>
                        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                            <View style={[styles.statIconContainer, { backgroundColor: stat.iconBg }]}>
                                <stat.icon size={22} color={stat.gradient[0]} strokeWidth={2.5} />
                            </View>
                            <View style={styles.statContent}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
                    <TouchableOpacity style={styles.seeAllButton}>
                        <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
                        <ArrowUpRight size={14} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
                <ActivityFeed activities={activities} />
            </View>

            {/* Quick Actions */}
            <View style={[styles.section, { marginBottom: 32 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface }]}>
                        <View style={[styles.actionIconContainer, { backgroundColor: colors.primary + '15' }]}>
                            <MessageSquare size={20} color={colors.primary} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>Start Chat</Text>
                        <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>Begin a conversation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface }]}>
                        <View style={[styles.actionIconContainer, { backgroundColor: colors.info + '15' }]}>
                            <Briefcase size={20} color={colors.info} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>New Project</Text>
                        <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>Create a project</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    headerLeft: {
        flex: 1,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    userName: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    badge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 14,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 20,
        gap: 12,
    },
    statCardWrapper: {
        width: '48%',
    },
    statCard: {
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statContent: {
        gap: 4,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 28,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    actionCard: {
        flex: 1,
        borderRadius: 16,
        padding: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    actionDescription: {
        fontSize: 12,
        fontWeight: '500',
        letterSpacing: 0.1,
    },
});
