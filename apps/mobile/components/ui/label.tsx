import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { cn } from '@/lib/utils';

interface LabelProps {
    children: React.ReactNode;
    className?: string;
    htmlFor?: string;
}

export function Label({ children, className, htmlFor }: LabelProps) {
    const { colors } = useTheme();
    return (
        <Text style={[styles.label, { color: colors.text }]} className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}>
            {children}
        </Text>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
});

