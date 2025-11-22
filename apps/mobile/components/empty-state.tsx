import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/providers/theme-provider';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.iconContainer}>
                <Icon size={80} color={colors.textTertiary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity style={styles.actionButton} onPress={onAction}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.actionGradient}
                    >
                        <Text style={[styles.actionText, { color: colors.surface }]}>{actionLabel}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    iconContainer: {
        marginBottom: 24,
        opacity: 0.6,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
    },
    actionButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    actionGradient: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
