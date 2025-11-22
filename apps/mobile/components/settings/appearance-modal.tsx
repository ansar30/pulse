import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { ColorTheme, themeNames } from '@/lib/theme-colors';
import { Check } from 'lucide-react-native';

interface AppearanceModalProps {
    visible: boolean;
    onClose: () => void;
}

export function AppearanceModal({ visible, onClose }: AppearanceModalProps) {
    const { colors, colorTheme, setColorTheme, isDark } = useTheme();

    const themes: ColorTheme[] = ['blue', 'purple', 'green', 'red', 'orange', 'pink', 'teal', 'indigo'];

    const themeColors: Record<ColorTheme, { light: string; dark: string }> = {
        blue: { light: '#2563eb', dark: '#3b82f6' },
        purple: { light: '#9333ea', dark: '#a855f7' },
        green: { light: '#10b981', dark: '#34d399' },
        red: { light: '#ef4444', dark: '#f87171' },
        orange: { light: '#f97316', dark: '#fb923c' },
        pink: { light: '#ec4899', dark: '#f472b6' },
        teal: { light: '#14b8a6', dark: '#2dd4bf' },
        indigo: { light: '#6366f1', dark: '#818cf8' },
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={[styles.modalContent, { backgroundColor: colors.surface }]}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Choose Theme</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            Select a color theme for your app
                        </Text>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.themeGrid}>
                            {themes.map((theme) => {
                                const isSelected = colorTheme === theme;
                                const themeColor = isDark ? themeColors[theme].dark : themeColors[theme].light;

                                return (
                                    <TouchableOpacity
                                        key={theme}
                                        style={[
                                            styles.themeOption,
                                            {
                                                backgroundColor: colors.surfaceElevated,
                                                borderColor: isSelected ? themeColor : colors.border,
                                                borderWidth: isSelected ? 2 : 1,
                                            },
                                        ]}
                                        onPress={() => {
                                            setColorTheme(theme);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.themePreview}>
                                            <View
                                                style={[
                                                    styles.colorCircle,
                                                    { backgroundColor: themeColor },
                                                ]}
                                            />
                                            <Text style={[styles.themeName, { color: colors.text }]}>
                                                {themeNames[theme]}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <View
                                                style={[
                                                    styles.checkContainer,
                                                    { backgroundColor: themeColor },
                                                ]}
                                            >
                                                <Check size={16} color={colors.surface} strokeWidth={3} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colors.primary }]}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.closeButtonText}>Done</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        borderRadius: 20,
        maxHeight: '85%',
        minHeight: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    themeOption: {
        width: '47%',
        minWidth: 140,
        aspectRatio: 1.2,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
        position: 'relative',
    },
    themePreview: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    colorCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginBottom: 12,
    },
    themeName: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
    checkContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        marginHorizontal: 24,
        marginBottom: 24,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});

// Export themeNames for use in settings
export { themeNames };

