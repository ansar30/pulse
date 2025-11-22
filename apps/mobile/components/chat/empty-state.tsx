import { View, Text } from 'react-native';
import { MessageSquare, Hash } from 'lucide-react-native';

interface EmptyStateProps {
    type?: 'default' | 'channel' | 'dm';
    channelName?: string;
    userName?: string;
}

export function EmptyState({ type = 'default', channelName, userName }: EmptyStateProps) {
    // Helper function to get avatar color
    const getAvatarColor = (name: string) => {
        const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F59E0B', '#10B981', '#EF4444'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (type === 'channel' && channelName) {
        return (
            <View className="flex-1 items-center justify-center p-8">
                <View className="relative mb-6">
                    <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center">
                        <Hash size={40} color="#2563eb" />
                    </View>
                </View>
                <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
                    Welcome to #{channelName}!
                </Text>
                <Text className="text-gray-500 max-w-sm text-center text-base leading-6">
                    This is the beginning of the <Text className="font-semibold">#{channelName}</Text> channel. Start the conversation by sending a message.
                </Text>
            </View>
        );
    }

    if (type === 'dm' && userName) {
        const initials = userName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        const avatarColor = getAvatarColor(userName);

        return (
            <View className="flex-1 items-center justify-center p-8">
                <View className="relative mb-6">
                    <View 
                        className="w-20 h-20 rounded-full items-center justify-center"
                        style={{ backgroundColor: avatarColor }}
                    >
                        <Text className="text-white text-2xl font-bold">
                            {initials}
                        </Text>
                    </View>
                </View>
                <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
                    Start a conversation with {userName}
                </Text>
                <Text className="text-gray-500 max-w-sm text-center text-base leading-6">
                    This is your direct message history with <Text className="font-semibold">{userName}</Text>. Send a message to get started!
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 items-center justify-center p-8">
            <View className="relative mb-6">
                <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center">
                    <MessageSquare size={40} color="#9CA3AF" />
                </View>
            </View>
            <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
                Select a channel or DM to start chatting
            </Text>
            <Text className="text-gray-500 max-w-sm text-center text-base leading-6">
                Choose a conversation from the list or create a new channel or direct message to get started.
            </Text>
        </View>
    );
}

