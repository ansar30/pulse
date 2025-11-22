import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/providers/theme-provider';

interface ErrorStateProps {
    error: Error | string;
    onRetry?: () => void;
    message?: string;
}

export function ErrorState({ error, onRetry, message }: ErrorStateProps) {
    const { colors } = useTheme();
    const errorMessage = message || (typeof error === 'string' ? error : error.message);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.iconContainer}>
                <AlertCircle size={64} color={colors.error} strokeWidth={1.5} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Oops! Something went wrong</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>{errorMessage}</Text>
            {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.retryGradient}
                    >
                        <RefreshCw size={20} color={colors.surface} strokeWidth={2} />
                        <Text style={[styles.retryText, { color: colors.surface }]}>Try Again</Text>
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
    retryButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    retryGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    retryText: {
        fontSize: 16,
        fontWeight: '700',
    },
});
