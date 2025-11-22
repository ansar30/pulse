import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, RefreshControl, Keyboard, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/providers/theme-provider';
import { ArrowLeft, Hash, Lock, Users as UsersIcon, UserPlus, LogOut, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { chatApi } from '@/lib/api-client';
import { ErrorState } from '@/components/error-state';
import { EmptyState } from '@/components/empty-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { MessageBubble } from '@/components/chat/message-bubble';
import { MessageInput } from '@/components/chat/message-input';
import { ManageMembersModal } from '@/components/chat/manage-members-modal';
import { Avatar } from '@/components/ui/avatar';
import { ImagePreviewModal } from '@/components/ui/image-preview-modal';

interface Message {
    id: string;
    content: string;
    type?: string;
    createdAt: string;
    userId: string;
    user?: {
        id: string;
        profile?: {
            firstName?: string;
            lastName?: string;
            avatar?: string;
        };
    };
}

interface Channel {
    id: string;
    name: string;
    type: string;
    description?: string;
    members?: Array<{
        userId: string;
        user?: {
            id: string;
            email: string;
            profile?: {
                firstName?: string;
                lastName?: string;
            };
        };
    }>;
    _count?: { members: number; messages: number };
}

export default function ChannelScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuthStore();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);

    const [channel, setChannel] = useState<Channel | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [sending, setSending] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [showManageMembers, setShowManageMembers] = useState(false);
    const [addingMembers, setAddingMembers] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);

    // Helper function to get DM display name
    const getDMDisplayName = (channel: Channel): string => {
        if (channel.type !== 'DIRECT') {
            return channel.name;
        }

        // Try to get name from members array
        if (channel.members && channel.members.length > 0) {
            const otherMember = channel.members.find((m) => m.userId !== user?.id);
            if (otherMember?.user?.profile) {
                const { firstName, lastName } = otherMember.user.profile;
                const fullName = `${firstName || ''} ${lastName || ''}`.trim();
                if (fullName) return fullName;
                return otherMember.user.email || 'Unknown User';
            }
        }

        // Fallback: if name looks like a proper name (not an ID), use it
        if (channel.name && channel.name.length < 50 && !channel.name.includes('-') && !/^[0-9a-f]{24}$/i.test(channel.name)) {
            return channel.name;
        }

        return 'Direct Message';
    };

    const fetchChannel = async (): Promise<boolean> => {
        if (!user?.tenantId || !id) return false;

        try {
            const response = await chatApi.getChannel(user.tenantId, id);
            if (response.success && response.data) {
                setChannel(response.data);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to fetch channel:', err);
            return false;
        }
    };

    const fetchMessages = async (refresh = false): Promise<boolean> => {
        if (!user?.tenantId || !id) {
            return false;
        }

        try {
            const response = await chatApi.getMessages(user.tenantId, id, 50);
            const messagesData = response.data || [];

            // Sort messages by createdAt (oldest first for display)
            const sortedMessages = messagesData.sort((a: Message, b: Message) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            setMessages(sortedMessages);
            setHasMore(messagesData.length >= 50);

            // Scroll to bottom after loading messages
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
            }, 100);
            return true;
        } catch (err) {
            console.error('Failed to fetch messages:', err);
            return false;
        } finally {
            if (!refresh) {
                setRefreshing(false);
            }
        }
    };

    const loadMoreMessages = async () => {
        if (!user?.tenantId || !id || loadingMore || !hasMore || messages.length === 0) return;

        try {
            setLoadingMore(true);
            const oldestMessage = messages[0];
            const response = await chatApi.getMessages(user.tenantId, id, 50, oldestMessage.id);
            const olderMessages = response.data || [];

            if (olderMessages.length > 0) {
                const sortedOlderMessages = olderMessages.sort((a: Message, b: Message) =>
                    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );
                setMessages([...sortedOlderMessages, ...messages]);
                setHasMore(olderMessages.length >= 50);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to load more messages:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        // Reset state when channel ID changes
        setLoading(true);
        setError(null);
        setChannel(null);
        setMessages([]);
        setHasMore(true);
        setIsInitialLoad(true);

        const loadData = async () => {
            try {
                // Run both fetches in parallel
                const [channelSuccess, messagesSuccess] = await Promise.all([
                    fetchChannel(),
                    fetchMessages()
                ]);

                // Mark initial load as complete
                setIsInitialLoad(false);
                
                // Only set loading to false after both complete
                setLoading(false);

                // Only show error if both failed or if channel failed (we need channel to display)
                if (!channelSuccess) {
                    setError(new Error('Failed to load channel'));
                } else if (!messagesSuccess) {
                    // If channel loaded but messages failed, still show the channel
                    // but set error for messages
                    setError(new Error('Failed to load messages'));
                }
            } catch (err) {
                setIsInitialLoad(false);
                setLoading(false);
                setError(err instanceof Error ? err : new Error('Failed to load channel'));
            }
        };
        loadData();

        // Poll for new messages every 3 seconds (only if channel is loaded)
        const interval = setInterval(() => {
            if (channel) {
                fetchMessages(true); // Pass true to indicate it's a refresh/poll
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [id, user?.tenantId]);

    // Auto-scroll when keyboard appears
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                // Optional: scroll adjustment when keyboard hides
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([fetchChannel(), fetchMessages(true)]);
        } catch (err) {
            console.error('Refresh error:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!user?.tenantId || !id || !content.trim() || !channel) return;

        // Check if user is a member before sending
        const isMember = channel.members?.some((m: any) => m.userId === user.id);
        if (!isMember) {
            alert('You must join the channel before sending messages');
            return;
        }

        try {
            setSending(true);
            await chatApi.sendMessage(user.tenantId, id, { content: content.trim() });

            // Immediately fetch new messages to show the sent message
            await fetchMessages();
        } catch (err: any) {
            console.error('Failed to send message:', err);
            alert(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleJoinChannel = async () => {
        if (!user?.tenantId || !id) return;
        setIsJoining(true);
        try {
            const response = await chatApi.joinChannel(user.tenantId, id);
            if (response.success) {
                // Reload channel and messages
                await fetchChannel();
                await fetchMessages();
            }
        } catch (err: any) {
            console.error('Failed to join channel:', err);
            alert(err.response?.data?.message || 'Failed to join channel');
        } finally {
            setIsJoining(false);
        }
    };

    const handleAddMembers = async (userIds: string[]) => {
        if (!user?.tenantId || !id || userIds.length === 0) return;

        setAddingMembers(true);
        try {
            const response = await chatApi.addChannelMembers(user.tenantId, id, userIds);
            if (response.success) {
                // Reload channel to get updated members
                await fetchChannel();
                setShowManageMembers(false);
            }
        } catch (err: any) {
            console.error('Failed to add members:', err);
            alert(err.response?.data?.message || 'Failed to add members');
            throw err;
        } finally {
            setAddingMembers(false);
        }
    };

    const handleLeaveChannel = async () => {
        if (!user?.tenantId || !id) return;

        // Confirm before leaving
        const confirmLeave = () => {
            setIsLeaving(true);
            chatApi.leaveChannel(user.tenantId, id)
                .then((response) => {
                    if (response.success) {
                        // Navigate back to chat list
                        router.back();
                    }
                })
                .catch((err: any) => {
                    console.error('Failed to leave channel:', err);
                    alert(err.response?.data?.message || 'Failed to leave channel');
                })
                .finally(() => {
                    setIsLeaving(false);
                });
        };

        // Show confirmation alert
        Alert.alert(
            'Leave Channel',
            'Are you sure you want to leave this channel?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: confirmLeave },
            ]
        );
    };

    const handleDeleteChannel = async () => {
        if (!user?.tenantId || !id || !channel) return;

        Alert.alert(
            'Delete Channel',
            `Are you sure you want to delete #${channel.name}? This action cannot be undone and will delete all messages.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await chatApi.deleteChannel(user.tenantId, id);
                            if (response.success) {
                                // Navigate back to chat list
                                router.back();
                            }
                        } catch (err: any) {
                            console.error('Failed to delete channel:', err);
                            Alert.alert('Error', err.response?.data?.message || 'Failed to delete channel');
                        }
                    },
                },
            ]
        );
    };

    const isMember = channel?.members?.some((m: any) => m.userId === user?.id) || false;
    const isPublic = channel?.type === 'PUBLIC';
    const isPrivate = channel?.type === 'PRIVATE';
    const isDM = channel?.type === 'DIRECT';
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isCreator = channel?.createdBy === user?.id;
    const canManage = isAdmin || isCreator;

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
                    </TouchableOpacity>
                    <LoadingSkeleton width={150} height={24} />
                    <View style={{ width: 40 }} />
                </View>
                <View style={[styles.messagesContainer, { backgroundColor: colors.background }]}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <View key={i} style={{ padding: 16 }}>
                            <LoadingSkeleton width={i % 2 === 0 ? '70%' : '60%'} height={60} borderRadius={16} />
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // Only show error if loading is complete, initial load is done, and there's an error
    // Make sure we have a valid error and we're not still loading
    if (!loading && !isInitialLoad && error && error.message) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ErrorState 
                    error={error} 
                    onRetry={() => { 
                        setLoading(true); 
                        setError(null); 
                        const loadData = async () => {
                            try {
                                const [channelSuccess, messagesSuccess] = await Promise.all([
                                    fetchChannel(),
                                    fetchMessages()
                                ]);
                                setLoading(false);
                                if (!channelSuccess) {
                                    setError(new Error('Failed to load channel'));
                                } else if (!messagesSuccess) {
                                    setError(new Error('Failed to load messages'));
                                }
                            } catch (err) {
                                setLoading(false);
                                setError(err instanceof Error ? err : new Error('Failed to load channel'));
                            }
                        };
                        loadData();
                    }} 
                />
            </SafeAreaView>
        );
    }

    // Only show channel not found if loading is complete, channel is null, and no error
    if (!loading && !channel && !error) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ErrorState
                    error={new Error('Channel not found')}
                    onRetry={() => router.back()}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: colors.background }]}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <View style={[styles.headerIcon, { backgroundColor: 'transparent' }]}>
                        {channel.type === 'PRIVATE' ? (
                            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
                                <Lock size={18} color={colors.primary} strokeWidth={2} />
                            </View>
                        ) : channel.type === 'DIRECT' ? (
                            (() => {
                                const otherMember = channel.members?.find((m) => m.userId !== user?.id);
                                const otherUser = otherMember?.user;
                                const avatarUri = otherUser?.profile?.avatar;
                                
                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (avatarUri && avatarUri.trim() !== '' && avatarUri.startsWith('data:image')) {
                                                setPreviewImageUri(avatarUri);
                                                setShowImagePreview(true);
                                            }
                                        }}
                                        activeOpacity={avatarUri ? 0.7 : 1}
                                        disabled={!avatarUri}
                                    >
                                        <Avatar 
                                            user={otherUser ? {
                                                id: otherUser.id,
                                                profile: otherUser.profile
                                            } : undefined}
                                            size="small"
                                        />
                                    </TouchableOpacity>
                                );
                            })()
                        ) : (
                            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '15' }]}>
                                <Hash size={18} color={colors.primary} strokeWidth={2} />
                            </View>
                        )}
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                            {channel.type === 'DIRECT' ? getDMDisplayName(channel) : `#${channel.name}`}
                        </Text>
                        {channel.description && (
                            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                                {channel.description}
                            </Text>
                        )}
                        {channel.members && channel.members.length > 0 && channel.type !== 'DIRECT' && (
                            <TouchableOpacity 
                                style={styles.memberBadge}
                                onPress={() => router.push(`/channel/${id}/members`)}
                            >
                                <UsersIcon size={12} color={colors.textSecondary} strokeWidth={2} />
                                <Text style={[styles.memberCount, { color: colors.textSecondary }]}>{channel.members.length} {channel.members.length === 1 ? 'member' : 'members'}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    {isPrivate && canManage && (
                        <TouchableOpacity 
                            onPress={() => setShowManageMembers(true)}
                            style={styles.manageMembersButton}
                        >
                            <UserPlus size={20} color={colors.primary} strokeWidth={2} />
                        </TouchableOpacity>
                    )}
                    {!isDM && canManage && (
                        <TouchableOpacity 
                            onPress={handleDeleteChannel}
                            style={styles.deleteButton}
                        >
                            <Trash2 size={20} color={colors.error} strokeWidth={2} />
                        </TouchableOpacity>
                    )}
                    {isPrivate && isMember && (
                        <TouchableOpacity 
                            onPress={handleLeaveChannel}
                            style={styles.leaveButton}
                            disabled={isLeaving}
                        >
                            <LogOut size={20} color={colors.error} strokeWidth={2} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        onPress={() => router.push(`/channel/${id}/members`)}
                        style={{ width: 40, alignItems: 'flex-end', justifyContent: 'center' }}
                    >
                        <UsersIcon size={20} color={colors.primary} strokeWidth={2} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={[styles.messagesContainer, { backgroundColor: colors.background }]}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
                onScroll={(event) => {
                    const { contentOffset } = event.nativeEvent;
                    if (contentOffset.y <= 100 && !loadingMore && hasMore) {
                        loadMoreMessages();
                    }
                }}
                scrollEventThrottle={400}
            >
                {loadingMore && (
                    <View style={styles.loadingMore}>
                        <LoadingSkeleton width={100} height={20} borderRadius={10} />
                    </View>
                )}

                {messages.length === 0 ? (
                    <EmptyState
                        icon={channel.type === 'DIRECT' ? UsersIcon : Hash}
                        title="No messages yet"
                        message={`Start the conversation in ${channel.type === 'DIRECT' ? 'this DM' : `#${channel.name}`}`}
                    />
                ) : (
                    messages.map((message, index) => {
                        const prevMsg = index > 0 ? messages[index - 1] : undefined;
                        return (
                            <MessageBubble
                                key={message.id || index}
                                message={{
                                    ...message,
                                    type: (message as any).type,
                                }}
                                isOwn={message.userId === user?.id}
                                showAvatar={!isDM}
                                showTimestamp={true}
                                isDM={isDM}
                                previousMessage={prevMsg ? {
                                    createdAt: prevMsg.createdAt,
                                    user: { id: prevMsg.userId },
                                } : undefined}
                            />
                        );
                    })
                )}
            </ScrollView>

            {/* Message Input or Join Button */}
            <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
                {(() => {
                    // Show join button if not a member (for both public and private)
                    if (!isMember && (isPublic || isPrivate)) {
                        return (
                            <View style={styles.joinContainer}>
                                <TouchableOpacity
                                    onPress={handleJoinChannel}
                                    disabled={isJoining}
                                    style={styles.joinButtonTouchable}
                                >
                                    <LinearGradient
                                        colors={isJoining ? [colors.textTertiary, colors.textTertiary] : [colors.primary, colors.secondary]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.joinButtonGradient}
                                    >
                                        <Text style={[styles.joinButtonText, { color: colors.surface }]}>
                                            {isJoining ? 'Joining...' : isPrivate ? 'Join request pending' : 'Join to chat'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        );
                    }
                    
                    // Only show message input if user is a member
                    if (isMember) {
                        return (
                            <MessageInput
                                placeholder={`Message ${channel.type === 'DIRECT' ? getDMDisplayName(channel) : `#${channel.name}`}`}
                                onSend={handleSendMessage}
                                disabled={sending}
                            />
                        );
                    }
                    
                    return null;
                })()}
            </View>

            </KeyboardAvoidingView>

            {/* Manage Members Modal */}
            {channel && (
                <ManageMembersModal
                    visible={showManageMembers}
                    onClose={() => setShowManageMembers(false)}
                    onAddMembers={handleAddMembers}
                    existingMemberIds={channel.members?.map((m: any) => m.userId) || []}
                    tenantId={user?.tenantId || ''}
                    currentUserId={user?.id}
                    loading={addingMembers}
                />
            )}

            {/* Image Preview Modal */}
            <ImagePreviewModal
                visible={showImagePreview}
                imageUri={previewImageUri}
                onClose={() => {
                    setShowImagePreview(false);
                    setPreviewImageUri(null);
                }}
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dmAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dmAvatarText: {
        fontSize: 16,
        fontWeight: '700',
    },
    headerTextContainer: {
        flex: 1,
        minWidth: 0,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
        fontWeight: '500',
    },
    memberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    memberCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 16,
        flexGrow: 1,
    },
    loadingMore: {
        padding: 16,
        alignItems: 'center',
    },
    inputContainer: {
        borderTopWidth: 1,
    },
    joinContainer: {
        padding: 20,
        paddingHorizontal: 20,
    },
    joinButtonTouchable: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    joinButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    joinButtonText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    manageMembersButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leaveButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
