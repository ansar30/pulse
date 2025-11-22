import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/providers/theme-provider';
import { adminApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Building2, MessageSquare, TrendingUp, Plus, Edit2, Trash2, Search, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react-native';
import { Avatar } from '@/components/ui/avatar';
import { UserActionsMenu } from '@/components/ui/user-actions-menu';
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

export default function SuperAdminEmpire() {
    const insets = useSafeAreaInsets();
    const { user, isAuthenticated, initAuth, _hasHydrated } = useAuthStore();
    const { colors } = useTheme();
    const [analytics, setAnalytics] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'users'>('overview');

    const [createUserOpen, setCreateUserOpen] = useState(false);
    const [createTenantOpen, setCreateTenantOpen] = useState(false);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [editTenantOpen, setEditTenantOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedTenant, setSelectedTenant] = useState<any>(null);
    const [resettingPassword, setResettingPassword] = useState<string | null>(null);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'MEMBER',
        tenantId: '',
    });
    const [editUser, setEditUser] = useState({
        email: '',
        firstName: '',
        lastName: '',
        role: 'MEMBER',
        tenantId: '',
    });
    const [newTenant, setNewTenant] = useState({
        name: '',
        planId: 'free',
        status: 'ACTIVE',
    });
    const [editTenant, setEditTenant] = useState({
        name: '',
        planId: 'free',
        status: 'ACTIVE',
    });
    const [creatingUser, setCreatingUser] = useState(false);
    const [creatingTenant, setCreatingTenant] = useState(false);
    const [updatingUser, setUpdatingUser] = useState(false);
    const [updatingTenant, setUpdatingTenant] = useState(false);
    const [deletingUser, setDeletingUser] = useState<string | null>(null);
    const [deletingTenant, setDeletingTenant] = useState<string | null>(null);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (!_hasHydrated || !isAuthenticated || !user) return;
        if (user.role === 'SUPER_ADMIN') {
            loadData();
        }
    }, [isAuthenticated, user, _hasHydrated]);

    const loadData = async () => {
        if (!user || user.role !== 'SUPER_ADMIN') return;

        setLoading(true);
        setError('');
        try {
            const [analyticsRes, tenantsRes, usersRes] = await Promise.all([
                adminApi.getAnalytics().catch(err => {
                    console.error('Failed to load analytics:', err);
                    return { success: false, data: null };
                }),
                adminApi.getAllTenants().catch(err => {
                    console.error('Failed to load tenants:', err);
                    return { success: false, data: [] };
                }),
                adminApi.getAllUsers().catch(err => {
                    console.error('Failed to load users:', err);
                    return { success: false, data: [] };
                }),
            ]);

            if (analyticsRes.success) {
                setAnalytics(analyticsRes.data);
            }

            if (tenantsRes.success) {
                setTenants(tenantsRes.data || []);
            }

            if (usersRes.success) {
                setUsers(usersRes.data || []);
            }
        } catch (error: any) {
            console.error('Failed to load empire data:', error);
            setError(error.response?.data?.message || 'Failed to load empire data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName || !newUser.tenantId) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setCreatingUser(true);
        try {
            const result = await adminApi.createUser(newUser);
            if (result.success) {
                Alert.alert('Success', 'User created successfully');
                setCreateUserOpen(false);
                setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'MEMBER', tenantId: '' });
                loadData();
            } else {
                Alert.alert('Error', result.error || 'Failed to create user');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create user');
        } finally {
            setCreatingUser(false);
        }
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setEditUser({
            email: user.email,
            firstName: (user.profile as any)?.firstName || '',
            lastName: (user.profile as any)?.lastName || '',
            role: user.role,
            tenantId: user.tenantId,
        });
        setEditUserOpen(true);
    };

    const handleUpdateUser = async () => {
        if (!editUser.email || !editUser.firstName || !editUser.lastName || !editUser.tenantId) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setUpdatingUser(true);
        try {
            const result = await adminApi.updateUser(selectedUser.id, {
                email: editUser.email,
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
    };

    const handleEditTenant = (tenant: any) => {
        setSelectedTenant(tenant);
        setEditTenant({
            name: tenant.name,
            planId: tenant.planId || 'free',
            status: tenant.status || 'ACTIVE',
        });
        setEditTenantOpen(true);
    };

    const handleUpdateTenant = async () => {
        if (!editTenant.name) {
            Alert.alert('Error', 'Please enter a tenant name');
            return;
        }

        setUpdatingTenant(true);
        try {
            const result = await adminApi.updateTenant(selectedTenant.id, editTenant);
            if (result.success) {
                Alert.alert('Success', 'Organization updated successfully');
                setEditTenantOpen(false);
                setSelectedTenant(null);
                loadData();
            } else {
                Alert.alert('Error', result.error || 'Failed to update organization');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update organization');
        } finally {
            setUpdatingTenant(false);
        }
    };

    const handleCreateTenant = async () => {
        if (!newTenant.name) {
            Alert.alert('Error', 'Please enter a tenant name');
            return;
        }

        setCreatingTenant(true);
        try {
            const result = await adminApi.createTenant(newTenant);
            if (result.success) {
                Alert.alert('Success', 'Tenant created successfully');
                setCreateTenantOpen(false);
                setNewTenant({ name: '', planId: 'free', status: 'ACTIVE' });
                loadData();
            } else {
                Alert.alert('Error', result.error || 'Failed to create tenant');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create tenant');
        } finally {
            setCreatingTenant(false);
        }
    };

    const handleResetPassword = async (user: any) => {
        Alert.alert(
            'Reset Password',
            `Are you sure you want to reset the password for ${(user.profile as any)?.firstName || ''} ${(user.profile as any)?.lastName || ''} (${user.email})?\n\nThe password will be reset to: Password@123\n\nThey will need to change it on their next login.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset Password',
                    style: 'destructive',
                    onPress: async () => {
                        setResettingPassword(user.id);
                        try {
                            await adminApi.resetUserPassword(user.id, 'Password@123');
                            Alert.alert('Success', `Password has been reset to "Password@123" for ${(user.profile as any)?.firstName || ''} ${(user.profile as any)?.lastName || ''}.`);
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to reset password. Please try again.');
                        } finally {
                            setResettingPassword(null);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteUser = async (userId: string) => {
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
                            const result = await adminApi.deleteUser(userId);
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

    const handleDeleteTenant = async (tenantId: string) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this tenant? This will delete all associated data.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingTenant(tenantId);
                        try {
                            const result = await adminApi.deleteTenant(tenantId);
                            if (result.success) {
                                Alert.alert('Success', 'Tenant deleted successfully');
                                loadData();
                            } else {
                                Alert.alert('Error', result.error || 'Failed to delete tenant');
                            }
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete tenant');
                        } finally {
                            setDeletingTenant(null);
                        }
                    },
                },
            ]
        );
    };

    // Wait for hydration
    if (!_hasHydrated) {
        return null;
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    if (!user || user.role !== 'SUPER_ADMIN') {
        return <Redirect href="/(tabs)/dashboard" />;
    }

    const filteredTenants = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile as any)?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile as any)?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const statCards = [
        { title: 'Total Users', value: analytics?.totalUsers || 0, icon: Users, gradient: ['#3b82f6', '#2563eb'], bgColor: '#eff6ff' },
        { title: 'Total Tenants', value: analytics?.totalTenants || 0, icon: Building2, gradient: ['#8b5cf6', '#7c3aed'], bgColor: '#f5f3ff' },
        { title: 'Total Channels', value: analytics?.totalChannels || 0, icon: MessageSquare, gradient: ['#10b981', '#059669'], bgColor: '#ecfdf5' },
        { title: 'Total Messages', value: analytics?.totalMessages || 0, icon: TrendingUp, gradient: ['#f59e0b', '#d97706'], bgColor: '#fef3c7' },
    ];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'tenants', label: 'Organizations', icon: Building2 },
        { id: 'users', label: 'Users', icon: Users },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
            <StatusBar style={colors.isDark ? 'light' : 'dark'} />

            {/* Modern Header */}
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
                <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}>
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
                                Empire Control
                            </Text>
                            <Text style={{ fontSize: 15, color: colors.textSecondary, fontWeight: '500' }}>
                                Manage your entire ecosystem
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
                </View>

                {/* Modern Tab Navigation */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 8 }}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => setActiveTab(tab.id as any)}
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 14,
                                    borderBottomWidth: 3,
                                    borderBottomColor: isActive ? colors.primary : 'transparent',
                                    gap: 8
                                }}
                            >
                                <Icon size={18} color={isActive ? colors.primary : colors.textTertiary} strokeWidth={2.5} />
                                <Text style={{
                                    fontSize: 15,
                                    fontWeight: isActive ? '700' : '600',
                                    color: isActive ? colors.primary : colors.textTertiary
                                }}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <View>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 24 }}>
                            System Analytics
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                            {statCards.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <View key={index} style={{ flex: 1, minWidth: 160 }}>
                                        <View style={{
                                            backgroundColor: colors.surface,
                                            borderRadius: 12,
                                            padding: 20,
                                            shadowColor: colors.shadow,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 12,
                                            elevation: 5,
                                            borderWidth: 1,
                                            borderColor: colors.border
                                        }}>
                                            <View style={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: 12,
                                                backgroundColor: stat.bgColor,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: 16
                                            }}>
                                                <Icon size={28} color={stat.gradient[1]} strokeWidth={2.5} />
                                            </View>
                                            <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3 }}>
                                                {stat.title}
                                            </Text>
                                            <Text style={{ fontSize: 36, fontWeight: '700', color: colors.text, letterSpacing: -0.5 }}>
                                                {stat.value.toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Tenants Tab */}
                {activeTab === 'tenants' && (
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                                Organizations
                            </Text>
                            <Dialog open={createTenantOpen} onOpenChange={setCreateTenantOpen}>
                                <DialogTrigger asChild>
                                    <TouchableOpacity style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.primary,
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        gap: 6
                                    }}>
                                        <Plus size={18} color={colors.surface} strokeWidth={2.5} />
                                        <Text style={{ color: colors.surface, fontSize: 15, fontWeight: '600' }}>New</Text>
                                    </TouchableOpacity>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create Organization</DialogTitle>
                                        <DialogDescription>Add a new organization to the system</DialogDescription>
                                    </DialogHeader>
                                    <View style={{ gap: 16, marginTop: 16 }}>
                                        <View>
                                            <Label>Name *</Label>
                                            <Input
                                                placeholder="Organization name"
                                                value={newTenant.name}
                                                onChangeText={(text) => setNewTenant({ ...newTenant, name: text })}
                                            />
                                        </View>
                                        <LoadingButton
                                            onPress={handleCreateTenant}
                                            loading={creatingTenant}
                                        >
                                            <Text style={{ color: colors.surface, fontSize: 15, fontWeight: '600' }}>Create Organization</Text>
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
                                placeholder="Search organizations..."
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                                style={{ flex: 1, marginLeft: 10, fontSize: 15, padding: 0, borderWidth: 0 }}
                            />
                        </View>

                        {/* Tenants List */}
                        <View style={{
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            shadowColor: colors.shadow,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 8,
                            elevation: 4,
                            borderWidth: 1,
                            borderColor: colors.borderLight,
                            overflow: 'hidden'
                        }}>
                            {loading ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <LoadingSpinner size="md" />
                                </View>
                            ) : filteredTenants.length === 0 ? (
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
                                        <Building2 size={32} color={colors.textTertiary} />
                                    </View>
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>
                                        No organizations found
                                    </Text>
                                </View>
                            ) : (
                                filteredTenants.map((tenant, index) => (
                                    <View
                                        key={tenant.id}
                                        style={{
                                            padding: 20,
                                            borderBottomWidth: index < filteredTenants.length - 1 ? 1 : 0,
                                            borderBottomColor: colors.borderLight
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                                <View style={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 12,
                                                    backgroundColor: colors.primary + '15',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 14
                                                }}>
                                                    <Building2 size={24} color={colors.primary} strokeWidth={2.5} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 6 }}>
                                                        {tenant.name}
                                                    </Text>
                                                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 8 }}>
                                                        {tenant._count?.users || 0} users • {tenant._count?.projects || 0} projects
                                                    </Text>
                                                    <View style={{
                                                        alignSelf: 'flex-start',
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 4,
                                                        borderRadius: 6,
                                                        backgroundColor: tenant.status === 'ACTIVE' ? colors.success + '20' : colors.surfaceElevated
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 11,
                                                            fontWeight: '700',
                                                            color: tenant.status === 'ACTIVE' ? colors.success : colors.textSecondary,
                                                            letterSpacing: 0.5
                                                        }}>
                                                            {tenant.status}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <TouchableOpacity
                                                    onPress={() => handleEditTenant(tenant)}
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
                                                    onPress={() => handleDeleteTenant(tenant.id)}
                                                    disabled={deletingTenant === tenant.id}
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

                        {/* Edit Tenant Dialog */}
                        <Dialog open={editTenantOpen} onOpenChange={setEditTenantOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Organization</DialogTitle>
                                    <DialogDescription>Update organization details</DialogDescription>
                                </DialogHeader>
                                <View style={{ gap: 16, marginTop: 16 }}>
                                    <View>
                                        <Label>Name *</Label>
                                        <Input
                                            placeholder="Organization name"
                                            value={editTenant.name}
                                            onChangeText={(text) => setEditTenant({ ...editTenant, name: text })}
                                        />
                                    </View>
                                    <View>
                                        <Label>Status</Label>
                                        <Select
                                            value={editTenant.status}
                                            onValueChange={(value) => setEditTenant({ ...editTenant, status: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </View>
                                    <LoadingButton
                                        onPress={handleUpdateTenant}
                                        loading={updatingTenant}
                                    >
                                        <Text style={{ color: colors.surface, fontSize: 15, fontWeight: '600' }}>Update Organization</Text>
                                    </LoadingButton>
                                </View>
                            </DialogContent>
                        </Dialog>
                    </View>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                                All Users
                            </Text>
                            <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                                <DialogTrigger asChild>
                                    <TouchableOpacity style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.primary,
                                        paddingHorizontal: 16,
                                        paddingVertical: 10,
                                        borderRadius: 10,
                                        gap: 6
                                    }}>
                                        <Plus size={18} color={colors.surface} strokeWidth={2.5} />
                                        <Text style={{ color: colors.surface, fontSize: 15, fontWeight: '600' }}>New</Text>
                                    </TouchableOpacity>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create User</DialogTitle>
                                        <DialogDescription>Add a new user to the system</DialogDescription>
                                    </DialogHeader>
                                    <View style={{ gap: 14, marginTop: 16 }}>
                                        <View style={{ flexDirection: 'row', gap: 12 }}>
                                            <View style={{ flex: 1 }}>
                                                <Label>First Name</Label>
                                                <Input
                                                    value={newUser.firstName}
                                                    onChangeText={(text) => setNewUser({ ...newUser, firstName: text })}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Label>Last Name</Label>
                                                <Input
                                                    value={newUser.lastName}
                                                    onChangeText={(text) => setNewUser({ ...newUser, lastName: text })}
                                                />
                                            </View>
                                        </View>
                                        <View>
                                            <Label>Email</Label>
                                            <Input
                                                value={newUser.email}
                                                onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                                                keyboardType="email-address"
                                            />
                                        </View>
                                        <View>
                                            <Label>Password</Label>
                                            <Input
                                                value={newUser.password}
                                                onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                                                secureTextEntry
                                            />
                                        </View>
                                        <View>
                                            <Label>Organization *</Label>
                                            <Select
                                                value={newUser.tenantId}
                                                onValueChange={(value) => setNewUser({ ...newUser, tenantId: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select organization" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tenants.map((tenant) => (
                                                        <SelectItem key={tenant.id} value={tenant.id}>
                                                            {tenant.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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
                                                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
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
                            paddingTop: 8,
                        }}>
                            {loading ? (
                                <View style={{ padding: 40, alignItems: 'center' }}>
                                    <LoadingSpinner size="md" />
                                </View>
                            ) : filteredUsers.length === 0 ? (
                                <View style={{ padding: 60, alignItems: 'center' }}>
                                    <View style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 32,
                                        backgroundColor: colors.surfaceElevated,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 16
                                    }}>
                                        <Users size={32} color={colors.textTertiary} />
                                    </View>
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>
                                        No users found
                                    </Text>
                                    <Text style={{ fontSize: 14, color: colors.textTertiary, textAlign: 'center' }}>
                                        Try adjusting your search terms
                                    </Text>
                                </View>
                            ) : (
                                filteredUsers.map((usr, index) => (
                                    <View
                                        key={usr.id}
                                        style={{
                                            marginHorizontal: 20,
                                            marginBottom: 16,
                                            padding: 20,
                                            backgroundColor: colors.surface,
                                            borderRadius: 16,
                                            borderWidth: 1,
                                            borderColor: colors.borderLight,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 8,
                                            elevation: 2,
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                                            {/* Avatar */}
                                            <View style={{ flexShrink: 0 }}>
                                                <Avatar 
                                                    user={{
                                                        id: usr.id,
                                                        profile: usr.profile
                                                    }}
                                                    size="large"
                                                />
                                            </View>

                                            {/* User Info */}
                                            <View style={{ flex: 1, gap: 8 }}>
                                                <View style={{ gap: 4 }}>
                                                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                                                        {((usr.profile as any)?.firstName || '')} {((usr.profile as any)?.lastName || '')}
                                                    </Text>
                                                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                                                        {usr.email}
                                                    </Text>
                                                    {usr.tenant && (
                                                        <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                                                            {(usr.tenant as any)?.name || 'No organization'}
                                                        </Text>
                                                    )}
                                                </View>

                                                {/* Role Badge */}
                                                <View style={{
                                                    alignSelf: 'flex-start',
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 6,
                                                    borderRadius: 8,
                                                    backgroundColor: usr.role === 'SUPER_ADMIN' ? colors.warning + '20' : usr.role === 'ADMIN' ? colors.secondary + '20' : colors.surfaceElevated
                                                }}>
                                                    <Text style={{
                                                        fontSize: 12,
                                                        fontWeight: '700',
                                                        color: usr.role === 'SUPER_ADMIN' ? colors.warning : usr.role === 'ADMIN' ? colors.secondary : colors.textSecondary,
                                                        letterSpacing: 0.5
                                                    }}>
                                                        {usr.role}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Action Menu */}
                                            <View style={{ flexShrink: 0 }}>
                                                <UserActionsMenu
                                                    onEdit={() => handleEditUser(usr)}
                                                    onResetPassword={() => handleResetPassword(usr)}
                                                    onDelete={() => handleDeleteUser(usr.id)}
                                                    resettingPassword={resettingPassword === usr.id}
                                                    deleting={deletingUser === usr.id}
                                                />
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
                                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
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
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
