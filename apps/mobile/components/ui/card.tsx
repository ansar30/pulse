import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    const { colors } = useTheme();
    return (
        <View
            className={cn('rounded-2xl border shadow-soft', className)}
            style={[
                styles.card,
                {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                },
            ]}
        >
            {children}
        </View>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
    return (
        <View className={cn('flex flex-col px-6 pt-6 pb-4', className)}>
            {children}
        </View>
    );
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
    const { colors } = useTheme();
    return (
        <Text
            className={cn('text-xl font-bold leading-tight tracking-tight', className)}
            style={{ color: colors.text }}
        >
            {children}
        </Text>
    );
}

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
    numberOfLines?: number;
}

export function CardDescription({ children, className, numberOfLines }: CardDescriptionProps) {
    const { colors } = useTheme();
    return (
        <Text
            className={cn('text-sm mt-1.5 leading-relaxed', className)}
            style={{ color: colors.textSecondary }}
            numberOfLines={numberOfLines}
        >
            {children}
        </Text>
    );
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
    return (
        <View className={cn('px-6 pb-6', className)}>
            {children}
        </View>
    );
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
    return (
        <View className={cn('flex items-center px-6 pb-6', className)}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
    },
});

