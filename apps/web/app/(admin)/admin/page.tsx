'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { adminApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Users, Building2, MessageSquare, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const { user, isAuthenticated, initAuth } = useAuthStore();
    const [analytics, setAnalytics] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const loadData = async () => {
        if (!user) return;
        
        const isSuperAdmin = user.role === 'SUPER_ADMIN';
        setLoading(true);
        setError('');
        try {
            const [analyticsRes, tenantsRes, usersRes] = await Promise.all([
                isSuperAdmin
                    ? adminApi.getAnalytics().catch(err => {
                        console.error('Failed to load analytics:', err);
                        return { success: false, data: null };
                    })
                    : Promise.resolve({ success: false, data: null }),
                isSuperAdmin
                    ? adminApi.getAllTenants().catch(err => {
                        console.error('Failed to load tenants:', err);
                        return { success: false, data: [] };
                    })
                    : Promise.resolve({ success: true, data: [] }),
                isSuperAdmin
                    ? adminApi.getAllUsers().catch(err => {
                        console.error('Failed to load users:', err);
                        return { success: false, data: [] };
                    })
                    : Promise.resolve({ success: true, data: [] }),
            ]);

            if (analyticsRes.success) {
                setAnalytics(analyticsRes.data);
            } else {
                setError('Failed to load analytics data');
            }
            
            if (tenantsRes.success) {
                setTenants(tenantsRes.data || []);
            }
            
            if (usersRes.success) {
                setUsers(usersRes.data || []);
            }
        } catch (error: any) {
            console.error('Failed to load admin data:', error);
            setError(error.response?.data?.message || 'Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const hasAdminAccess = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
        
        if (!hasAdminAccess) {
            router.push('/dashboard');
            return;
        }

        loadData();
    }, [isAuthenticated, user, router]);

    // Show loading state while checking auth
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <LoadingSpinner size="lg" text="Loading..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <LoadingSpinner size="lg" text="Loading user data..." />
            </div>
        );
    }

    // Check if user has admin access
    const hasAdminAccess = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    // If user doesn't have admin access, show message (they'll be redirected)
    if (!hasAdminAccess) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                    <p className="text-muted-foreground">Redirecting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                            {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} Dashboard
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground">System overview and management</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={loadData}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
                {error && (
                    <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            {/* Analytics Cards - Only for Super Admin */}
            {isSuperAdmin && (
                <>
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
                            <Card className="border shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Users
                                    </CardTitle>
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground">{analytics.totalUsers || 0}</div>
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Tenants
                                    </CardTitle>
                                    <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground">{analytics.totalTenants || 0}</div>
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Channels
                                    </CardTitle>
                                    <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground">{analytics.totalChannels || 0}</div>
                                </CardContent>
                            </Card>

                            <Card className="border shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        Total Messages
                                    </CardTitle>
                                    <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-foreground">{analytics.totalMessages || 0}</div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : !loading ? (
                        <Card className="mb-6 sm:mb-8 border shadow-sm">
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">
                                    {error ? 'Failed to load analytics. Click refresh to try again.' : 'No analytics data available.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}
                </>
            )}

            {/* Admin Info for Regular Admins */}
            {!isSuperAdmin && hasAdminAccess && (
                <Card className="mb-6 sm:mb-8 border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Admin Dashboard</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            You have admin access. Use the Settings page to manage your team members.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            As an admin, you can manage users in your organization from the Settings page.
                            Super Admin access is required to view system-wide analytics and manage all tenants.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Tenants List */}
            {isSuperAdmin && (
                <Card className="mb-6 sm:mb-8 border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">All Tenants</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">Manage all organizations in the system</p>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : error && tenants.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-destructive" />
                                </div>
                                <p className="text-destructive font-medium mb-2">Error loading tenants</p>
                                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                                <Button onClick={loadData} variant="outline" size="sm">
                                    Try Again
                                </Button>
                            </div>
                        ) : tenants.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium">No tenants found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tenants.map((tenant) => (
                                    <div
                                        key={tenant.id}
                                        className="group flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-card"
                                    >
                                        <div>
                                            <div className="font-semibold text-base mb-1">{tenant.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {tenant._count?.users || 0} users • {tenant._count?.projects || 0} projects • {tenant._count?.channels || 0} channels
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm ${tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                            {tenant.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Recent Users */}
            {isSuperAdmin && (
                <Card className="border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Recent Users</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">Latest registered users across all tenants</p>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : error && users.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-destructive" />
                                </div>
                                <p className="text-destructive font-medium mb-2">Error loading users</p>
                                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                                <Button onClick={loadData} variant="outline" size="sm">
                                    Try Again
                                </Button>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                    <Users className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium">No users found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.slice(0, 10).map((u) => (
                                    <div
                                        key={u.id}
                                        className="group flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200 bg-card"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                                                {u.profile?.firstName?.[0]}{u.profile?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-base">
                                                    {u.profile?.firstName} {u.profile?.lastName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {u.email} • {u.tenant?.name}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm ${u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                            {u.role.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
