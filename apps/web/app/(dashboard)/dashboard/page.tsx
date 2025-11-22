'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { Users, FolderKanban, MessageSquare } from 'lucide-react';
import { projectsApi } from '@/lib/api-client';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, initAuth } = useAuthStore();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadProjects();
    }, [isAuthenticated, router]);

    const loadProjects = async () => {
        if (!user?.tenantId) return;
        try {
            const response = await projectsApi.getAll(user.tenantId);
            if (response.success) {
                setProjects(response.data || []);
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    Welcome back, {user?.profile?.firstName}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Here's what's happening with your team today
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Team Members
                        </CardTitle>
                        <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground mb-1">1</div>
                        <p className="text-xs text-muted-foreground">Active users</p>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Projects
                        </CardTitle>
                        <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <FolderKanban className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground mb-1">{projects.length}</div>
                        <p className="text-xs text-muted-foreground">Active projects</p>
                    </CardContent>
                </Card>

                <Card className="border shadow-sm bg-card hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Messages
                        </CardTitle>
                        <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground mb-1">0</div>
                        <p className="text-xs text-muted-foreground">This week</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-6 sm:mb-8 border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">Get started with these common tasks</p>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link href="/chat" className="flex-1">
                            <Button size="lg" className="w-full h-auto py-3 px-4 sm:py-4 sm:px-6 justify-start">
                                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                                <div className="text-left">
                                    <div className="font-semibold text-sm sm:text-base">Start Chatting</div>
                                    <div className="text-xs opacity-80">Connect with your team</div>
                                </div>
                            </Button>
                        </Link>
                        <Link href="/projects" className="flex-1">
                            <Button size="lg" variant="outline" className="w-full h-auto py-3 px-4 sm:py-4 sm:px-6 justify-start border-2">
                                <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                                <div className="text-left">
                                    <div className="font-semibold text-sm sm:text-base">View Projects</div>
                                    <div className="text-xs opacity-80">Manage your work</div>
                                </div>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Projects List */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Your Projects</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">All your active projects in one place</p>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingSpinner size="lg" text="Loading projects..." />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                <FolderKanban className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm sm:text-base text-muted-foreground mb-4 font-medium">No projects yet</p>
                            <Button>Create Your First Project</Button>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                            {projects.map((project: any) => (
                                <div
                                    key={project.id}
                                    className="group p-4 sm:p-5 border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all duration-200 cursor-pointer bg-card">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors pr-2">{project.name}</h3>
                                        <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{project.description || 'No description'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
