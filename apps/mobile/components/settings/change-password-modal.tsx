import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Lock, Eye, EyeOff } from 'lucide-react-native';

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function ChangePasswordModal({ visible, onClose, onChangePassword }: ChangePasswordModalProps) {
    const { colors } = useTheme();
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

        try {
            setLoading(true);
            await onChangePassword(currentPassword, newPassword);
            Alert.alert('Success', 'Password changed successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setErrors({});
                        onClose();
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                style={[styles.overlay, { backgroundColor: colors.backgroundOverlay }]}
                activeOpacity={1}
                onPress={handleClose}
            >
                <TouchableOpacity
                    style={[styles.modalContent, { backgroundColor: colors.surface }]}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                            <Lock size={24} color={colors.primary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            Enter your current password and choose a new one
                        </Text>
                    </View>

                    <View style={styles.content}>
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

                    <View style={[styles.footer, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: colors.surfaceElevated }]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <LoadingButton
                            onPress={handleSubmit}
                            loading={loading}
                            style={styles.changeButton}
                        >
                            <Text style={[styles.changeButtonText, { color: colors.surface }]}>
                                Change Password
                            </Text>
                        </LoadingButton>
                    </View>
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
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 6,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    content: {
        padding: 24,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
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
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    changeButton: {
        flex: 1,
    },
    changeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

