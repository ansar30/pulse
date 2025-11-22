import { View, Text, TouchableOpacity } from 'react-native';
import { Hash, ArrowLeft, MoreVertical, Menu } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/store';

interface ChatHeaderProps {
    channel: {
        id: string;
        name: string;
        description?: string;
        type: string;
        members?: Array<{ userId: string; user?: { profile?: { firstName?: string; lastName?: string } } }>;
    };
    getDMName: (channel: any) => string;
    memberCount?: number;
    onBack?: () => void;
    onMenu?: () => void;
}

export function ChatHeader({ channel, getDMName, memberCount, onBack, onMenu }: ChatHeaderProps) {
    const { user } = useAuthStore();
    const isDM = channel.type === 'DIRECT';
    const displayName = isDM ? getDMName(channel) : channel.name;
    
    // Get the other user from DM members for avatar
    const otherMember = isDM && channel.members ? channel.members.find((m) => m.userId !== user?.id) : null;
    const otherUser = otherMember?.user;

    return (
        <View className="h-16 border-b border-gray-200 bg-white px-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 min-w-0 flex-1">
                {onBack && (
                    <TouchableOpacity 
                        onPress={onBack} 
                        className="h-10 w-10 items-center justify-center -ml-2"
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={22} color="#374151" />
                    </TouchableOpacity>
                )}
                <View className="flex-shrink-0">
                    {isDM ? (
                        <Avatar 
                            user={otherUser ? {
                                id: otherUser.id || '',
                                profile: otherUser.profile
                            } : undefined}
                            size="medium"
                        />
                    ) : (
                        <View className="w-11 h-11 rounded-lg bg-blue-100 items-center justify-center">
                            <Hash size={22} color="#2563eb" />
                        </View>
                    )}
                </View>

                <View className="min-w-0 flex-1">
                    <Text className="font-semibold text-base text-gray-900" numberOfLines={1}>
                        {displayName}
                    </Text>
                    {channel.description && (
                        <Text className="text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                            {channel.description}
                        </Text>
                    )}
                    {!isDM && memberCount !== undefined && (
                        <Text className="text-xs text-gray-500 mt-0.5">
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </Text>
                    )}
                </View>
            </View>

            <View className="flex-row items-center gap-2">
                {onMenu && (
                    <TouchableOpacity 
                        className="h-10 w-10 items-center justify-center"
                        onPress={onMenu}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        activeOpacity={0.7}
                    >
                        <Menu size={22} color="#374151" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity 
                    className="h-10 w-10 items-center justify-center"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                >
                    <MoreVertical size={22} color="#374151" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

