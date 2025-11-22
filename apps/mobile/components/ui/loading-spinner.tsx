import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
    const sizeMap = {
        sm: 'small',
        md: 'small',
        lg: 'large',
    } as const;

    return (
        <View className={cn('flex flex-col items-center justify-center', className)}>
            <ActivityIndicator size={sizeMap[size]} color="#2563eb" />
            {text && (
                <Text className="mt-2 text-sm text-gray-500">
                    {text}
                </Text>
            )}
        </View>
    );
}

