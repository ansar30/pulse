import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/providers/theme-provider';
import { MessageSquare, Search, Plus, Hash, Lock, Users, User, MessageCircle, LogIn, LogOut } from 'lucide-react-native';
import { chatApi, usersApi, adminApi } from '@/lib/api-client';
import { ErrorState } from '@/components/error-state';
import { EmptyState } from '@/components/empty-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { CreateChannelModal } from '@/components/chat/create-channel-modal';
import { CreateDMModal } from '@/components/chat/create-dm-modal';
import { Avatar } from '@/components/ui/avatar';

interface Channel {
    id: string;
    name: string;
    type: string;
    description?: string;
    members?: any[];
    _count?: { members: number; messages: number };
    lastMessage?: {
        content: string;
        createdAt: string;
        user?: {
            id: string;
            email: string;
            profile?: {
                firstName?: string;
                lastName?: string;
            };
        };
    } | null;
    updatedAt: string;
}

interface UserData {
    id: string;
    email: string;
    profile?: {
        firstName?: string;
        lastName?: string;
    };
}

export default function ChatScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuthStore();
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [showCreateDM, setShowCreateDM] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [isJoining, setIsJoining] = useState<string | null>(null);
    const [isLeaving, setIsLeaving] = useState<string | null>(null);

    const fetchChannels = async () => {
        try {
            setError(null);

            if (!user?.tenantId) {
                throw new Error('No tenant ID found');
            }

            // Fetch both channels and DMs separately
            const [channelsResponse, dmsResponse] = await Promise.all([
                chatApi.getChannels(user.tenantId),
                chatApi.getDirectMessages(user.tenantId),
            ]);

            const channelsData = channelsResponse.data || [];
            const dmsData = dmsResponse.data || [];

            // Combine channels and DMs into one array for display
            setChannels([...channelsData, ...dmsData]);
        } catch (err) {
            console.error('Chat fetch error:', err);
            setError(err instanceof Error ? err : new Error('Failed to load channels'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchUsers = async () => {
        if (!user?.tenantId) return;

        try {
            setLoadingUsers(true);
            const response = await usersApi.getAll(user.tenantId);
            setUsers(response.data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleCreateChannel = async (data: { name: string; description?: string; type: 'PUBLIC' | 'PRIVATE' }) => {
        if (!user?.tenantId) return;

        try {
            await chatApi.createChannel(user.tenantId, data);
            await fetchChannels();
        } catch (err) {
            console.error('Failed to create channel:', err);
            throw err;
        }
    };

    const handleCreateDM = async (recipientId: string) => {
        if (!user?.tenantId) return;

        try {
            const response = await adminApi.createDirectMessage(user.tenantId, recipientId);
            await fetchChannels();
            if (response.data?.id) {
                router.push(`/channel/${response.data.id}`);
            }
        } catch (err) {
            console.error('Failed to create DM:', err);
            throw err;
        }
    };

    const handleChannelPress = (channel: Channel) => {
        router.push(`/channel/${channel.id}`);
    };

    const isMember = (channel: Channel) => {
        if (!user?.id || !channel.members) return false;
        return channel.members.some((m: any) => m.userId === user.id);
    };

    const handleJoinChannel = async (channelId: string) => {
        if (!user?.tenantId) return;
        setIsJoining(channelId);
        try {
            const response = await chatApi.joinChannel(user.tenantId, channelId);
            if (response.success) {
                await fetchChannels();
            }
        } catch (err: any) {
            console.error('Failed to join channel:', err);
            alert(err.response?.data?.message || 'Failed to join channel');
        } finally {
            setIsJoining(null);
        }
    };

    const handleLeaveChannel = async (channelId: string) => {
        if (!user?.tenantId) return;
        setIsLeaving(channelId);
        try {
            const response = await chatApi.leaveChannel(user.tenantId, channelId);
            if (response.success) {
                await fetchChannels();
            }
        } catch (err: any) {
            console.error('Failed to leave channel:', err);
            alert(err.response?.data?.message || 'Failed to leave channel');
        } finally {
            setIsLeaving(null);
        }
    };

    const getDMName = (dm: Channel): string => {
        // Try to get name from members array
        if (dm.members && dm.members.length > 0) {
            const otherMember = dm.members.find((m: any) => m.userId !== user?.id);
            if (otherMember?.user?.profile) {
                const { firstName, lastName } = otherMember.user.profile;
                const fullName = `${firstName || ''} ${lastName || ''}`.trim();
                if (fullName) return fullName;
                return otherMember.user.email || 'Unknown User';
            }
        }

        // Fallback: if name looks like a proper name (not an ID), use it
        if (dm.name && dm.name.length < 50 && !dm.name.includes('-') && !/^[0-9a-f]{24}$/i.test(dm.name)) {
            return dm.name;
        }

        return 'Direct Message';
    };

    useEffect(() => {
        if (user?.tenantId) {
            fetchChannels();
            fetchUsers();
        }
    }, [user?.tenantId]);

    const onRefresh = () => {
        setRefreshing(true);
        Promise.all([fetchChannels(), fetchUsers()]);
    };

    const filteredChannels = channels.filter((channel) => {
        if (!searchQuery.trim()) return true;
        
        const query = searchQuery.toLowerCase();
        const channelName = channel.name?.toLowerCase() || '';
        const channelDescription = channel.description?.toLowerCase() || '';
        
        // Search in channel name and description
        if (channelName.includes(query) || channelDescription.includes(query)) {
            return true;
        }
        
        // For DIRECT channels, also search in DM participant names
        if (channel.type === 'DIRECT') {
            const dmName = getDMName(channel).toLowerCase();
            if (dmName.includes(query)) {
                return true;
            }
        }
        
        return false;
    });

    const publicChannels = filteredChannels.filter((c) => c.type === 'PUBLIC');
    const privateChannels = filteredChannels.filter((c) => c.type === 'PRIVATE');
    // Filter DMs to ensure strict tenant isolation
    // The API already filters channels by tenantId, but we add an extra safety check
    // Only show DIRECT type channels (DMs are already filtered by tenant on the backend)
    const directMessages = filteredChannels.filter((c) => {
        if (c.type !== 'DIRECT') return false;
        
        // Verify the channel has members (at least 2 for a DM)
        if (c.members && c.members.length >= 2) {
            // At least one other member should have valid user data
            return c.members.some((member: any) => member.user != null);
        }
        return false; // Don't show DMs without valid members
    });

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
                <View style={[styles.header, { paddingTop: insets.top + 4, backgroundColor: colors.surface }]}>
                    <LoadingSkeleton width={150} height={28} />
                    <LoadingSkeleton width={44} height={44} borderRadius={22} />
                </View>
                <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <LoadingSkeleton width="100%" height={44} borderRadius={12} />
                </View>
                <View style={{ padding: 20 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <LoadingSkeleton key={i} width="100%" height={68} borderRadius={12} style={{ marginBottom: 10 }} />
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return <ErrorState error={error} onRetry={fetchChannels} />;
    }

    if (channels.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
                <View style={[styles.header, { paddingTop: insets.top + 4, backgroundColor: colors.surface }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={[styles.newChatButton, { backgroundColor: colors.primary + '15' }]}
                            onPress={() => setShowCreateDM(true)}
                        >
                            <MessageCircle size={20} color={colors.primary} strokeWidth={2.5} />
                        </TouchableOpacity>
                        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                            <TouchableOpacity
                                style={[styles.newChatButton, { backgroundColor: colors.primary + '15' }]}
                                onPress={() => setShowCreateChannel(true)}
                            >
                                <Plus size={22} color={colors.primary} strokeWidth={2.5} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <EmptyState
                    icon={MessageSquare}
                    title="No Messages Yet"
                    message="Start a conversation by creating a new channel or direct message."
                    actionLabel="Create Channel"
                    onAction={() => setShowCreateChannel(true)}
                />
                <View style={styles.emptyStateActions}>
                    <TouchableOpacity
                        style={[styles.emptyStateDMButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => setShowCreateDM(true)}
                    >
                        <MessageCircle size={18} color={colors.primary} strokeWidth={2.5} />
                        <Text style={[styles.emptyStateDMButtonText, { color: colors.primary }]}>New Direct Message</Text>
                    </TouchableOpacity>
                </View>
                <CreateChannelModal
                    visible={showCreateChannel}
                    onClose={() => setShowCreateChannel(false)}
                    onCreate={handleCreateChannel}
                />
                <CreateDMModal
                    visible={showCreateDM}
                    onClose={() => setShowCreateDM(false)}
                    onCreate={handleCreateDM}
                    users={users}
                    loading={loadingUsers}
                    currentUserId={user?.id}
                />
            </SafeAreaView>
        );
    }

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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={[styles.newChatButton, { backgroundColor: colors.primary + '15' }]}
                        onPress={() => setShowCreateDM(true)}
                    >
                        <MessageCircle size={20} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                    {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                        <TouchableOpacity
                            style={[styles.newChatButton, { backgroundColor: colors.primary + '15' }]}
                            onPress={() => setShowCreateChannel(true)}
                        >
                            <Plus size={22} color={colors.primary} strokeWidth={2.5} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textTertiary} strokeWidth={2} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search channels or messages..."
                    placeholderTextColor={colors.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            >
                {/* Public Channels */}
                {publicChannels.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Channels</Text>
                            <Text style={[styles.sectionCount, { color: colors.textSecondary, backgroundColor: colors.surfaceElevated }]}>{publicChannels.length}</Text>
                        </View>
                        {publicChannels.map((channel) => {
                            const member = isMember(channel);
                            return (
                                <View key={channel.id} style={[styles.channelItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                                    <TouchableOpacity
                                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                        onPress={() => handleChannelPress(channel)}
                                    >
                                        <View style={[styles.channelIcon, { backgroundColor: colors.primary + '15' }]}>
                                            <Hash size={16} color={colors.primary} strokeWidth={2.5} />
                                        </View>
                                        <View style={styles.channelContent}>
                                            <View style={styles.channelHeader}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                                                    <Text style={[styles.channelName, { color: colors.text }]}>#{channel.name}</Text>
                                                    <View style={[styles.typeBadge, { backgroundColor: colors.success }]}>
                                                        <Text style={styles.typeBadgeText}>Public</Text>
                                                    </View>
                                                    {member && (
                                                        <View style={[styles.typeBadge, { backgroundColor: colors.primary }]}>
                                                            <Text style={styles.typeBadgeText}>Joined</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={[styles.channelTime, { color: colors.textTertiary }]}>{formatTime(channel.updatedAt)}</Text>
                                            </View>
                                            <Text style={[styles.channelMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                                                {channel.description || 'No description'}
                                            </Text>
                                        </View>
                                        {channel._count && channel._count.members > 0 && (
                                            <View style={[styles.memberBadge, { backgroundColor: colors.surfaceElevated }]}>
                                                <Users size={12} color={colors.textSecondary} strokeWidth={2} />
                                                <Text style={[styles.memberCount, { color: colors.textSecondary }]}>{channel._count.members}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.joinLeaveButton, { backgroundColor: colors.surfaceElevated }]}
                                        onPress={() => member ? handleLeaveChannel(channel.id) : handleJoinChannel(channel.id)}
                                        disabled={isJoining === channel.id || isLeaving === channel.id}
                                    >
                                        {member ? (
                                            <LogOut size={14} color={colors.error} strokeWidth={2.5} />
                                        ) : (
                                            <LogIn size={14} color={colors.success} strokeWidth={2.5} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Private Channels */}
                {privateChannels.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Private Channels</Text>
                            <Text style={[styles.sectionCount, { color: colors.textSecondary, backgroundColor: colors.surfaceElevated }]}>{privateChannels.length}</Text>
                        </View>
                        {privateChannels.map((channel) => {
                            const member = isMember(channel);
                            return (
                                <TouchableOpacity
                                    key={channel.id}
                                    style={[styles.channelItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                                    onPress={() => handleChannelPress(channel)}
                                >
                                    <View style={[styles.channelIcon, { backgroundColor: colors.primary + '15' }]}>
                                        <Lock size={16} color={colors.primary} strokeWidth={2.5} />
                                    </View>
                                    <View style={styles.channelContent}>
                                        <View style={styles.channelHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={[styles.channelName, { color: colors.text }]}>#{channel.name}</Text>
                                                <View style={[styles.typeBadge, { backgroundColor: colors.warning }]}>
                                                    <Text style={styles.typeBadgeText}>Private</Text>
                                                </View>
                                                {member && (
                                                    <View style={[styles.typeBadge, { backgroundColor: colors.primary }]}>
                                                        <Text style={styles.typeBadgeText}>Joined</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={[styles.channelTime, { color: colors.textTertiary }]}>{formatTime(channel.updatedAt)}</Text>
                                        </View>
                                        <Text style={[styles.channelMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                                            {channel.description || 'No description'}
                                        </Text>
                                    </View>
                                    {channel._count && channel._count.members > 0 && (
                                        <View style={[styles.memberBadge, { backgroundColor: colors.surfaceElevated }]}>
                                            <Users size={12} color={colors.textSecondary} strokeWidth={2} />
                                            <Text style={[styles.memberCount, { color: colors.textSecondary }]}>{channel._count.members}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Direct Messages */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Direct Messages</Text>
                        {directMessages.length > 0 && (
                            <Text style={[styles.sectionCount, { color: colors.textSecondary, backgroundColor: colors.surfaceElevated }]}>{directMessages.length}</Text>
                        )}
                        <TouchableOpacity
                            onPress={() => setShowCreateDM(true)}
                            style={[styles.addButton, { backgroundColor: colors.primary + '15' }]}
                        >
                            <Plus size={16} color={colors.primary} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>
                    {directMessages.length > 0 ? (
                        directMessages.map((dm) => {
                            const dmName = getDMName(dm);
                            // Get the other user from DM members for avatar
                            const otherMember = dm.members?.find((m: any) => m.userId !== user?.id);
                            const otherUser = otherMember?.user;

                            return (
                                <TouchableOpacity
                                    key={dm.id}
                                    style={[styles.dmItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                                    onPress={() => handleChannelPress(dm)}
                                >
                                    <View style={styles.avatarContainer}>
                                        <Avatar 
                                            user={otherUser ? {
                                                id: otherUser.id,
                                                profile: otherUser.profile
                                            } : undefined}
                                            size="medium"
                                        />
                                    </View>
                                    <View style={styles.dmContent}>
                                        <View style={styles.dmHeader}>
                                            <Text style={[styles.dmName, { color: colors.text }]}>{dmName}</Text>
                                            <Text style={[styles.dmTime, { color: colors.textTertiary }]}>{formatTime(dm.updatedAt)}</Text>
                                        </View>
                                        <Text style={[styles.dmMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                                            {(dm as any).lastMessage?.content || 'No messages yet'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.emptyDMSection}>
                            <MessageCircle size={32} color={colors.textTertiary} strokeWidth={1.5} />
                            <Text style={[styles.emptyDMText, { color: colors.textSecondary }]}>No direct messages yet</Text>
                            <Text style={[styles.emptyDMSubtext, { color: colors.textTertiary }]}>Start a conversation with a team member</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Create Channel Modal */}
            <CreateChannelModal
                visible={showCreateChannel}
                onClose={() => setShowCreateChannel(false)}
                onCreate={handleCreateChannel}
            />

            {/* Create DM Modal */}
            <CreateDMModal
                visible={showCreateDM}
                onClose={() => setShowCreateDM(false)}
                onCreate={handleCreateDM}
                users={users}
                loading={loadingUsers}
                currentUserId={user?.id}
            />
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
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    newChatButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    sectionCount: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    addButton: {
        marginLeft: 'auto',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    channelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
    },
    channelIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    channelContent: {
        flex: 1,
    },
    channelHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
    },
    channelName: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    channelTime: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    channelMessage: {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.1,
    },
    memberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    memberCount: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    typeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.2,
    },
    joinLeaveButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    dmItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        fontSize: 16,
        fontWeight: '700',
        width: 44,
        height: 44,
        textAlign: 'center',
        lineHeight: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    dmContent: {
        flex: 1,
    },
    dmHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 3,
    },
    dmName: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    dmTime: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    dmMessage: {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.1,
    },
    emptyStateActions: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    emptyStateDMButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
    },
    emptyStateDMButtonText: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    emptyDMSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    emptyDMText: {
        fontSize: 15,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 4,
    },
    emptyDMSubtext: {
        fontSize: 13,
        textAlign: 'center',
    },
});
