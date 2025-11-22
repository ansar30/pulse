import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { Edit2, KeyRound, Trash2, MoreVertical, X } from 'lucide-react-native';

interface UserActionsMenuProps {
    onEdit: () => void;
    onResetPassword: () => void;
    onDelete: () => void;
    resettingPassword?: boolean;
    deleting?: boolean;
}

export function UserActionsMenu({ onEdit, onResetPassword, onDelete, resettingPassword = false, deleting = false }: UserActionsMenuProps) {
    const { colors } = useTheme();
    const [open, setOpen] = useState(false);

    const handleEdit = () => {
        setOpen(false);
        onEdit();
    };

    const handleResetPassword = () => {
        setOpen(false);
        onResetPassword();
    };

    const handleDelete = () => {
        setOpen(false);
        onDelete();
    };

    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                style={[styles.menuButton, { backgroundColor: colors.surfaceElevated }]}
            >
                <MoreVertical size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setOpen(false)}
                >
                    <Pressable
                        style={[styles.menuContent, { backgroundColor: colors.surface }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={[styles.menuHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.menuTitle, { color: colors.text }]}>Actions</Text>
                            <TouchableOpacity
                                onPress={() => setOpen(false)}
                                style={styles.closeButton}
                            >
                                <X size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.menuItems}>
                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                                onPress={handleEdit}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <Edit2 size={18} color={colors.primary} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>Edit User</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                                onPress={handleResetPassword}
                                disabled={resettingPassword}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: colors.warning + '15' }]}>
                                    <KeyRound size={18} color={colors.warning} />
                                </View>
                                <Text style={[styles.menuItemText, { color: colors.text }]}>
                                    {resettingPassword ? 'Resetting...' : 'Reset Password'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={handleDelete}
                                disabled={deleting}
                            >
                                <View style={[styles.menuItemIcon, { backgroundColor: colors.error + '15' }]}>
                                    <Trash2 size={18} color={colors.error} />
                                </View>
                                <Text style={[styles.menuItemText, { color: deleting ? colors.textTertiary : colors.error }]}>
                                    {deleting ? 'Deleting...' : 'Delete User'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    menuContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItems: {
        paddingVertical: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    menuItemIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
});

