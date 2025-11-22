'use client';

import { MessageSquare, Hash, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    type?: 'default' | 'channel' | 'dm';
    channelName?: string;
    userName?: string;
}

export function EmptyState({ type = 'default', channelName, userName }: EmptyStateProps) {
    if (type === 'channel' && channelName) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Hash className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-primary-foreground" />
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    Welcome to #{channelName}!
                </h3>
                <p className="text-muted-foreground max-w-md">
                    This is the beginning of the <strong>#{channelName}</strong> channel. Start the conversation by sending a message.
                </p>
            </div>
        );
    }

    if (type === 'dm' && userName) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    Start a conversation with {userName}
                </h3>
                <p className="text-muted-foreground max-w-md">
                    This is your direct message history with <strong>{userName}</strong>. Send a message to get started!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground" />
                </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
                Select a channel or DM to start chatting
            </h3>
            <p className="text-muted-foreground max-w-md">
                Choose a conversation from the sidebar or create a new channel or direct message to get started.
            </p>
        </div>
    );
}

