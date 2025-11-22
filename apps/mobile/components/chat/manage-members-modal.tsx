import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Search, UserPlus, Check } from 'lucide-react-native';
import { usersApi } from '@/lib/api-client';
import { Avatar } from '@/components/ui/avatar';
import { LoadingSkeleton } from '@/components/loading-skeleton';

interface User {
    id: string;
    email: string;
    profile?: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
}

interface ManageMembersModalProps {
    visible: boolean;
    onClose: () => void;
    onAddMembers: (userIds: string[]) => Promise<void>;
    existingMemberIds: string[];
    tenantId: string;
    currentUserId?: string;
    loading?: boolean;
}

export function ManageMembersModal({
    visible,
    onClose,
    onAddMembers,
    existingMemberIds,
    tenantId,
    currentUserId,
    loading: externalLoading,
}: ManageMembersModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (visible && tenantId) {
            fetchUsers();
        } else {
            // Reset state when modal closes
            setSearchQuery('');
            setSelectedUserIds([]);
        }
    }, [visible, tenantId]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await usersApi.getAll(tenantId);
            if (response.success) {
                // Filter out current user and existing members
                const availableUsers = (response.data || []).filter(
                    (u: User) => u.id !== currentUserId && !existingMemberIds.includes(u.id)
                );
                setUsers(availableUsers);
            }
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        const firstName = user.profile?.firstName?.toLowerCase() || '';
        const lastName = user.profile?.lastName?.toLowerCase() || '';
        const email = user.email.toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();

        return fullName.includes(query) || email.includes(query);
    });

    const toggleUserSelection = (userId: string) => {
        if (selectedUserIds.includes(userId)) {
            setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
        } else {
            setSelectedUserIds([...selectedUserIds, userId]);
        }
    };

    const handleAdd = async () => {
        if (selectedUserIds.length === 0) return;

        try {
            setAdding(true);
            await onAddMembers(selectedUserIds);
            // Reset and close
            setSelectedUserIds([]);
            setSearchQuery('');
            onClose();
        } catch (err) {
            console.error('Failed to add members:', err);
            // Error is handled by parent
        } finally {
            setAdding(false);
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
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalContainer} edges={['top']}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle}>Add Members</Text>
                            <Text style={styles.headerSubtitle}>
                                Select users from your tenant
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                            disabled={adding}
                        >
                            <X size={24} color="#111827" strokeWidth={2} />
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View style={styles.searchContainer}>
                        <Search size={18} color="#9ca3af" strokeWidth={2} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search users..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            editable={!adding}
                        />
                    </View>

                    {/* Users List */}
                    <ScrollView
                        style={styles.usersList}
                        contentContainerStyle={styles.usersListContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <View key={i} style={styles.skeletonItem}>
                                        <LoadingSkeleton width={48} height={48} borderRadius={24} />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <LoadingSkeleton width="60%" height={16} borderRadius={8} />
                                            <LoadingSkeleton width="40%" height={14} borderRadius={8} style={{ marginTop: 8 }} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : filteredUsers.length === 0 ? (
                            <View style={styles.emptyState}>
                                <UserPlus size={48} color="#cbd5e1" strokeWidth={1.5} />
                                <Text style={styles.emptyStateText}>
                                    {searchQuery ? 'No users found' : 'No users available'}
                                </Text>
                                <Text style={styles.emptyStateSubtext}>
                                    {searchQuery
                                        ? 'Try a different search term'
                                        : 'All users are already members of this channel'}
                                </Text>
                            </View>
                        ) : (
                            filteredUsers.map((user) => {
                                const isSelected = selectedUserIds.includes(user.id);
                                return (
                                    <TouchableOpacity
                                        key={user.id}
                                        style={[
                                            styles.userItem,
                                            isSelected && styles.userItemSelected,
                                        ]}
                                        onPress={() => toggleUserSelection(user.id)}
                                        disabled={adding}
                                    >
                                        <View style={styles.avatarWrapper}>
                                            <Avatar user={user} size="medium" />
                                        </View>
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userName}>{getUserName(user)}</Text>
                                            <Text style={styles.userEmail}>{user.email}</Text>
                                        </View>
                                        {isSelected && (
                                            <View style={styles.checkIcon}>
                                                <Check size={20} color="#667eea" strokeWidth={3} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </ScrollView>

                    {/* Footer */}
                    {selectedUserIds.length > 0 && (
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[styles.addButton, adding && styles.addButtonDisabled]}
                                onPress={handleAdd}
                                disabled={adding}
                            >
                                <UserPlus size={18} color="#ffffff" strokeWidth={2.5} />
                                <Text style={styles.addButtonText}>
                                    {adding
                                        ? 'Adding...'
                                        : `Add ${selectedUserIds.length} ${selectedUserIds.length === 1 ? 'Member' : 'Members'}`}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    usersList: {
        flex: 1,
    },
    usersListContent: {
        padding: 20,
        paddingTop: 12,
    },
    loadingContainer: {
        paddingVertical: 20,
    },
    skeletonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 16,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 8,
        textAlign: 'center',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#f3f4f6',
    },
    userItemSelected: {
        borderColor: '#667eea',
        backgroundColor: '#f0f4ff',
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
        color: '#111827',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#6b7280',
    },
    checkIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    footer: {
        padding: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        backgroundColor: '#667eea',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonDisabled: {
        opacity: 0.6,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: 0.3,
    },
});

