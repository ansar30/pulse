import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';

interface InputProps extends TextInputProps {
    className?: string;
}

export function Input({ className, style, ...props }: InputProps) {
    const { colors } = useTheme();
    return (
        <TextInput
            className={cn(
                'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
                'disabled:opacity-50',
                className
            )}
            style={[
                {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.text,
                },
                style,
            ]}
            placeholderTextColor={colors.textTertiary}
            {...props}
        />
    );
}

