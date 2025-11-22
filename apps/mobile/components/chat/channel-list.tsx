import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Hash, User, Search, Plus, MessageSquare } from 'lucide-react-native';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Channel {
    id: string;
    name: string;
    description?: string;
    type: string;
    members?: Array<{ userId: string; user?: { profile?: { firstName?: string; lastName?: string } } }>;
}

interface ChannelListProps {
    channels: Channel[];
    dms: Channel[];
    selectedChannel: Channel | null;
    onSelectChannel: (channel: Channel) => void;
    onCreateChannel: () => void;
    onCreateDM: () => void;
    getDMName: (dm: Channel) => string;
    currentUserId?: string;
}

export function ChannelList({
    channels,
    dms,
    selectedChannel,
    onSelectChannel,
    onCreateChannel,
    onCreateDM,
    getDMName,
    currentUserId,
}: ChannelListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({
        dms: true,
        channels: true,
    });

    const filteredChannels = channels.filter((channel) =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDMs = dms.filter((dm) =>
        getDMName(dm).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSection = (section: 'dms' | 'channels') => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Helper function to get avatar color
    const getAvatarColor = (name: string) => {
        const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6', '#F59E0B', '#10B981', '#EF4444'];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <View className="flex-1 bg-white">
            {/* Search */}
            <View className="px-4 py-3 border-b border-gray-200 bg-white">
                <View className="relative">
                    <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }} />
                    <Input
                        placeholder="Search channels and DMs..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="pl-10 bg-gray-50 border-gray-200 text-gray-900"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
            </View>

            {/* Scrollable content */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Direct Messages */}
                <View className="px-3 py-3">
                    <View className="flex-row items-center justify-between mb-3">
                        <TouchableOpacity
                            onPress={() => toggleSection('dms')}
                            className="flex-row items-center gap-2"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text className={cn('text-xs font-semibold text-gray-500', expandedSections.dms && 'transform rotate-90')}>
                                ▶
                            </Text>
                            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Direct Messages</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onCreateDM}
                            className="h-8 w-8 items-center justify-center"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Plus size={20} color="#2563eb" />
                        </TouchableOpacity>
                    </View>

                    {expandedSections.dms && (
                        <View>
                            {filteredDMs.length === 0 ? (
                                <View className="px-3 py-4">
                                    <Text className="text-sm text-gray-400 text-center">
                                        {searchQuery ? 'No DMs found' : 'No direct messages yet'}
                                    </Text>
                                </View>
                            ) : (
                                filteredDMs.map((dm) => {
                                    const dmName = getDMName(dm);
                                    const initials = dmName
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2);
                                    const avatarColor = getAvatarColor(dmName);

                                    return (
                                        <TouchableOpacity
                                            key={dm.id}
                                            onPress={() => onSelectChannel(dm)}
                                            className={cn(
                                                'w-full px-3 py-3.5 rounded-xl flex-row items-center gap-3 mb-1',
                                                selectedChannel?.id === dm.id
                                                    ? 'bg-blue-50 border border-blue-200'
                                                    : 'bg-transparent active:bg-gray-50'
                                            )}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                className="w-11 h-11 rounded-full items-center justify-center"
                                                style={{ backgroundColor: avatarColor }}
                                            >
                                                <Text className="text-white text-sm font-semibold">
                                                    {initials}
                                                </Text>
                                            </View>
                                            <Text
                                                className={cn(
                                                    'flex-1 text-base font-medium',
                                                    selectedChannel?.id === dm.id ? 'text-blue-900' : 'text-gray-900'
                                                )}
                                                numberOfLines={1}
                                            >
                                                {dmName}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </View>
                    )}
                </View>

                {/* Channels */}
                <View className="px-3 py-3 border-t border-gray-100">
                    <View className="flex-row items-center justify-between mb-3">
                        <TouchableOpacity
                            onPress={() => toggleSection('channels')}
                            className="flex-row items-center gap-2"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text className={cn('text-xs font-semibold text-gray-500', expandedSections.channels && 'transform rotate-90')}>
                                ▶
                            </Text>
                            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Channels</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onCreateChannel}
                            className="h-8 w-8 items-center justify-center"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Plus size={20} color="#2563eb" />
                        </TouchableOpacity>
                    </View>

                    {expandedSections.channels && (
                        <View>
                            {filteredChannels.length === 0 ? (
                                <View className="px-3 py-4">
                                    <Text className="text-sm text-gray-400 text-center">
                                        {searchQuery ? 'No channels found' : 'No channels yet'}
                                    </Text>
                                </View>
                            ) : (
                                filteredChannels.map((channel) => (
                                    <TouchableOpacity
                                        key={channel.id}
                                        onPress={() => onSelectChannel(channel)}
                                        className={cn(
                                            'w-full px-3 py-3.5 rounded-xl flex-row items-center gap-3 mb-1',
                                            selectedChannel?.id === channel.id
                                                ? 'bg-blue-50 border border-blue-200'
                                                : 'bg-transparent active:bg-gray-50'
                                        )}
                                        activeOpacity={0.7}
                                    >
                                        <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center">
                                            <Hash size={18} color="#2563eb" />
                                        </View>
                                        <View className="flex-1 min-w-0">
                                            <Text
                                                className={cn(
                                                    'text-base font-medium',
                                                    selectedChannel?.id === channel.id ? 'text-blue-900' : 'text-gray-900'
                                                )}
                                                numberOfLines={1}
                                            >
                                                {channel.name}
                                            </Text>
                                            {channel.description && (
                                                <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                                                    {channel.description}
                                                </Text>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

