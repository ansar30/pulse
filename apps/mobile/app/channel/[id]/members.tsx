import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/providers/theme-provider';
import { Avatar } from '@/components/ui/avatar';
import { ArrowLeft, Users as UsersIcon, X } from 'lucide-react-native';
import { chatApi } from '@/lib/api-client';
import { ErrorState } from '@/components/error-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';

interface Channel {
    id: string;
    name: string;
    type: string;
    createdBy?: string;
    members?: Array<{
        userId: string;
        role?: string;
        user?: {
            id: string;
            email: string;
            profile?: {
                firstName?: string;
                lastName?: string;
                avatar?: string;
            };
        };
    }>;
}

export default function ChannelMembersScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const { colors } = useTheme();
    const [channel, setChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [removingMember, setRemovingMember] = useState<string | null>(null);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isCreator = channel?.createdBy === user?.id;
    const canManage = isAdmin || isCreator;

    const fetchChannel = async () => {
        if (!user?.tenantId || !id) return;

        try {
            setLoading(true);
            setError(null);
            const response = await chatApi.getChannel(user.tenantId, id);
            if (response.success && response.data) {
                setChannel(response.data);
            } else {
                setError(new Error('Failed to load channel'));
            }
        } catch (err) {
            console.error('Failed to fetch channel:', err);
            setError(err instanceof Error ? err : new Error('Failed to load channel'));
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!user?.tenantId || !id) return;

        Alert.alert(
            'Remove Member',
            'Are you sure you want to remove this member from the channel?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setRemovingMember(userId);
                            const response = await chatApi.removeChannelMember(user.tenantId, id, userId);
                            if (response.success) {
                                await fetchChannel(); // Reload channel
                            }
                        } catch (err: any) {
                            console.error('Failed to remove member:', err);
                            Alert.alert('Error', err.response?.data?.message || 'Failed to remove member');
                        } finally {
                            setRemovingMember(null);
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        fetchChannel();
    }, [id, user?.tenantId]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
                    </TouchableOpacity>
                    <LoadingSkeleton width={200} height={24} />
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.content}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <View key={i} style={styles.skeletonItem}>
                            <LoadingSkeleton width={44} height={44} borderRadius={22} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <LoadingSkeleton width="60%" height={16} borderRadius={8} />
                                <LoadingSkeleton width="40%" height={14} borderRadius={8} style={{ marginTop: 8 }} />
                            </View>
                        </View>
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ErrorState error={error} onRetry={fetchChannel} />
            </SafeAreaView>
        );
    }

    if (!channel) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ErrorState error={new Error('Channel not found')} onRetry={() => router.back()} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Channel Members</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {channel.members?.length || 0} {channel.members?.length === 1 ? 'member' : 'members'}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Members List */}
            <ScrollView 
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {channel.members && channel.members.length > 0 ? (
                    channel.members.map((member: any) => {
                        const memberUser = member.user || {};
                        const profile = memberUser.profile || {};
                        const memberName = profile.firstName || profile.lastName
                            ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || memberUser.email
                            : memberUser.email || 'Unknown User';
                        
                        return (
                            <View key={member.userId || member.id} style={[styles.memberItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                                <Avatar user={memberUser} size="medium" />
                                <View style={styles.memberInfo}>
                                    <Text style={[styles.memberName, { color: colors.text }]}>{memberName}</Text>
                                    <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>{memberUser.email || 'No email'}</Text>
                                </View>
                                {member.role && (
                                    <View style={[styles.memberRoleBadge, { backgroundColor: colors.surfaceElevated }]}>
                                        <Text style={[styles.memberRoleText, { color: colors.textSecondary }]}>{member.role}</Text>
                                    </View>
                                )}
                                {canManage && member.userId !== channel.createdBy && (
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => handleRemoveMember(member.userId)}
                                        disabled={removingMember === member.userId}
                                    >
                                        <X size={18} color={colors.error} strokeWidth={2.5} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <UsersIcon size={64} color={colors.textTertiary} strokeWidth={1.5} />
                        <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No members found</Text>
                        <Text style={[styles.emptyStateSubtext, { color: colors.textTertiary }]}>This channel has no members yet</Text>
                    </View>
                )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    skeletonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
    },
    memberInfo: {
        flex: 1,
        minWidth: 0,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    memberEmail: {
        fontSize: 14,
    },
    memberRoleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    memberRoleText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    removeButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        marginTop: 8,
    },
});

