import { View, Text, StyleSheet } from 'react-native';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { Avatar } from '@/components/ui/avatar';

interface MessageBubbleProps {
    message: {
        id?: string;
        content: string;
        type?: string;
        createdAt: string | Date;
        user?: {
            id: string;
            profile?: {
                firstName?: string;
                lastName?: string;
                avatar?: string;
            };
        };
    };
    isOwn: boolean;
    showAvatar?: boolean;
    showTimestamp?: boolean;
    isDM?: boolean;
    previousMessage?: {
        createdAt: string | Date;
        user?: { id: string };
    };
}

export function MessageBubble({
    message,
    isOwn,
    showAvatar = true,
    showTimestamp = true,
    isDM = false,
    previousMessage,
}: MessageBubbleProps) {
    const { colors } = useTheme();
    const messageDate = new Date(message.createdAt);
    const prevMessageDate = previousMessage ? new Date(previousMessage.createdAt) : null;

    const showDateSeparator = !prevMessageDate || !isSameDay(messageDate, prevMessageDate);
    const shouldShowAvatar = showAvatar && !isDM;
    const showUserInfo = !isDM && !isOwn && (!previousMessage || previousMessage.user?.id !== message.user?.id);

    const formatTime = (date: Date) => {
        return format(date, 'h:mm a');
    };

    const formatDate = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    const isSystemMessage = message.type === 'SYSTEM';

    // System message rendering
    if (isSystemMessage) {
        return (
            <>
                {showDateSeparator && (
                    <View style={styles.dateSeparator}>
                        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                            {formatDate(messageDate)}
                        </Text>
                        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                    </View>
                )}
                <View style={styles.systemMessageContainer}>
                    <View style={styles.systemMessageContent}>
                        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                        <Text style={[styles.systemMessageText, { color: colors.textSecondary }]}>
                            {message.content}
                        </Text>
                        <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                    </View>
                </View>
            </>
        );
    }

    return (
        <>
            {showDateSeparator && (
                <View style={styles.dateSeparator}>
                    <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        {formatDate(messageDate)}
                    </Text>
                    <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
                </View>
            )}

            <View style={[
                styles.messageContainer,
                { 
                    paddingLeft: isOwn ? 0 : 12,
                    paddingRight: isOwn ? 12 : 0,
                }
            ]}>
                {/* Avatar for other users in group chats only - on the left */}
                {!isOwn && shouldShowAvatar && (
                    <View style={styles.avatarContainer}>
                        {showUserInfo ? (
                            <Avatar user={message.user} size="small" />
                        ) : (
                            <View style={styles.avatarSpacer} />
                        )}
                    </View>
                )}

                {/* Message content - aligned right for own messages, left for received */}
                <View style={[
                    styles.messageContent,
                    { 
                        maxWidth: isDM ? '80%' : '75%',
                        alignItems: isOwn ? 'flex-end' : 'flex-start',
                        marginLeft: isOwn ? 'auto' : 0,
                        alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    },
                ]}>
                    {/* User name for group chats - only for received messages */}
                    {showUserInfo && !isOwn && (
                        <View style={styles.userNameContainer}>
                            <Text style={[styles.userName, { color: colors.text }]}>
                                {message.user?.profile?.firstName} {message.user?.profile?.lastName}
                            </Text>
                        </View>
                    )}

                    <View style={[
                        styles.messageBubble,
                        {
                            backgroundColor: isOwn ? colors.primary : colors.surface,
                            borderWidth: isOwn ? 0 : 1,
                            borderColor: colors.border,
                            borderBottomRightRadius: isOwn ? 4 : 18,
                            borderBottomLeftRadius: isOwn ? 18 : 4,
                        },
                    ]}>
                        <Text style={[
                            styles.messageText,
                            { color: isOwn ? colors.surface : colors.text },
                        ]}>
                            {message.content}
                        </Text>
                    </View>

                    {showTimestamp && (
                        <View style={[
                            styles.timestampContainer,
                            { alignItems: isOwn ? 'flex-end' : 'flex-start' }
                        ]}>
                            <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                                {formatTime(messageDate)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Spacer for own messages in group chats to match avatar space on left
                {isOwn && !isDM && showAvatar && (
                    <View style={styles.rightSpacer} />
                )} */}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    dateSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    separatorLine: {
        height: 1,
        flex: 1,
        maxWidth: 80,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
    },
    systemMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    systemMessageContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    systemMessageText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-end',
    },
    avatarContainer: {
        marginRight: 8,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarSpacer: {
        width: 36, // Matches avatarContainer width when not showing avatar
    },
    rightSpacer: {
        width: 44, // Matches avatarContainer width (36) + marginRight (8) for alignment
    },
    messageContent: {
        flexDirection: 'column',
        minWidth: 0,
    },
    userNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        paddingHorizontal: 4,
    },
    userName: {
        fontSize: 12,
        fontWeight: '600',
    },
    messageBubble: {
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    timestampContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        paddingHorizontal: 4,
    },
    timestamp: {
        fontSize: 11,
    },
});

