'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface MessageInputProps {
    placeholder?: string;
    onSend: (message: string) => void;
    disabled?: boolean;
}

const EMOJI_LIST = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

export function MessageInput({ placeholder = 'Type a message...', onSend, disabled }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [emojiOpen, setEmojiOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const maxHeight = 100; // Reduced for mobile
            const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
            textareaRef.current.style.height = `${newHeight}px`;
            // Hide scrollbar when not needed
            if (textareaRef.current.scrollHeight <= maxHeight) {
                textareaRef.current.style.overflowY = 'hidden';
            } else {
                textareaRef.current.style.overflowY = 'auto';
            }
        }
    }, [message]);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emoji: string) => {
        setMessage((prev) => prev + emoji);
        setEmojiOpen(false);
        textareaRef.current?.focus();
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For now, just show a message. In production, you'd upload the file
            console.log('File selected:', file.name);
            // You can add file upload logic here
            // For example: uploadFile(file).then(url => onSend(`[File: ${file.name}](${url})`));
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="border-t border-border bg-background p-2 sm:p-4 flex-shrink-0 z-10">
            <div className="flex items-end gap-1.5 sm:gap-2 max-w-4xl mx-auto">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-foreground active:bg-muted"
                    disabled={disabled}
                    type="button"
                    onClick={handleFileClick}
                    title="Attach file"
                >
                    <Paperclip className="w-4 h-4" />
                </Button>
                
                <div className="flex-1 relative min-w-0">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        rows={1}
                        className={cn(
                            "w-full resize-none rounded-2xl border border-input bg-background px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12",
                            "text-sm sm:text-base leading-relaxed",
                            "placeholder:text-muted-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "max-h-[100px]",
                            "overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent"
                        )}
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'transparent transparent',
                        }}
                    />
                    <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 h-7 w-7 text-muted-foreground hover:text-foreground active:bg-muted"
                                disabled={disabled}
                                title="Add emoji"
                            >
                                <Smile className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 sm:w-80 p-2" align="end">
                            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-[200px] overflow-y-auto">
                                {EMOJI_LIST.map((emoji, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="text-lg sm:text-xl p-1.5 hover:bg-muted rounded-md transition-colors active:scale-90"
                                        type="button"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
                
                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || disabled}
                    size="icon"
                    type="button"
                    className="flex-shrink-0 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    title="Send message"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

