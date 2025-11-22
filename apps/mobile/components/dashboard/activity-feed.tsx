import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { MessageSquare, UserPlus, FolderPlus, CheckCircle, Clock } from 'lucide-react-native';

interface Activity {
    id: string;
    type: 'message' | 'user_joined' | 'project_created' | 'task_completed';
    title: string;
    description?: string;
    timestamp: string;
    user?: {
        name: string;
    };
}

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const { colors } = useTheme();
    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'message':
                return { Icon: MessageSquare, color: colors.primary };
            case 'user_joined':
                return { Icon: UserPlus, color: colors.success };
            case 'project_created':
                return { Icon: FolderPlus, color: colors.info };
            case 'task_completed':
                return { Icon: CheckCircle, color: colors.warning };
            default:
                return { Icon: Clock, color: colors.textTertiary };
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (activities.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Clock size={32} color={colors.textTertiary} strokeWidth={1.5} />
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No recent activity</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {activities.map((activity, index) => {
                const { Icon, color } = getActivityIcon(activity.type);

                return (
                    <View key={activity.id || index} style={[styles.activityItem, { backgroundColor: colors.surface }]}>
                        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                            <Icon size={18} color={color} strokeWidth={2} />
                        </View>
                        <View style={styles.activityContent}>
                            <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                            {activity.description && (
                                <Text style={[styles.activityDescription, { color: colors.textSecondary }]} numberOfLines={1}>
                                    {activity.description}
                                </Text>
                            )}
                            <Text style={[styles.activityTime, { color: colors.textTertiary }]}>{formatTime(activity.timestamp)}</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    activityDescription: {
        fontSize: 13,
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 11,
        fontWeight: '500',
    },
});
