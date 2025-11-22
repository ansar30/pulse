'use client';

import { appConfig } from '@/lib/app-config';
import { cn } from '@/lib/utils';

interface AppNameProps {
    className?: string;
    variant?: 'default' | 'gradient' | 'simple';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showLogo?: boolean; // Override config if needed
}

export function AppName({ className, variant = 'gradient', size = 'md', showLogo }: AppNameProps) {
    const sizeClasses = {
        sm: 'text-base',
        md: 'text-lg sm:text-xl',
        lg: 'text-2xl sm:text-3xl',
        xl: 'text-3xl sm:text-4xl md:text-5xl',
    };

    const variantClasses = {
        default: 'text-foreground',
        gradient: `bg-gradient-to-r ${appConfig.branding.gradient.from} ${appConfig.branding.gradient.via} ${appConfig.branding.gradient.to} bg-clip-text text-transparent`,
        simple: 'text-foreground',
    };

    const shouldShowLogo = showLogo !== undefined ? showLogo : appConfig.branding.showLogo;

    const nameElement = (
        <span
            className={cn(
                'app-name',
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
        >
            {appConfig.displayName}
        </span>
    );

    if (shouldShowLogo) {
        return (
            <div className="flex items-center gap-2 sm:gap-3">
                <div className={cn('flex-shrink-0', appConfig.branding.logo.className)} />
                {nameElement}
            </div>
        );
    }

    return nameElement;
}

