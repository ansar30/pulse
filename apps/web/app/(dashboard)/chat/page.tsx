'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { chatApi, usersApi, adminApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { initSocket, getSocket } from '@/lib/socket';
import { Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ChannelList } from '@/components/chat/channel-list';
import { ChatHeader } from '@/components/chat/chat-header';
import { MessageBubble } from '@/components/chat/message-bubble';
import { MessageInput } from '@/components/chat/message-input';
import { EmptyState } from '@/components/chat/empty-state';

export default function ChatPage() {
    const router = useRouter();
    const { user, isAuthenticated, accessToken, initAuth } = useAuthStore();
    const [channels, setChannels] = useState<any[]>([]);
    const [dms, setDms] = useState<any[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [createChannelOpen, setCreateChannelOpen] = useState(false);
    const [createDMOpen, setCreateDMOpen] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDesc, setNewChannelDesc] = useState('');
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [creatingChannel, setCreatingChannel] = useState(false);
    const [creatingDM, setCreatingDM] = useState<string | null>(null);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isJoining, setIsJoining] = useState<string | null>(null);
    const [isLeaving, setIsLeaving] = useState<string | null>(null);
    const [manageMembersOpen, setManageMembersOpen] = useState(false);
    const [selectedUsersForMembers, setSelectedUsersForMembers] = useState<string[]>([]);
    const [addingMembers, setAddingMembers] = useState(false);
    const [newChannelType, setNewChannelType] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        loadChannels();
        loadUsers();

        if (accessToken) {
            const socket = initSocket(accessToken);

            socket.on('newMessage', (message: any) => {
                setMessages((prev) => {
                    // Check if message already exists to avoid duplicates
                    if (prev.some((m) => m.id === message.id || (m.createdAt === message.createdAt && m.user?.id === message.user?.id && m.content === message.content))) {
                        return prev;
                    }
                    return [...prev, message];
                });
            });

            return () => {
                socket.off('newMessage');
            };
        }
    }, [isAuthenticated, accessToken, router]);

    useEffect(() => {
        if (selectedChannel?.id && user?.tenantId) {
            // Reload channel to get fresh member data
            const reloadChannel = async () => {
                try {
                    const channelResponse = await chatApi.getChannel(user.tenantId, selectedChannel.id);
                    if (channelResponse.success && channelResponse.data) {
                        setSelectedChannel(channelResponse.data);
                        loadMessages(selectedChannel.id);
                    } else {
                        loadMessages(selectedChannel.id);
                    }
                } catch (error) {
                    console.error('Failed to reload channel:', error);
                    loadMessages(selectedChannel.id);
                }
            };
            reloadChannel();

            const socket = getSocket();
            if (socket) {
                socket.emit('joinChannel', { channelId: selectedChannel.id });
            }
        }

        // Listen for remove member events
        const handleRemoveMemberEvent = (event: any) => {
            handleRemoveMember(event.detail);
        };
        window.addEventListener('removeMember', handleRemoveMemberEvent as EventListener);

        return () => {
            window.removeEventListener('removeMember', handleRemoveMemberEvent as EventListener);
        };
    }, [selectedChannel?.id, user?.tenantId]);

    const loadChannels = async () => {
        if (!user?.tenantId) return;
        setLoading(true);
        try {
            // Fetch channels and DMs separately
            const [channelsResponse, dmsResponse] = await Promise.all([
                chatApi.getChannels(user.tenantId),
                chatApi.getDirectMessages(user.tenantId),
            ]);
            
            if (channelsResponse.success) {
                setChannels(channelsResponse.data || []);
            }
            
            if (dmsResponse.success) {
                setDms(dmsResponse.data || []);
            }
        } catch (error) {
            console.error('Failed to load channels:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        if (!user?.tenantId) return;
        try {
            const response = await usersApi.getAll(user.tenantId);
            if (response.success) {
                setAvailableUsers((response.data || []).filter((u: any) => u.id !== user.id));
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const loadMessages = async (channelId: string) => {
        if (!user?.tenantId) return;
        setLoadingMessages(true);
        try {
            const response = await chatApi.getMessages(user.tenantId, channelId);
            if (response.success) {
                setMessages((response.data || []).reverse());
            }
            // Reload channel to get updated member data
            if (selectedChannel?.id === channelId) {
                const channelResponse = await chatApi.getChannel(user.tenantId, channelId);
                if (channelResponse.success) {
                    setSelectedChannel(channelResponse.data);
                }
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim() || !user?.tenantId) return;

        setCreatingChannel(true);
        try {
            const response = await chatApi.createChannel(user.tenantId, {
                name: newChannelName,
                description: newChannelDesc,
                type: newChannelType,
            });

            if (response.success) {
                await loadChannels(); // Reload to get updated channel list
                setNewChannelName('');
                setNewChannelDesc('');
                setNewChannelType('PUBLIC');
                setCreateChannelOpen(false);
            }
        } catch (error: any) {
            console.error('Failed to create channel:', error);
            alert(error.response?.data?.message || 'Failed to create channel');
        } finally {
            setCreatingChannel(false);
        }
    };

    const handleJoinChannel = async (channelId: string) => {
        if (!user?.tenantId) return;
        setIsJoining(channelId);
        try {
            const response = await chatApi.joinChannel(user.tenantId, channelId);
            if (response.success) {
                await loadChannels(); // Reload to get updated membership
                // Reload channel and messages to show the join system message
                if (selectedChannel?.id === channelId) {
                    const channelResponse = await chatApi.getChannel(user.tenantId, channelId);
                    if (channelResponse.success) {
                        setSelectedChannel(channelResponse.data);
                    }
                    await loadMessages(channelId);
                }
            }
        } catch (error: any) {
            console.error('Failed to join channel:', error);
            alert(error.response?.data?.message || 'Failed to join channel');
        } finally {
            setIsJoining(null);
        }
    };

    const handleLeaveChannel = async (channelId?: string) => {
        if (!user?.tenantId) return;
        const targetChannelId = channelId || selectedChannel?.id;
        if (!targetChannelId) return;
        
        setIsLeaving(targetChannelId);
        try {
            const response = await chatApi.leaveChannel(user.tenantId, targetChannelId);
            if (response.success) {
                await loadChannels(); // Reload to get updated membership
                if (selectedChannel?.id === targetChannelId) {
                    // Reload messages to show the leave system message before closing
                    await loadMessages(targetChannelId);
                    setTimeout(() => {
                        setSelectedChannel(null);
                        setMessages([]);
                    }, 500);
                }
            }
        } catch (error: any) {
            console.error('Failed to leave channel:', error);
            alert(error.response?.data?.message || 'Failed to leave channel');
        } finally {
            setIsLeaving(null);
        }
    };

    const handleAddMembers = async () => {
        if (!selectedChannel || !user?.tenantId || selectedUsersForMembers.length === 0) return;
        
        setAddingMembers(true);
        try {
            const response = await chatApi.addChannelMembers(
                user.tenantId,
                selectedChannel.id,
                selectedUsersForMembers
            );
            if (response.success) {
                await loadChannels(); // Reload to get updated membership
                setSelectedUsersForMembers([]);
                setManageMembersOpen(false);
            }
        } catch (error: any) {
            console.error('Failed to add members:', error);
            alert(error.response?.data?.message || 'Failed to add members');
        } finally {
            setAddingMembers(false);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!selectedChannel || !user?.tenantId) return;

        if (!confirm('Are you sure you want to remove this member from the channel?')) {
            return;
        }

        try {
            const response = await chatApi.removeChannelMember(user.tenantId, selectedChannel.id, userId);
            if (response.success) {
                await loadChannels(); // Reload to get updated membership
                if (selectedChannel?.id) {
                    const channelResponse = await chatApi.getChannel(user.tenantId, selectedChannel.id);
                    if (channelResponse.success) {
                        setSelectedChannel(channelResponse.data);
                    }
                }
            }
        } catch (error: any) {
            console.error('Failed to remove member:', error);
            alert(error.response?.data?.message || 'Failed to remove member');
        }
    };

    const handleDeleteChannel = async () => {
        if (!selectedChannel || !user?.tenantId) return;

        const channelName = selectedChannel.name || 'this channel';
        if (!confirm(`Are you sure you want to delete ${channelName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await chatApi.deleteChannel(user.tenantId, selectedChannel.id);
            if (response.success) {
                setSelectedChannel(null);
                setMessages([]);
                await loadChannels(); // Reload channels list
            }
        } catch (error: any) {
            console.error('Failed to delete channel:', error);
            alert(error.response?.data?.message || 'Failed to delete channel');
        }
    };

    const handleCreateDM = async (recipientId: string) => {
        if (!user?.tenantId) return;

        setCreatingDM(recipientId);
        try {
            const response = await adminApi.createDirectMessage(user.tenantId, recipientId);
            if (response.success) {
                const newDM = response.data;
                setDms([...dms, newDM]);
                setSelectedChannel(newDM);
                setCreateDMOpen(false);
            }
        } catch (error) {
            console.error('Failed to create DM:', error);
        } finally {
            setCreatingDM(null);
        }
    };

    const handleSendMessage = (message: string) => {
        if (!message.trim() || !selectedChannel || !user) return;

        // Check if user is a member before sending
        const isMember = selectedChannel.members?.some((m: any) => m.userId === user.id);
        if (!isMember) {
            alert('You must join the channel before sending messages');
            return;
        }

        const socket = getSocket();
        if (socket) {
            socket.emit('sendMessage', {
                channelId: selectedChannel.id,
                userId: user.id,
                content: message,
            });
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getDMName = (dm: any) => {
        const otherMember = dm.members?.find((m: any) => m.userId !== user?.id);
        return otherMember?.user ? `${otherMember.user.profile?.firstName} ${otherMember.user.profile?.lastName}` : 'Unknown User';
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="flex flex-col sm:flex-row h-full bg-background overflow-hidden">
            {/* Desktop Channel List */}
            <div className="hidden sm:flex sm:flex-shrink-0">
                <ChannelList
                    channels={channels}
                    dms={dms}
                    selectedChannel={selectedChannel}
                    onSelectChannel={async (channel) => {
                        // Load full channel data with members
                        if (user?.tenantId) {
                            try {
                                const channelResponse = await chatApi.getChannel(user.tenantId, channel.id);
                                if (channelResponse.success) {
                                    setSelectedChannel(channelResponse.data);
                                } else {
                                    setSelectedChannel(channel);
                                }
                            } catch (error) {
                                console.error('Failed to load channel:', error);
                                setSelectedChannel(channel);
                            }
                        } else {
                            setSelectedChannel(channel);
                        }
                    }}
                    onCreateChannel={() => setCreateChannelOpen(true)}
                    onCreateDM={() => setCreateDMOpen(true)}
                    getDMName={getDMName}
                    currentUserId={user.id}
                    userRole={user.role}
                    onJoinChannel={handleJoinChannel}
                    onLeaveChannel={handleLeaveChannel}
                    onDeleteChannel={handleDeleteChannel}
                    isJoining={isJoining}
                    isLeaving={isLeaving}
                />
            </div>

            {/* Mobile Channel List Toggle - Show when no channel selected */}
            {!selectedChannel && (
                <div className="sm:hidden flex-1 overflow-hidden">
                    <ChannelList
                        channels={channels}
                        dms={dms}
                        selectedChannel={selectedChannel}
                        onSelectChannel={async (channel) => {
                            // Load full channel data with members
                            if (user?.tenantId) {
                                try {
                                    const channelResponse = await chatApi.getChannel(user.tenantId, channel.id);
                                    if (channelResponse.success) {
                                        setSelectedChannel(channelResponse.data);
                                    } else {
                                        setSelectedChannel(channel);
                                    }
                                } catch (error) {
                                    console.error('Failed to load channel:', error);
                                    setSelectedChannel(channel);
                                }
                            } else {
                                setSelectedChannel(channel);
                            }
                        }}
                        onCreateChannel={() => setCreateChannelOpen(true)}
                        onCreateDM={() => setCreateDMOpen(true)}
                        getDMName={getDMName}
                        currentUserId={user.id}
                        userRole={user.role}
                        onJoinChannel={handleJoinChannel}
                        onLeaveChannel={handleLeaveChannel}
                        isJoining={isJoining}
                        isLeaving={isLeaving}
                    />
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background min-h-0">
                {selectedChannel ? (
                    <>
                        {/* Chat Header */}
                        <ChatHeader
                            channel={selectedChannel}
                            getDMName={getDMName}
                            memberCount={selectedChannel.members?.length || 0}
                            onBack={() => setSelectedChannel(null)}
                            currentUserId={user.id}
                            userRole={user.role}
                            onLeaveChannel={() => handleLeaveChannel()}
                            onManageMembers={() => setManageMembersOpen(true)}
                            isLeaving={isLeaving === selectedChannel.id}
                        />

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto bg-muted/30 min-h-0">
                            {messages.length === 0 ? (
                                <EmptyState
                                    type={selectedChannel.type === 'DIRECT' ? 'dm' : 'channel'}
                                    channelName={selectedChannel.name}
                                    userName={selectedChannel.type === 'DIRECT' ? getDMName(selectedChannel) : undefined}
                                />
                            ) : (
                                <div className="py-2 sm:py-4">
                                    {messages.map((message, idx) => (
                                        <MessageBubble
                                            key={message.id || idx}
                                            message={message}
                                            isOwn={message.user?.id === user.id}
                                            showAvatar={selectedChannel.type !== 'DIRECT'}
                                            showTimestamp={true}
                                            isDM={selectedChannel.type === 'DIRECT'}
                                            previousMessage={idx > 0 ? messages[idx - 1] : undefined}
                                        />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Message Input or Join Button */}
                        <div className="flex-shrink-0">
                            {(() => {
                                const isMember = selectedChannel.members?.some((m: any) => m.userId === user.id);
                                const isPublic = selectedChannel.type === 'PUBLIC';
                                const isPrivate = selectedChannel.type === 'PRIVATE';
                                
                                // Show join button if not a member (for both public and private)
                                if (!isMember && (isPublic || isPrivate)) {
                                    return (
                                        <div className="border-t border-border bg-background p-4 flex items-center justify-center">
                                            <Button
                                                onClick={() => handleJoinChannel(selectedChannel.id)}
                                                disabled={isJoining === selectedChannel.id || isPrivate}
                                                className="w-full max-w-md"
                                            >
                                                {isJoining === selectedChannel.id 
                                                    ? 'Joining...' 
                                                    : isPrivate 
                                                        ? 'Join request pending' 
                                                        : 'Join to chat'}
                                            </Button>
                                        </div>
                                    );
                                }
                                
                                // Only show message input if user is a member
                                if (isMember) {
                                    return (
                                        <MessageInput
                                            placeholder={
                                                selectedChannel.type === 'DIRECT'
                                                    ? `Message ${getDMName(selectedChannel)}`
                                                    : `Message #${selectedChannel.name}`
                                            }
                                            onSend={handleSendMessage}
                                        />
                                    );
                                }
                                
                                return null;
                            })()}
                        </div>
                    </>
                ) : (
                    <EmptyState />
                )}
            </div>

            {/* Create Channel Dialog */}
            <Dialog open={createChannelOpen} onOpenChange={setCreateChannelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Channel</DialogTitle>
                        <DialogDescription>
                            Create a new channel for your team
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="channel-name">Channel Name</Label>
                            <Input
                                id="channel-name"
                                placeholder="Channel name"
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateChannel()}
                            />
                        </div>
                        <div>
                            <Label htmlFor="channel-desc">Description (optional)</Label>
                            <Input
                                id="channel-desc"
                                placeholder="Description (optional)"
                                value={newChannelDesc}
                                onChange={(e) => setNewChannelDesc(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleCreateChannel()}
                            />
                        </div>
                        <div>
                            <Label>Channel Type</Label>
                            <div className="space-y-2 mt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="channelType"
                                        value="PUBLIC"
                                        checked={newChannelType === 'PUBLIC'}
                                        onChange={(e) => setNewChannelType(e.target.value as 'PUBLIC' | 'PRIVATE')}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">
                                        Public - All tenant users can see and join
                                    </span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="channelType"
                                        value="PRIVATE"
                                        checked={newChannelType === 'PRIVATE'}
                                        onChange={(e) => setNewChannelType(e.target.value as 'PUBLIC' | 'PRIVATE')}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">
                                        Private - Only visible to creator and invited members
                                    </span>
                                </label>
                            </div>
                        </div>
                        <LoadingButton 
                            onClick={handleCreateChannel} 
                            className="w-full"
                            loading={creatingChannel}
                            loadingText="Creating..."
                        >
                            Create Channel
                        </LoadingButton>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create DM Dialog */}
            <Dialog open={createDMOpen} onOpenChange={setCreateDMOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Direct Message</DialogTitle>
                        <DialogDescription>
                            Select a user to start a conversation
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {availableUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No other users available
                            </p>
                        ) : (
                            availableUsers.map((u) => (
                                <button
                                    key={u.id}
                                    onClick={() => handleCreateDM(u.id)}
                                    disabled={creatingDM === u.id}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {u.profile?.firstName?.[0] || ''}{u.profile?.lastName?.[0] || ''}
                                    </div>
                                    <div className="text-left min-w-0 flex-1">
                                        <div className="font-medium truncate">
                                            {u.profile?.firstName} {u.profile?.lastName}
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manage Members Dialog */}
            <Dialog open={manageMembersOpen} onOpenChange={setManageMembersOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Channel Members</DialogTitle>
                        <DialogDescription>
                            Add users to this private channel
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {availableUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No other users available
                                </p>
                            ) : (
                                availableUsers
                                    .filter((u: any) => !selectedChannel?.members?.some((m: any) => m.userId === u.id))
                                    .map((u: any) => (
                                        <label
                                            key={u.id}
                                            htmlFor={`user-${u.id}`}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                id={`user-${u.id}`}
                                                checked={selectedUsersForMembers.includes(u.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedUsersForMembers([...selectedUsersForMembers, u.id]);
                                                    } else {
                                                        setSelectedUsersForMembers(selectedUsersForMembers.filter(id => id !== u.id));
                                                    }
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                {u.profile?.firstName?.[0] || ''}{u.profile?.lastName?.[0] || ''}
                                            </div>
                                            <div className="text-left min-w-0 flex-1">
                                                <div className="font-medium truncate">
                                                    {u.profile?.firstName} {u.profile?.lastName}
                                                </div>
                                                <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                                            </div>
                                        </label>
                                    ))
                            )}
                        </div>
                        <LoadingButton 
                            onClick={handleAddMembers} 
                            className="w-full"
                            loading={addingMembers}
                            loadingText="Adding..."
                            disabled={selectedUsersForMembers.length === 0}
                        >
                            Add {selectedUsersForMembers.length > 0 ? `${selectedUsersForMembers.length} ` : ''}Member{selectedUsersForMembers.length !== 1 ? 's' : ''}
                        </LoadingButton>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
