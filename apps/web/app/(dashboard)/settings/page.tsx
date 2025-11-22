'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { usersApi, adminApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, UserPlus, Shield, Trash2 } from 'lucide-react';
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

export default function SettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, initAuth } = useAuthStore();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'MEMBER',
    });
    const [creatingUser, setCreatingUser] = useState(false);
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadUsers();
    }, [isAuthenticated, router]);

    const loadUsers = async () => {
        if (!user?.tenantId) return;
        try {
            const response = await usersApi.getAll(user.tenantId);
            if (response.success) {
                setUsers(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName || !user?.tenantId) {
            alert('Please fill in all fields');
            return;
        }

        setCreatingUser(true);
        try {
            const response = await adminApi.createUser({
                ...newUser,
                tenantId: user.tenantId,
            });

            if (response.success) {
                setUsers([...users, response.data]);
                setNewUser({
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: '',
                    role: 'MEMBER',
                });
                setCreateDialogOpen(false);
                alert('User created successfully!');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create user');
        } finally {
            setCreatingUser(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingRole(userId);
        try {
            await adminApi.updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert('Role updated successfully!');
        } catch (error) {
            alert('Failed to update role');
        } finally {
            setUpdatingRole(null);
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: any = {
            SUPER_ADMIN: 'bg-purple-100 text-purple-800',
            ADMIN: 'bg-blue-100 text-blue-800',
            MEMBER: 'bg-green-100 text-green-800',
            VIEWER: 'bg-gray-100 text-gray-800',
        };
        return colors[role] || colors.MEMBER;
    };

    const canManageUsers = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    Settings
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your team and account settings</p>
            </div>

            {/* Team Members */}
            <Card className="mb-6 sm:mb-8 border shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Team Members
                            </CardTitle>
                            <CardDescription>Manage users in your organization</CardDescription>
                        </div>
                        {canManageUsers && (
                            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="text-xs sm:text-sm">
                                        <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                        <span className="hidden sm:inline">Add User</span>
                                        <span className="sm:hidden">Add</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New User</DialogTitle>
                                        <DialogDescription>
                                            Add a new team member to your organization
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={newUser.firstName}
                                                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={newUser.lastName}
                                                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="password">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="role">Role</Label>
                                            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                                    <SelectItem value="MEMBER">Member</SelectItem>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
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
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner size="lg" text="Loading team members..." />
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                <Users className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground font-medium">No team members yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((u) => (
                                <div
                                    key={u.id}
                                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all duration-200 bg-card gap-3 sm:gap-0"
                                >
                                    <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md text-sm sm:text-base">
                                                {u.profile?.firstName?.[0]}{u.profile?.lastName?.[0]}
                                            </div>
                                            {u.role === 'ADMIN' && (
                                                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                                                    <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-sm sm:text-base truncate">
                                                {u.profile?.firstName} {u.profile?.lastName}
                                            </div>
                                            <div className="text-xs sm:text-sm text-muted-foreground truncate">{u.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end sm:justify-start space-x-2 sm:space-x-3">
                                        {canManageUsers && u.id !== user.id ? (
                                            <Select 
                                                value={u.role} 
                                                onValueChange={(value) => handleRoleChange(u.id, value)}
                                                disabled={updatingRole === u.id}
                                            >
                                                <SelectTrigger className="w-full sm:w-36 border-2 text-xs sm:text-sm disabled:opacity-50">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                                    <SelectItem value="MEMBER">Member</SelectItem>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-sm ${getRoleBadge(u.role)}`}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
