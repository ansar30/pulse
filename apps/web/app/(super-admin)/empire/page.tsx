'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { 
    Users, Building2, MessageSquare, TrendingUp, 
    Plus, Edit2, Trash2, Search, RefreshCw, 
    Activity, Zap, Shield, Crown, BarChart3,
    UserPlus, Building, AlertCircle, ArrowLeft
} from 'lucide-react';
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
    const router = useRouter();
    const { user, isAuthenticated, initAuth } = useAuthStore();
    const [analytics, setAnalytics] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'users'>('overview');
    
    // Dialog states
    const [createUserOpen, setCreateUserOpen] = useState(false);
    const [createTenantOpen, setCreateTenantOpen] = useState(false);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [editTenantOpen, setEditTenantOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedTenant, setSelectedTenant] = useState<any>(null);
    const [creatingUser, setCreatingUser] = useState(false);
    const [creatingTenant, setCreatingTenant] = useState(false);
    const [updatingUser, setUpdatingUser] = useState(false);
    const [updatingTenant, setUpdatingTenant] = useState(false);
    const [deletingUser, setDeletingUser] = useState<string | null>(null);
    const [deletingTenant, setDeletingTenant] = useState<string | null>(null);
    
    // Form states
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
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

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (user?.role !== 'SUPER_ADMIN') {
            router.push('/dashboard');
            return;
        }

        loadData();
    }, [isAuthenticated, user, router]);

    const loadData = async () => {
        if (!user || user.role !== 'SUPER_ADMIN') return;
        
        setLoading(true);
        setError('');
        try {
            console.log('Loading super admin data...');
            const [analyticsRes, tenantsRes, usersRes] = await Promise.all([
                adminApi.getAnalytics().catch(err => {
                    console.error('Failed to load analytics:', err);
                    console.error('Error details:', err.response?.data || err.message);
                    return { success: false, data: null };
                }),
                adminApi.getAllTenants().catch(err => {
                    console.error('Failed to load tenants:', err);
                    console.error('Error details:', err.response?.data || err.message);
                    return { success: false, data: [] };
                }),
                adminApi.getAllUsers().catch(err => {
                    console.error('Failed to load users:', err);
                    console.error('Error details:', err.response?.data || err.message);
                    return { success: false, data: [] };
                }),
            ]);

            console.log('API Responses:', { analyticsRes, tenantsRes, usersRes });

            if (analyticsRes && analyticsRes.success) {
                setAnalytics(analyticsRes.data);
            } else if (analyticsRes && !analyticsRes.success) {
                console.warn('Analytics failed:', analyticsRes);
            }
            
            if (tenantsRes && tenantsRes.success) {
                setTenants(tenantsRes.data || []);
            } else if (tenantsRes && !tenantsRes.success) {
                console.warn('Tenants failed:', tenantsRes);
            }
            
            if (usersRes && usersRes.success) {
                setUsers(usersRes.data || []);
            } else if (usersRes && !usersRes.success) {
                console.warn('Users failed:', usersRes);
            }
        } catch (error: any) {
            console.error('Failed to load data:', error);
            console.error('Error response:', error.response);
            setError(error.response?.data?.message || error.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName || !newUser.tenantId) {
            setError('Please fill all required fields');
            return;
        }

        setCreatingUser(true);
        try {
            const response = await adminApi.createUser(newUser);
            console.log('Create user response:', response);
            if (response && response.success) {
                setCreateUserOpen(false);
                setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'MEMBER', tenantId: '' });
                loadData();
            } else {
                setError(response?.message || 'Failed to create user');
            }
        } catch (error: any) {
            console.error('Create user error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create user');
        } finally {
            setCreatingUser(false);
        }
    };

    const handleCreateTenant = async () => {
        if (!newTenant.name) {
            setError('Tenant name is required');
            return;
        }

        setCreatingTenant(true);
        try {
            const response = await adminApi.createTenant(newTenant);
            console.log('Create tenant response:', response);
            if (response && response.success) {
                setCreateTenantOpen(false);
                setNewTenant({ name: '', planId: 'free', status: 'ACTIVE' });
                loadData();
            } else {
                setError(response?.message || 'Failed to create tenant');
            }
        } catch (error: any) {
            console.error('Create tenant error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to create tenant');
        } finally {
            setCreatingTenant(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setDeletingUser(userId);
        try {
            const response = await adminApi.deleteUser(userId);
            if (response.success) {
                loadData();
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeletingUser(null);
        }
    };

    const handleDeleteTenant = async (tenantId: string) => {
        if (!confirm('Are you sure you want to delete this tenant? This will delete all associated data. This action cannot be undone.')) return;

        setDeletingTenant(tenantId);
        try {
            const response = await adminApi.deleteTenant(tenantId);
            if (response.success) {
                loadData();
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to delete tenant');
        } finally {
            setDeletingTenant(null);
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        setUpdatingUser(true);
        try {
            const response = await adminApi.updateUser(selectedUser.id, {
                email: selectedUser.email,
                profile: {
                    firstName: selectedUser.profile?.firstName,
                    lastName: selectedUser.profile?.lastName,
                },
                role: selectedUser.role,
            });
            if (response.success) {
                setEditUserOpen(false);
                setSelectedUser(null);
                loadData();
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update user');
        } finally {
            setUpdatingUser(false);
        }
    };

    const handleUpdateTenant = async () => {
        if (!selectedTenant) return;

        setUpdatingTenant(true);
        try {
            const response = await adminApi.updateTenant(selectedTenant.id, {
                name: selectedTenant.name,
                status: selectedTenant.status,
                planId: selectedTenant.planId,
            });
            if (response.success) {
                setEditTenantOpen(false);
                setSelectedTenant(null);
                loadData();
            }
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update tenant');
        } finally {
            setUpdatingTenant(false);
        }
    };

    const filteredTenants = (tenants || []).filter(t => 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = (users || []).filter(u => 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <LoadingSpinner size="lg" text="Loading..." />
            </div>
        );
    }

    if (user.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                    <Crown className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Access Denied. Super Admin only.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/admin')}
                                className="flex-shrink-0"
                                title="Back to Admin"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    Super Admin Dashboard
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">System-wide administration and management</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/admin')}
                                className="w-full sm:w-auto"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Admin Panel
                            </Button>
                            <Button
                                variant="outline"
                                onClick={loadData}
                                disabled={loading}
                                className="w-full sm:w-auto"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </Button>
                        </div>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'overview'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4 inline mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('tenants')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'tenants'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Tenants ({tenants?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === 'users'
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Users className="w-4 h-4 inline mr-2" />
                        Users ({users?.length || 0})
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        {/* Analytics Cards */}
                        {loading && !analytics ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <Card key={i} className="border shadow-sm">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                                            <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : analytics ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                                <Card className="border hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Total Users
                                        </CardTitle>
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{analytics.totalUsers || 0}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Across all tenants</p>
                                    </CardContent>
                                </Card>

                                <Card className="border hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Total Tenants
                                        </CardTitle>
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{analytics.totalTenants || 0}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Active organizations</p>
                                    </CardContent>
                                </Card>

                                <Card className="border hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Total Channels
                                        </CardTitle>
                                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{analytics.totalChannels || 0}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Communication channels</p>
                                    </CardContent>
                                </Card>

                                <Card className="border hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            Total Messages
                                        </CardTitle>
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-foreground">{analytics.totalMessages || 0}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Messages sent</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : null}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <Card className="border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Activity className="w-4 h-4 text-muted-foreground" />
                                        System Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-muted-foreground">Active Tenants</span>
                                            <span className="font-semibold text-foreground">{(tenants || []).filter(t => t.status === 'ACTIVE').length}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-muted-foreground">Total Projects</span>
                                            <span className="font-semibold text-foreground">{(tenants || []).reduce((acc, t) => acc + (t._count?.projects || 0), 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-sm text-muted-foreground">Super Admins</span>
                                            <span className="font-semibold text-foreground">{(users || []).filter(u => u.role === 'SUPER_ADMIN').length}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Zap className="w-4 h-4 text-muted-foreground" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <Dialog open={createTenantOpen} onOpenChange={setCreateTenantOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full justify-start" variant="outline">
                                                    <Building2 className="w-4 h-4 mr-2" />
                                                    Create New Tenant
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create New Tenant</DialogTitle>
                                                    <DialogDescription>Create a new organization/tenant</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium">Tenant Name</label>
                                                        <Input
                                                            value={newTenant.name}
                                                            onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                                                            placeholder="Acme Inc"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Plan</label>
                                                        <Select value={newTenant.planId || 'free'} onValueChange={(value) => setNewTenant({ ...newTenant, planId: value })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select plan" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="free">Free</SelectItem>
                                                                <SelectItem value="pro">Pro</SelectItem>
                                                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Status</label>
                                                        <Select value={newTenant.status || 'ACTIVE'} onValueChange={(value) => setNewTenant({ ...newTenant, status: value })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                                                <SelectItem value="TRIAL">Trial</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <LoadingButton 
                                                        onClick={handleCreateTenant} 
                                                        className="w-full"
                                                        loading={creatingTenant}
                                                        loadingText="Creating..."
                                                    >
                                                        Create Tenant
                                                    </LoadingButton>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full justify-start" variant="outline">
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Create New User
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create New User</DialogTitle>
                                                    <DialogDescription>Create a new user account</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium">Email</label>
                                                        <Input
                                                            type="email"
                                                            value={newUser.email}
                                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                            placeholder="user@example.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Password</label>
                                                        <Input
                                                            type="password"
                                                            value={newUser.password}
                                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                            placeholder="••••••••"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-sm font-medium">First Name</label>
                                                            <Input
                                                                value={newUser.firstName}
                                                                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                                                placeholder="John"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-sm font-medium">Last Name</label>
                                                            <Input
                                                                value={newUser.lastName}
                                                                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                                                placeholder="Doe"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Role</label>
                                                        <Select value={newUser.role || 'MEMBER'} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select role" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="MEMBER">Member</SelectItem>
                                                                <SelectItem value="ADMIN">Admin</SelectItem>
                                                                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Tenant</label>
                                                        <Select 
                                                            value={newUser.tenantId || ''} 
                                                            onValueChange={(value) => setNewUser({ ...newUser, tenantId: value })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select tenant" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {tenants && tenants.length > 0 ? (
                                                                    tenants.map((tenant) => (
                                                                        <SelectItem key={tenant.id} value={tenant.id}>
                                                                            {tenant.name || 'Unnamed Tenant'}
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <SelectItem value="" disabled>No tenants available</SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <LoadingButton 
                                                        onClick={handleCreateUser} 
                                                        className="w-full"
                                                        loading={creatingUser}
                                                        loadingText="Creating..."
                                                    >
                                                        Create User
                                                    </LoadingButton>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}

                {/* Tenants Tab */}
                {activeTab === 'tenants' && (
                    <Card className="border">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg">All Tenants</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Manage all organizations in the system</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 sm:flex-initial">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search tenants..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 w-full sm:w-64"
                                        />
                                    </div>
                                    <Dialog open={createTenantOpen} onOpenChange={setCreateTenantOpen}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                New Tenant
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create New Tenant</DialogTitle>
                                                <DialogDescription>Create a new organization/tenant</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium">Tenant Name</label>
                                                    <Input
                                                        value={newTenant.name}
                                                        onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                                                        placeholder="Acme Inc"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Plan</label>
                                                    <Select value={newTenant.planId || 'free'} onValueChange={(value) => setNewTenant({ ...newTenant, planId: value })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select plan" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="free">Free</SelectItem>
                                                            <SelectItem value="pro">Pro</SelectItem>
                                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Status</label>
                                                    <Select value={newTenant.status || 'ACTIVE'} onValueChange={(value) => setNewTenant({ ...newTenant, status: value })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                                            <SelectItem value="TRIAL">Trial</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button onClick={handleCreateTenant} className="w-full">Create Tenant</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <LoadingSpinner size="md" text="Loading tenants..." />
                                </div>
                            ) : filteredTenants.length === 0 ? (
                                <div className="text-center py-12">
                                    <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground font-medium">No tenants found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredTenants.map((tenant) => (
                                        <div
                                            key={tenant.id}
                                            className="group flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all bg-card"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold">
                                                        {tenant.name?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-base">{tenant.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {tenant._count?.users || 0} users • {tenant._count?.projects || 0} projects • {tenant._count?.channels || 0} channels
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    tenant.status === 'ACTIVE' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                        : tenant.status === 'SUSPENDED'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                    {tenant.status}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedTenant(tenant);
                                                        setEditTenantOpen(true);
                                                    }}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <LoadingButton
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteTenant(tenant.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                    loading={deletingTenant === tenant.id}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </LoadingButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <Card className="border">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-lg">All Users</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Manage all users across all tenants</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1 sm:flex-initial">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 w-full sm:w-64"
                                        />
                                    </div>
                                    <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                New User
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle>Create New User</DialogTitle>
                                                <DialogDescription>Create a new user account</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium">Email</label>
                                                    <Input
                                                        type="email"
                                                        value={newUser.email}
                                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                        placeholder="user@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Password</label>
                                                    <Input
                                                        type="password"
                                                        value={newUser.password}
                                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm font-medium">First Name</label>
                                                        <Input
                                                            value={newUser.firstName}
                                                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                                            placeholder="John"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium">Last Name</label>
                                                        <Input
                                                            value={newUser.lastName}
                                                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                                            placeholder="Doe"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Role</label>
                                                    <Select value={newUser.role || 'MEMBER'} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="MEMBER">Member</SelectItem>
                                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium">Tenant</label>
                                                    <Select 
                                                        value={newUser.tenantId || ''} 
                                                        onValueChange={(value) => setNewUser({ ...newUser, tenantId: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select tenant" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {tenants && tenants.length > 0 ? (
                                                                tenants.map((tenant) => (
                                                                    <SelectItem key={tenant.id} value={tenant.id}>
                                                                        {tenant.name || 'Unnamed Tenant'}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="" disabled>No tenants available</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button onClick={handleCreateUser} className="w-full">Create User</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <LoadingSpinner size="md" text="Loading users..." />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground font-medium">No users found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                {filteredUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className="group flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all bg-card"
                                    >
                                        <div className="flex items-center space-x-4 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
                                                {u.profile?.firstName?.[0]}{u.profile?.lastName?.[0]}
                                            </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-base">
                                                        {u.profile?.firstName} {u.profile?.lastName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground truncate">
                                                        {u.email} • {u.tenant?.name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    u.role === 'SUPER_ADMIN' 
                                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                                                        : u.role === 'ADMIN'
                                                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                    {u.role.replace('_', ' ')}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedUser(u);
                                                        setEditUserOpen(true);
                                                    }}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <LoadingButton
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                    loading={deletingUser === u.id}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </LoadingButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Edit User Dialog */}
                <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                            <DialogDescription>Update user information</DialogDescription>
                        </DialogHeader>
                        {selectedUser && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={selectedUser.email}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">First Name</label>
                                        <Input
                                            value={selectedUser.profile?.firstName || ''}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                profile: { ...selectedUser.profile, firstName: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Last Name</label>
                                        <Input
                                            value={selectedUser.profile?.lastName || ''}
                                            onChange={(e) => setSelectedUser({
                                                ...selectedUser,
                                                profile: { ...selectedUser.profile, lastName: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Role</label>
                                    <Select 
                                        value={selectedUser.role || 'MEMBER'} 
                                        onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MEMBER">Member</SelectItem>
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <LoadingButton 
                                    onClick={handleUpdateUser} 
                                    className="w-full"
                                    loading={updatingUser}
                                    loadingText="Updating..."
                                >
                                    Update User
                                </LoadingButton>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Edit Tenant Dialog */}
                <Dialog open={editTenantOpen} onOpenChange={setEditTenantOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Tenant</DialogTitle>
                            <DialogDescription>Update tenant information</DialogDescription>
                        </DialogHeader>
                        {selectedTenant && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Tenant Name</label>
                                    <Input
                                        value={selectedTenant.name}
                                        onChange={(e) => setSelectedTenant({ ...selectedTenant, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Plan</label>
                                    <Select 
                                        value={selectedTenant.planId || 'free'} 
                                        onValueChange={(value) => setSelectedTenant({ ...selectedTenant, planId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="pro">Pro</SelectItem>
                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select 
                                        value={selectedTenant.status || 'ACTIVE'} 
                                        onValueChange={(value) => setSelectedTenant({ ...selectedTenant, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                            <SelectItem value="TRIAL">Trial</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <LoadingButton 
                                    onClick={handleUpdateTenant} 
                                    className="w-full"
                                    loading={updatingTenant}
                                    loadingText="Updating..."
                                >
                                    Update Tenant
                                </LoadingButton>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

