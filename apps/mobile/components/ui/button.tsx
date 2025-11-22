import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';

interface ButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    className?: string;
    loading?: boolean;
}

export function Button({
    children,
    onPress,
    variant = 'default',
    size = 'default',
    disabled = false,
    className,
    loading = false,
    ...props
}: ButtonProps) {
    const { colors } = useTheme();
    const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';

    const getVariantStyle = () => {
        switch (variant) {
            case 'default':
                return { backgroundColor: colors.primary };
            case 'destructive':
                return { backgroundColor: colors.error };
            case 'outline':
                return { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.border };
            case 'secondary':
                return { backgroundColor: colors.surfaceElevated };
            case 'ghost':
                return { backgroundColor: 'transparent' };
            case 'link':
                return { backgroundColor: 'transparent' };
            default:
                return { backgroundColor: colors.primary };
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'default':
            case 'destructive':
                return colors.surface;
            case 'outline':
            case 'secondary':
            case 'ghost':
                return colors.text;
            case 'link':
                return colors.primary;
            default:
                return colors.surface;
        }
    };

    const sizeClasses = {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 px-4 py-2',
        lg: 'h-14 px-8 py-4',
        icon: 'h-12 w-12',
    };

    // Helper to render button content properly
    const renderContent = () => {
        const textColor = getTextColor();
        if (loading) {
            return (
                <View className="flex-row items-center gap-2">
                    <ActivityIndicator
                        size="small"
                        color={variant === 'default' || variant === 'destructive' ? colors.surface : colors.primary}
                    />
                </View>
            );
        }

        // Handle different types of children
        if (typeof children === 'string') {
            return (
                <Text style={[styles.buttonText, { color: textColor }]}>
                    {children}
                </Text>
            );
        }

        // If children is a React element or array of elements, wrap in flex-row
        if (React.isValidElement(children) || Array.isArray(children)) {
            return (
                <View className="flex-row items-center gap-2">
                    {React.Children.map(children, (child) => {
                        // If child is text, wrap it properly
                        if (typeof child === 'string') {
                            return (
                                <Text style={[styles.buttonText, { color: textColor }]}>
                                    {child}
                                </Text>
                            );
                        }
                        // If it's already a React element (like an icon), render as-is
                        return child;
                    })}
                </View>
            );
        }

        // Fallback for any other type
        return (
            <Text style={[styles.buttonText, { color: textColor }]}>
                {String(children)}
            </Text>
        );
    };

    const variantStyle = getVariantStyle();
    const textColor = getTextColor();
    
    const sizeStyles = {
        lg: { minHeight: 56, paddingVertical: 16 },
        sm: { minHeight: 40, paddingVertical: 10 },
        default: { minHeight: 48, paddingVertical: 14 },
        icon: { minHeight: 48, width: 48, paddingVertical: 0 },
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                variantStyle,
                sizeStyles[size],
                { 
                    opacity: disabled || loading ? 0.6 : 1,
                },
            ]}
            activeOpacity={0.8}
            {...props}
        >
            {renderContent()}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});


