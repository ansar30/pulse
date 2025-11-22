'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Hash, User, Search, Plus, MessageSquare, LogIn, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    userRole?: string;
    onJoinChannel?: (channelId: string) => void;
    onLeaveChannel?: (channelId: string) => void;
    isJoining?: string | null;
    isLeaving?: string | null;
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
    userRole,
    onJoinChannel,
    onLeaveChannel,
    isJoining,
    isLeaving,
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

    const isMember = (channel: Channel) => {
        if (!currentUserId || !channel.members) return false;
        return channel.members.some(m => m.userId === currentUserId);
    };

    const handleChannelClick = (channel: Channel, e: React.MouseEvent) => {
        // Prevent navigation if clicking join/leave button
        if ((e.target as HTMLElement).closest('button[data-action]')) {
            e.stopPropagation();
            return;
        }
        onSelectChannel(channel);
    };

    const handleJoinLeave = (channel: Channel, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isMember(channel)) {
            onLeaveChannel?.(channel.id);
        } else {
            onJoinChannel?.(channel.id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e2e] text-white border-r border-[#2d2d44] w-full sm:w-64">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-[#2d2d44]">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-bold text-white">Chat</h2>
                </div>
                
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 sm:pl-9 text-sm bg-[#2d2d44] border-[#3d3d54] text-white placeholder:text-gray-400 focus:border-primary/50 focus-visible:ring-primary/20 h-8 sm:h-9"
                    />
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {/* Direct Messages */}
                <div className="px-1.5 sm:px-2 py-2">
                    <div className="flex items-center justify-between mb-2 px-1.5 sm:px-2">
                        <button
                            onClick={() => toggleSection('dms')}
                            className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
                        >
                            <span className={cn(
                                "transition-transform text-[10px]",
                                expandedSections.dms && "rotate-90"
                            )}>
                                ▶
                            </span>
                            <span className="hidden sm:inline">Direct Messages</span>
                            <span className="sm:hidden">DMs</span>
                        </button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#2d2d44]"
                            onClick={onCreateDM}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                    
                    {expandedSections.dms && (
                        <div className="space-y-0.5">
                            {filteredDMs.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-gray-500">
                                    {searchQuery ? 'No DMs found' : 'No direct messages'}
                                </div>
                            ) : (
                                filteredDMs.map((dm) => (
                                    <button
                                        key={dm.id}
                                        onClick={() => onSelectChannel(dm)}
                                        className={cn(
                                            "w-full text-left px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-150 flex items-center gap-2 sm:gap-2.5 group",
                                            selectedChannel?.id === dm.id
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-gray-300 hover:bg-[#2d2d44] hover:text-white"
                                        )}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-semibold">
                                                {getDMName(dm)
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()
                                                    .slice(0, 2)}
                                            </div>
                                        </div>
                                        <span className="flex-1 truncate text-xs sm:text-sm font-medium">
                                            {getDMName(dm)}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Channels */}
                <div className="px-1.5 sm:px-2 py-2 border-t border-[#2d2d44]">
                    <div className="flex items-center justify-between mb-2 px-1.5 sm:px-2">
                        <button
                            onClick={() => toggleSection('channels')}
                            className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
                        >
                            <span className={cn(
                                "transition-transform text-[10px]",
                                expandedSections.channels && "rotate-90"
                            )}>
                                ▶
                            </span>
                            Channels
                        </button>
                        {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-[#2d2d44]"
                                onClick={onCreateChannel}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    
                    {expandedSections.channels && (
                        <div className="space-y-0.5">
                            {filteredChannels.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-gray-500">
                                    {searchQuery ? 'No channels found' : 'No channels yet'}
                                </div>
                            ) : (
                                filteredChannels.map((channel) => {
                                    const member = isMember(channel);
                                    const memberCount = channel.members?.length || 0;
                                    const isPublic = channel.type === 'PUBLIC';
                                    const isPrivate = channel.type === 'PRIVATE';
                                    
                                    return (
                                        <div
                                            key={channel.id}
                                            className={cn(
                                                "w-full px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg transition-all duration-150 group",
                                                selectedChannel?.id === channel.id
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "text-gray-300 hover:bg-[#2d2d44] hover:text-white"
                                            )}
                                        >
                                            <button
                                                onClick={(e) => handleChannelClick(channel, e)}
                                                className="w-full text-left flex items-center gap-2 sm:gap-2.5"
                                            >
                                                <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 opacity-70" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <span className="truncate text-xs sm:text-sm font-medium">
                                                            {channel.name}
                                                        </span>
                                                        {isPublic && (
                                                            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium bg-green-500/20 text-green-400 rounded">
                                                                Public
                                                            </span>
                                                        )}
                                                        {isPrivate && (
                                                            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium bg-orange-500/20 text-orange-400 rounded">
                                                                Private
                                                            </span>
                                                        )}
                                                        {member && (
                                                            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded">
                                                                Joined
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                                        {memberCount} {memberCount === 1 ? 'member' : 'members'}
                                                    </div>
                                                </div>
                                            </button>
                                            {isPublic && (
                                                <div className="mt-1.5 flex justify-end">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6 px-2 text-[10px] sm:text-xs"
                                                        onClick={(e) => handleJoinLeave(channel, e)}
                                                        disabled={isJoining === channel.id || isLeaving === channel.id}
                                                        data-action="join-leave"
                                                    >
                                                        {member ? (
                                                            <>
                                                                <LogOut className="w-3 h-3 mr-1" />
                                                                Leave
                                                            </>
                                                        ) : (
                                                            <>
                                                                <LogIn className="w-3 h-3 mr-1" />
                                                                Join
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

