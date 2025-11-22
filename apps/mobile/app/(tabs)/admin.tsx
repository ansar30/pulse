import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/providers/theme-provider';
import { adminApi, usersApi } from '@/lib/api-client';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, RefreshCw, Plus, Edit2, Trash2, Search, ArrowLeft } from 'lucide-react-native';
import { Avatar } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function AdminDashboard() {
    const insets = useSafeAreaInsets();
    const { user, isAuthenticated, initAuth, _hasHydrated } = useAuthStore();
    const { colors, isDark } = useTheme();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [createUserOpen, setCreateUserOpen] = useState(false);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'MEMBER',
    });
    const [editUser, setEditUser] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: 'MEMBER',
    });
    const [creatingUser, setCreatingUser] = useState(false);
    const [updatingUser, setUpdatingUser] = useState(false);
    const [deletingUser, setDeletingUser] = useState<string | null>(null);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (!_hasHydrated || !isAuthenticated || !user) return;
        if ((user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && user.tenantId) {
            loadData();
        }
    }, [isAuthenticated, user, _hasHydrated]);

    const loadData = async () => {
        if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') || !user.tenantId) return;

        setLoading(true);
        setError('');
        try {
            const usersRes = await usersApi.getAll(user.tenantId);
            if (usersRes.success) {
                setUsers(usersRes.data || []);
            } else {
                setError('Failed to load users');
            }
        } catch (error: any) {
            console.error('Failed to load admin data:', error);
            setError(error.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Wait for hydration
    if (!_hasHydrated) {
        return null;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    if (!user) {
        return null;
    }

    // Allow both ADMIN and SUPER_ADMIN to access
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        return <Redirect href="/(tabs)/chat" />;
    }

    const handleCreateUser = () => {
        (async () => {
            if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            if (!user.tenantId) {
                Alert.alert('Error', 'No tenant associated with your account');
                return;
            }

            setCreatingUser(true);
            try {
                const result = await adminApi.createUser({
                    ...newUser,
                    tenantId: user.tenantId, // Always use admin's tenant
                });
                if (result.success) {
                    Alert.alert('Success', 'User created successfully');
                    setCreateUserOpen(false);
                    setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'MEMBER' });
                    loadData();
                } else {
                    Alert.alert('Error', result.error || 'Failed to create user');
                }
            } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'Failed to create user');
            } finally {
                setCreatingUser(false);
            }
        })();
    };

    const handleEditUser = (userItem: any) => {
        setSelectedUser(userItem);
        setEditUser({
            email: userItem.email,
            firstName: (userItem.profile as any)?.firstName || '',
            lastName: (userItem.profile as any)?.lastName || '',
            role: userItem.role,
        });
        setEditUserOpen(true);
    };

    const handleUpdateUser = () => {
        (async () => {
            if (!editUser.email || !editUser.firstName || !editUser.lastName) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            if (!user.tenantId || !selectedUser) {
                Alert.alert('Error', 'Invalid user or tenant');
                return;
            }

            setUpdatingUser(true);
            try {
                const result = await usersApi.update(user.tenantId, selectedUser.id, {
                    profile: {
                        firstName: editUser.firstName,
                        lastName: editUser.lastName,
                    },
                    role: editUser.role,
                });
                if (result.success) {
                    Alert.alert('Success', 'User updated successfully');
                    setEditUserOpen(false);
                    setSelectedUser(null);
                    loadData();
                } else {
                    Alert.alert('Error', result.error || 'Failed to update user');
                }
            } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'Failed to update user');
            } finally {
                setUpdatingUser(false);
            }
        })();
    };

    const handleDeleteUser = async (userId: string) => {
        if (!user.tenantId) {
            Alert.alert('Error', 'No tenant associated with your account');
            return;
        }

        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingUser(userId);
                        try {
                            const result = await usersApi.delete(user.tenantId, userId);
                            if (result.success) {
                                Alert.alert('Success', 'User deleted successfully');
                                loadData();
                            } else {
                                Alert.alert('Error', result.error || 'Failed to delete user');
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete user');
                        } finally {
                            setDeletingUser(null);
                        }
                    },
                },
            ]
        );
    };

    const filteredUsers = users.filter(userItem =>
        userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (userItem.profile as any)?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (userItem.profile as any)?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View style={{
                backgroundColor: colors.surface,
                paddingTop: insets.top,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 3
            }}>
                <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/settings')}
                            style={{
                                width: 40,
                                height: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                            }}
                        >
                            <ArrowLeft size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 6 }}>
                                User Management
                            </Text>
                            <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: '500' }}>
                                Manage users in your organization
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <TouchableOpacity
                            onPress={loadData}
                            disabled={loading}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                backgroundColor: colors.surfaceElevated,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <RefreshCw size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    {error && (
                        <View style={{
                            marginTop: 12,
                            padding: 12,
                            backgroundColor: colors.error + '15',
                            borderLeftWidth: 3,
                            borderLeftColor: colors.error,
                            borderRadius: 8
                        }}>
                            <Text style={{ fontSize: 14, color: colors.error, fontWeight: '500' }}>{error}</Text>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* User Management Section */}
                <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                            Users
                        </Text>
                        <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                            <DialogTrigger asChild>
                                <TouchableOpacity style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: colors.primary,
                                    paddingHorizontal: 16,
                                    paddingVertical: 10,
                                    borderRadius: 8,
                                    gap: 6
                                }}>
                                    <Plus size={18} color={colors.surface} strokeWidth={2.5} />
                                    <Text style={{ color: colors.surface, fontSize: 15, fontWeight: '600' }}>New User</Text>
                                </TouchableOpacity>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create User</DialogTitle>
                                    <DialogDescription>Add a new user to your organization</DialogDescription>
                                </DialogHeader>
                                <View style={{ gap: 14, marginTop: 16 }}>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <View style={{ flex: 1 }}>
                                            <Label>First Name *</Label>
                                            <Input
                                                value={newUser.firstName}
                                                onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
                                                placeholder="First name"
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Label>Last Name *</Label>
                                            <Input
                                                value={newUser.lastName}
                                                onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
                                                placeholder="Last name"
                                            />
                                        </View>
                                    </View>
                                    <View>
                                        <Label>Email *</Label>
                                        <Input
                                            value={newUser.email}
                                            onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                                            keyboardType="email-address"
                                            placeholder="email@example.com"
                                        />
                                    </View>
                                    <View>
                                        <Label>Password *</Label>
                                        <Input
                                            value={newUser.password}
                                            onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                                            secureTextEntry
                                            placeholder="Password"
                                        />
                                    </View>
                                    <View>
                                        <Label>Role</Label>
                                        <Select
                                            value={newUser.role}
                                            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MEMBER">Member</SelectItem>
                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </View>
                                    <LoadingButton
                                        onPress={handleCreateUser}
                                        loading={creatingUser}
                                    >
                                        <Text style={{ color: colors.surface, fontSize: 15, fontWeight: '600' }}>Create User</Text>
                                    </LoadingButton>
                                </View>
                            </DialogContent>
                        </Dialog>
                    </View>

                    {/* Search */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: colors.border
                    }}>
                        <Search size={20} color={colors.textTertiary} />
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            style={{ flex: 1, marginLeft: 10, fontSize: 15, padding: 0, borderWidth: 0 }}
                        />
                    </View>

                    {/* Users List */}
                    <View style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        shadowColor: colors.shadow,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 5,
                        borderWidth: 1,
                        borderColor: colors.border,
                        overflow: 'hidden'
                    }}>
                        {loading ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <LoadingSpinner size="md" />
                            </View>
                        ) : filteredUsers.length === 0 ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <View style={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 32,
                                    backgroundColor: colors.surfaceElevated,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 12
                                }}>
                                    <Users size={32} color={colors.textTertiary} />
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>
                                    No users found
                                </Text>
                            </View>
                        ) : (
                            filteredUsers.map((usr, index) => (
                                <View
                                    key={usr.id}
                                    style={{
                                        padding: 20,
                                        borderBottomWidth: index < filteredUsers.length - 1 ? 1 : 0,
                                        borderBottomColor: colors.borderLight
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ marginRight: 14 }}>
                                                <Avatar 
                                                    user={{
                                                        id: usr.id,
                                                        profile: usr.profile
                                                    }}
                                                    size="medium"
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                                                    {((usr.profile as any)?.firstName || '')} {((usr.profile as any)?.lastName || '')}
                                                </Text>
                                                <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 6 }}>
                                                    {usr.email}
                                                </Text>
                                                <View style={{
                                                    alignSelf: 'flex-start',
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                    borderRadius: 6,
                                                    backgroundColor: usr.role === 'ADMIN' ? colors.secondary + '20' : colors.surfaceElevated
                                                }}>
                                                    <Text style={{
                                                        fontSize: 11,
                                                        fontWeight: '700',
                                                        color: usr.role === 'ADMIN' ? colors.secondary : colors.textSecondary,
                                                        letterSpacing: 0.5
                                                    }}>
                                                        {usr.role}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                            <TouchableOpacity
                                                onPress={() => handleEditUser(usr)}
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 8,
                                                    backgroundColor: colors.primary + '15',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Edit2 size={16} color={colors.primary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteUser(usr.id)}
                                                disabled={deletingUser === usr.id}
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 8,
                                                    backgroundColor: colors.error + '15',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Trash2 size={16} color={colors.error} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    {/* Edit User Dialog */}
                    <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>Update user information</DialogDescription>
                            </DialogHeader>
                            <View style={{ gap: 14, marginTop: 16 }}>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1 }}>
                                        <Label>First Name *</Label>
                                        <Input
                                            value={editUser.firstName}
                                            onChangeText={(text) => setEditUser({ ...editUser, firstName: text })}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Label>Last Name *</Label>
                                        <Input
                                            value={editUser.lastName}
                                            onChangeText={(text) => setEditUser({ ...editUser, lastName: text })}
                                        />
                                    </View>
                                </View>
                                <View>
                                    <Label>Email *</Label>
                                    <Input
                                        value={editUser.email}
                                        onChangeText={(text) => setEditUser({ ...editUser, email: text })}
                                        keyboardType="email-address"
                                    />
                                </View>
                                <View>
                                    <Label>Role</Label>
                                    <Select
                                        value={editUser.role}
                                        onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MEMBER">Member</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </View>
                                <LoadingButton
                                    onPress={handleUpdateUser}
                                    loading={updatingUser}
                                >
                                    <Text style={{ color: colors.surface, fontSize: 15, fontWeight: '600' }}>Update User</Text>
                                </LoadingButton>
                            </View>
                        </DialogContent>
                    </Dialog>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
