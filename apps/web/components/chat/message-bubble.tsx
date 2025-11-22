import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

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
    const messageDate = new Date(message.createdAt);
    const prevMessageDate = previousMessage ? new Date(previousMessage.createdAt) : null;
    
    const showDateSeparator = !prevMessageDate || !isSameDay(messageDate, prevMessageDate);
    // For DMs, never show avatar or user info
    const shouldShowAvatar = showAvatar && !isDM;
    const showUserInfo = !isDM && !isOwn && (!previousMessage || previousMessage.user?.id !== message.user?.id);
    
    const formatTime = (date: Date) => {
        return format(date, 'h:mm a');
    };

    const isSystemMessage = message.type === 'SYSTEM';
    
    const formatDate = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMMM d, yyyy');
    };

    const getInitials = () => {
        const firstName = message.user?.profile?.firstName || '';
        const lastName = message.user?.profile?.lastName || '';
        return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?';
    };

    const getAvatarColor = (userId?: string) => {
        if (!userId) return 'from-gray-400 to-gray-500';
        const colors = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
            'from-teal-500 to-teal-600',
            'from-orange-500 to-orange-600',
            'from-green-500 to-green-600',
            'from-red-500 to-red-600',
        ];
        const index = userId.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // System message rendering
    if (isSystemMessage) {
        return (
            <>
                {showDateSeparator && (
                    <div className="flex items-center justify-center my-4 sm:my-6 px-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="h-px bg-border flex-1 max-w-[60px] sm:max-w-[100px]" />
                            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground px-1.5 sm:px-2">
                                {formatDate(messageDate)}
                            </span>
                            <div className="h-px bg-border flex-1 max-w-[60px] sm:max-w-[100px]" />
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-center py-2 px-4">
                    <div className="flex items-center gap-2">
                        <div className="h-px bg-border flex-1 max-w-[80px]" />
                        <span className="text-[11px] sm:text-xs text-muted-foreground italic">
                            {message.content}
                        </span>
                        <div className="h-px bg-border flex-1 max-w-[80px]" />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {showDateSeparator && (
                <div className="flex items-center justify-center my-4 sm:my-6 px-2">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="h-px bg-border flex-1 max-w-[60px] sm:max-w-[100px]" />
                        <span className="text-[10px] sm:text-xs font-medium text-muted-foreground px-1.5 sm:px-2">
                            {formatDate(messageDate)}
                        </span>
                        <div className="h-px bg-border flex-1 max-w-[60px] sm:max-w-[100px]" />
                    </div>
                </div>
            )}
            
            <div className={cn(
                "flex group hover:bg-muted/30 transition-colors",
                isOwn ? "flex-row-reverse justify-end" : "flex-row",
                isDM 
                    ? "px-2 sm:px-4 py-1 sm:py-1.5 gap-1.5 sm:gap-2" 
                    : isOwn 
                        ? "pl-2 sm:pl-4 pr-0 py-1 sm:py-1.5 gap-0" 
                        : "px-2 sm:px-4 py-1 sm:py-1.5 gap-2 sm:gap-3"
            )}>
                {/* Avatar for other users in group chats only */}
                {!isOwn && shouldShowAvatar && (
                    <div className="flex-shrink-0">
                        {showUserInfo ? (
                            <div className={cn(
                                "w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold shadow-sm",
                                getAvatarColor(message.user?.id)
                            )}>
                                {getInitials()}
                            </div>
                        ) : (
                            <div className="w-7 sm:w-8" />
                        )}
                    </div>
                )}
                
                <div className={cn(
                    "flex flex-col min-w-0",
                    isOwn ? "items-end" : "items-start",
                    isDM ? "max-w-[90%] sm:max-w-[75%]" : isOwn ? "max-w-[85%] sm:max-w-[75%]" : "max-w-[85%] sm:max-w-[70%]"
                )}>
                    {/* User name for group chats */}
                    {showUserInfo && !isOwn && (
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 px-0.5 sm:px-1">
                            <span className="text-[11px] sm:text-xs font-semibold text-foreground">
                                {message.user?.profile?.firstName} {message.user?.profile?.lastName}
                            </span>
                        </div>
                    )}
                    
                    <div className={cn(
                        "relative shadow-sm transition-all duration-200",
                        isOwn
                            ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md"
                            : "bg-card border border-border rounded-2xl rounded-bl-md",
                        "group-hover:shadow-md",
                        isDM ? "px-3 sm:px-4 py-2 sm:py-2.5" : "px-3 sm:px-4 py-1.5 sm:py-2"
                    )}>
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    </div>
                    
                    {showTimestamp && (
                        <div className={cn(
                            "flex items-center gap-1.5 mt-1 px-1",
                            isOwn && "flex-row-reverse"
                        )}>
                            <span className="text-[10px] sm:text-[11px] text-muted-foreground opacity-70">
                                {formatTime(messageDate)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

