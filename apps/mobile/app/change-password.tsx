import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useTheme } from '@/components/providers/theme-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { useAuthStore } from '@/lib/store';
import { usersApi } from '@/lib/api-client';

export default function ChangePasswordScreen() {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { user } = useAuthStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!currentPassword.trim()) {
            newErrors.currentPassword = 'Current password is required';
        }

        if (!newPassword.trim()) {
            newErrors.newPassword = 'New password is required';
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (currentPassword === newPassword) {
            newErrors.newPassword = 'New password must be different from current password';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        if (!user?.tenantId || !user?.id) {
            Alert.alert('Error', 'User information not available');
            return;
        }

        try {
            setLoading(true);
            await usersApi.changePassword(user.tenantId, user.id, currentPassword, newPassword);
            Alert.alert('Success', 'Password changed successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        router.back();
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: insets.top }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Change Password</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={{ flex: 1 }}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Icon and Description */}
                        <View style={styles.iconSection}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                                <Lock size={32} color={colors.primary} />
                            </View>
                            <Text style={[styles.description, { color: colors.textSecondary }]}>
                                Enter your current password and choose a new one to secure your account
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Label>Current Password *</Label>
                                <View style={styles.passwordContainer}>
                                    <Input
                                        value={currentPassword}
                                        onChangeText={(text) => {
                                            setCurrentPassword(text);
                                            if (errors.currentPassword) {
                                                setErrors({ ...errors, currentPassword: '' });
                                            }
                                        }}
                                        placeholder="Enter current password"
                                        secureTextEntry={!showCurrentPassword}
                                        style={styles.passwordInput}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff size={20} color={colors.textTertiary} />
                                        ) : (
                                            <Eye size={20} color={colors.textTertiary} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {errors.currentPassword && (
                                    <Text style={[styles.errorText, { color: colors.error }]}>
                                        {errors.currentPassword}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.inputGroup}>
                                <Label>New Password *</Label>
                                <View style={styles.passwordContainer}>
                                    <Input
                                        value={newPassword}
                                        onChangeText={(text) => {
                                            setNewPassword(text);
                                            if (errors.newPassword) {
                                                setErrors({ ...errors, newPassword: '' });
                                            }
                                        }}
                                        placeholder="Enter new password"
                                        secureTextEntry={!showNewPassword}
                                        style={styles.passwordInput}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff size={20} color={colors.textTertiary} />
                                        ) : (
                                            <Eye size={20} color={colors.textTertiary} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {errors.newPassword && (
                                    <Text style={[styles.errorText, { color: colors.error }]}>
                                        {errors.newPassword}
                                    </Text>
                                )}
                                <Text style={[styles.hintText, { color: colors.textTertiary }]}>
                                    Password must be at least 6 characters long
                                </Text>
                            </View>

                            <View style={styles.inputGroup}>
                                <Label>Confirm New Password *</Label>
                                <View style={styles.passwordContainer}>
                                    <Input
                                        value={confirmPassword}
                                        onChangeText={(text) => {
                                            setConfirmPassword(text);
                                            if (errors.confirmPassword) {
                                                setErrors({ ...errors, confirmPassword: '' });
                                            }
                                        }}
                                        placeholder="Confirm new password"
                                        secureTextEntry={!showConfirmPassword}
                                        style={styles.passwordInput}
                                    />
                                    <TouchableOpacity
                                        style={styles.eyeIcon}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={20} color={colors.textTertiary} />
                                        ) : (
                                            <Eye size={20} color={colors.textTertiary} />
                                        )}
                                    </TouchableOpacity>
                                </View>
                                {errors.confirmPassword && (
                                    <Text style={[styles.errorText, { color: colors.error }]}>
                                        {errors.confirmPassword}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Submit Button */}
                        <View style={styles.buttonContainer}>
                            <LoadingButton
                                onPress={handleSubmit}
                                loading={loading}
                                variant="default"
                            >
                                Change Password
                            </LoadingButton>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    iconSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 10,
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 48,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 12,
        padding: 4,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    hintText: {
        fontSize: 12,
        marginTop: 4,
    },
    buttonContainer: {
        marginTop: 32,
        marginBottom: 20,
    },
});

