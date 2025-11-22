'use client';

import { useState } from 'react';
import { Hash, User, Info, MoreVertical, ArrowLeft, LogOut, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ChatHeaderProps {
    channel: {
        id: string;
        name: string;
        description?: string;
        type: string;
        createdBy?: string;
        members?: Array<{ userId: string; user?: { profile?: { firstName?: string; lastName?: string } } }>;
    };
    getDMName: (channel: any) => string;
    memberCount?: number;
    onBack?: () => void;
    currentUserId?: string;
    userRole?: string;
    onLeaveChannel?: () => void;
    onManageMembers?: () => void;
    onDeleteChannel?: () => void;
    isLeaving?: boolean;
}

export function ChatHeader({ 
    channel, 
    getDMName, 
    memberCount, 
    onBack,
    currentUserId,
    userRole,
    onLeaveChannel,
    onManageMembers,
    onDeleteChannel,
    isLeaving,
}: ChatHeaderProps) {
    const router = useRouter();
    const [showMembers, setShowMembers] = useState(false);
    const isDM = channel.type === 'DIRECT';
    const isPublic = channel.type === 'PUBLIC';
    const isPrivate = channel.type === 'PRIVATE';
    const displayName = isDM ? getDMName(channel) : channel.name;
    const isMember = currentUserId && channel.members?.some(m => m.userId === currentUserId);
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';
    const isCreator = channel.createdBy === currentUserId;
    const canManage = isAdmin || isCreator;

    return (
        <div className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {onBack && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="sm:hidden h-9 w-9 flex-shrink-0 -ml-1"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                )}
                <div className="flex-shrink-0">
                    {isDM ? (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                            {displayName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                        </div>
                    ) : (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Hash className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                    )}
                </div>
                
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-sm sm:text-base text-foreground truncate">
                            {displayName}
                        </h2>
                        {isPublic && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-500/20 text-green-400 rounded">
                                Public
                            </span>
                        )}
                        {isPrivate && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-orange-500/20 text-orange-400 rounded">
                                Private
                            </span>
                        )}
                    </div>
                    {channel.description && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                            {channel.description}
                        </p>
                    )}
                    {!isDM && memberCount !== undefined && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </p>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-0.5 sm:gap-1">
                {!isDM && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setShowMembers(true)}
                        title="View members"
                    >
                        <Users className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">{channel.members?.length || memberCount || 0}</span>
                        <span className="sm:hidden">{channel.members?.length || memberCount || 0}</span>
                    </Button>
                )}
                {!isDM && isPrivate && canManage && onManageMembers && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hidden sm:flex"
                        onClick={onManageMembers}
                        title="Manage members"
                    >
                        Add
                    </Button>
                )}
                {!isDM && canManage && onDeleteChannel && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={onDeleteChannel}
                        title="Delete channel"
                    >
                        <X className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                    </Button>
                )}
                {!isDM && isMember && onLeaveChannel && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={onLeaveChannel}
                        disabled={isLeaving}
                        title="Leave channel"
                    >
                        <LogOut className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Leave</span>
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hidden sm:flex"
                    title="Channel info"
                >
                    <Info className="w-5 h-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    title="More options"
                >
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </div>

            {/* Members Dialog */}
            <Dialog open={showMembers} onOpenChange={setShowMembers}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Channel Members</DialogTitle>
                        <DialogDescription>
                            {channel.members?.length || 0} {channel.members?.length === 1 ? 'member' : 'members'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto space-y-2">
                        {channel.members && Array.isArray(channel.members) && channel.members.length > 0 ? (
                            channel.members.map((member: any) => {
                                const memberUser = member.user || {};
                                const profile = memberUser.profile || {};
                                const memberName = profile.firstName || profile.lastName
                                    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || memberUser.email
                                    : memberUser.email || 'Unknown User';
                                const initials = memberName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                                
                                return (
                                    <div
                                        key={member.userId || member.id}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                            {initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{memberName}</div>
                                            <div className="text-sm text-muted-foreground truncate">{memberUser?.email || 'No email'}</div>
                                        </div>
                                        {member.role && (
                                            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                                                {member.role}
                                            </span>
                                        )}
                                        {canManage && member.userId !== channel.createdBy && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const event = new CustomEvent('removeMember', { detail: member.userId });
                                                    window.dispatchEvent(event);
                                                }}
                                                title="Remove member"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No members found. {channel.members ? `Members array exists but is empty.` : 'Members data not loaded.'}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

