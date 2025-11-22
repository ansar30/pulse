import { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { Send } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';

interface MessageInputProps {
    placeholder?: string;
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function MessageInput({ placeholder = 'Type a message...', onSend, disabled }: MessageInputProps) {
    const { colors } = useTheme();
    const [message, setMessage] = useState('');
    const inputRef = useRef<TextInput>(null);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
            // Dismiss keyboard after sending
            Keyboard.dismiss();
        }
    };

    return (
        <View style={[styles.container, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={styles.inputRow}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        ref={inputRef}
                        value={message}
                        onChangeText={setMessage}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textTertiary}
                        disabled={disabled}
                        multiline
                        style={[
                            styles.input,
                            {
                                borderColor: colors.border,
                                backgroundColor: colors.surfaceElevated,
                                color: colors.text,
                            },
                        ]}
                        returnKeyType="send"
                        blurOnSubmit={false}
                        onSubmitEditing={handleSend}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!message.trim() || disabled}
                    style={[
                        styles.sendButton,
                        {
                            backgroundColor: colors.primary,
                            opacity: (!message.trim() || disabled) ? 0.5 : 1,
                        },
                    ]}
                    activeOpacity={0.7}
                >
                    <Send size={18} color={colors.surface} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
        minWidth: 0,
    },
    input: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingRight: 48,
        maxHeight: 120,
        textAlignVertical: 'top',
        fontSize: 16,
        lineHeight: 22,
    },
    sendButton: {
        height: 44,
        width: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
});

