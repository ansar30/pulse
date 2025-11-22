import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { User } from '@business-app/types';

interface AvatarProps {
    user?: {
        id?: string;
        profile?: {
            firstName?: string;
            lastName?: string;
            avatar?: string;
        };
    } | null;
    size?: 'small' | 'medium' | 'large';
    showBorder?: boolean;
}

const sizeMap = {
    small: 36,
    medium: 56,
    large: 80,
};

const fontSizeMap = {
    small: 12,
    medium: 20,
    large: 28,
};

export function Avatar({ user, size = 'medium', showBorder = false }: AvatarProps) {
    const { colors } = useTheme();
    const avatarSize = sizeMap[size];
    const fontSize = fontSizeMap[size];
    const [imageError, setImageError] = useState(false);

    const getInitials = () => {
        const firstName = user?.profile?.firstName || '';
        const lastName = user?.profile?.lastName || '';
        if (firstName && lastName) {
            return `${firstName[0]}${lastName[0]}`.toUpperCase();
        }
        if (firstName) {
            return firstName.slice(0, 2).toUpperCase();
        }
        if (user?.id) {
            return '?';
        }
        return '?';
    };

    const getAvatarColor = (userId?: string) => {
        if (!userId) return colors.textTertiary;
        const avatarColors = [
            colors.primary,
            colors.info,
            colors.accent,
            colors.success,
            colors.warning,
            colors.secondary,
            colors.primaryLight,
            colors.error,
        ];
        const index = userId.charCodeAt(0) % avatarColors.length;
        return avatarColors[index];
    };

    const avatarBgColor = getAvatarColor(user?.id);
    const avatarUrl = user?.profile?.avatar;
    // Only show image if it's a valid data URL and not too large (prevent performance issues)
    const isValidDataUrl = avatarUrl && avatarUrl.trim() !== '' && avatarUrl.startsWith('data:image');
    const shouldShowImage = isValidDataUrl && !imageError;

    // If avatar URL exists and is valid, show image
    if (shouldShowImage) {
        return (
            <View
                pointerEvents="none"
                style={[
                    styles.container,
                    {
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                        borderWidth: showBorder ? 2 : 0,
                        borderColor: showBorder ? colors.border : 'transparent',
                    },
                ]}
            >
                <Image
                    source={{ uri: avatarUrl }}
                    style={[
                        styles.image,
                        {
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: avatarSize / 2,
                        },
                    ]}
                    resizeMode="cover"
                    onError={() => {
                        setImageError(true);
                    }}
                />
            </View>
        );
    }

    // Fallback to initials
    return (
        <View
            pointerEvents="none"
            style={[
                styles.container,
                {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    backgroundColor: avatarBgColor,
                    borderWidth: showBorder ? 2 : 0,
                    borderColor: showBorder ? colors.border : 'transparent',
                },
            ]}
        >
            <Text style={[styles.initials, { fontSize, color: '#ffffff' }]}>
                {getInitials()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        backgroundColor: 'transparent',
    },
    initials: {
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

