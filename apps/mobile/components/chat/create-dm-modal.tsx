import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { X, Search, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '@/components/ui/avatar';

interface User {
    id: string;
    email: string;
    profile?: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
}

interface CreateDMModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (userId: string) => Promise<void>;
    users: User[];
    loading?: boolean;
    currentUserId?: string;
}

export function CreateDMModal({ visible, onClose, onCreate, users, loading: externalLoading, currentUserId }: CreateDMModalProps) {
    const { colors } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [creating, setCreating] = useState(false);

    const filteredUsers = users.filter((user) => {
        if (user.id === currentUserId) return false; // Don't show current user

        const fullName = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.toLowerCase();
        const email = user.email.toLowerCase();
        const query = searchQuery.toLowerCase();

        return fullName.includes(query) || email.includes(query);
    });

    const handleCreate = async () => {
        if (!selectedUser) return;

        try {
            setCreating(true);
            await onCreate(selectedUser.id);
            // Reset state
            setSearchQuery('');
            setSelectedUser(null);
            onClose();
        } catch (err) {
            console.error('Failed to create DM:', err);
            // Error is handled by parent
        } finally {
            setCreating(false);
        }
    };

    const handleClose = () => {
        if (!creating) {
            setSearchQuery('');
            setSelectedUser(null);
            onClose();
        }
    };

    const getUserName = (user: User) => {
        const firstName = user.profile?.firstName || '';
        const lastName = user.profile?.lastName || '';
        return `${firstName} ${lastName}`.trim() || user.email;
    };


    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalContentWrapper}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        {/* Header */}
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <View style={styles.modalHeaderLeft}>
                                <View style={[styles.modalIconContainer, { backgroundColor: colors.primary + '15' }]}>
                                    <User size={20} color={colors.primary} strokeWidth={2.5} />
                                </View>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>New Direct Message</Text>
                            </View>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <X size={24} color={colors.textSecondary} strokeWidth={2} />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                            <Search size={18} color={colors.textSecondary} strokeWidth={2} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search people..."
                                placeholderTextColor={colors.textTertiary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!creating}
                            />
                        </View>

                        {/* User List */}
                        <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
                        {externalLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading users...</Text>
                            </View>
                        ) : filteredUsers.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <User size={48} color={colors.textTertiary} strokeWidth={1.5} />
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                    {searchQuery ? 'No users found' : 'No users available'}
                                </Text>
                                <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
                                    {searchQuery ? 'Try a different search term' : 'Invite team members to start chatting'}
                                </Text>
                            </View>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = selectedUser?.id === user.id;

                                return (
                                    <TouchableOpacity
                                        key={user.id}
                                        style={[styles.userItem, { backgroundColor: colors.surface, borderColor: 'transparent' }, isSelected && { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
                                        onPress={() => setSelectedUser(user)}
                                        disabled={creating}
                                    >
                                        <View style={styles.avatarWrapper}>
                                            <Avatar 
                                                user={{
                                                    id: user.id,
                                                    profile: user.profile
                                                }}
                                                size="medium"
                                            />
                                        </View>
                                        <View style={styles.userInfo}>
                                            <Text style={[styles.userName, { color: colors.text }, isSelected && { color: colors.primary }]}>
                                                {getUserName(user)}
                                            </Text>
                                            <Text style={[styles.userEmail, { color: colors.textSecondary }, isSelected && { color: colors.primary }]}>
                                                {user.email}
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <View style={[styles.checkmark, { borderColor: colors.primary }]}>
                                                <View style={[styles.checkmarkInner, { backgroundColor: colors.primary }]} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        )}
                        </ScrollView>

                        {/* Footer */}
                        <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                                onPress={handleClose}
                                disabled={creating}
                            >
                                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.createButton, (!selectedUser || creating) && styles.createButtonDisabled]}
                                onPress={handleCreate}
                                disabled={!selectedUser || creating}
                            >
                                <LinearGradient
                                    colors={!selectedUser || creating ? [colors.textTertiary, colors.textTertiary] : [colors.primary, colors.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.createButtonGradient}
                                >
                                    <Text style={[styles.createButtonText, { color: colors.surface }]}>
                                        {creating ? 'Creating...' : 'Start Conversation'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContentWrapper: {
        width: '100%',
        maxWidth: 500,
        maxHeight: '80%',
    },
    modalContent: {
        borderRadius: 20,
        width: '100%',
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    modalHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 19,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    userList: {
        maxHeight: 400,
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
        gap: 12,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    emptyMessage: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 2,
    },
    avatarWrapper: {
        marginRight: 12,
    },
    userInfo: {
        flex: 1,
        minWidth: 0,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    checkmarkInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderTopWidth: 1,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    createButtonDisabled: {
        opacity: 0.5,
    },
    createButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
