import React from 'react';
import { Text, View } from 'react-native';
import { appConfig } from '@/lib/app-config';
import { cn } from '@/lib/utils';

interface AppNameProps {
    className?: string;
    variant?: 'default' | 'gradient' | 'simple';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showLogo?: boolean;
}

export function AppName({ className, variant = 'gradient', size = 'md', showLogo }: AppNameProps) {
    const sizeClasses = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-2xl',
        xl: 'text-3xl',
    };

    const shouldShowLogo = showLogo !== undefined ? showLogo : appConfig.branding.showLogo;

    const nameElement = (
        <Text
            className={cn(
                'app-name',
                sizeClasses[size],
                variant === 'gradient' ? 'text-blue-600' : 'text-gray-900',
                className
            )}
            style={{
                fontFamily: appConfig.branding.fontFamily,
                letterSpacing: 0.5,
            }}
        >
            {appConfig.displayName}
        </Text>
    );

    if (shouldShowLogo) {
        return (
            <View className="flex-row items-center gap-2">
                <View 
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: '#3B82F6' }}
                />
                {nameElement}
            </View>
        );
    }

    return nameElement;
}

