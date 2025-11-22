'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { projectsApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderKanban, Plus, Edit2, Trash2, Search, Calendar } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function ProjectsPage() {
    const router = useRouter();
    const { user, isAuthenticated, initAuth } = useAuthStore();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

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
        setLoading(true);
        setError('');
        try {
            const response = await projectsApi.getAll(user.tenantId);
            if (response.success) {
                setProjects(response.data || []);
            } else {
                setError('Failed to load projects');
            }
        } catch (err: any) {
            console.error('Failed to load projects:', err);
            setError(err.response?.data?.message || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!formData.name.trim() || !user?.tenantId) {
            setError('Project name is required');
            return;
        }

        setError('');
        setCreating(true);
        try {
            const response = await projectsApi.create(user.tenantId, formData);
            if (response.success) {
                setProjects([...projects, response.data]);
                setFormData({ name: '', description: '' });
                setCreateDialogOpen(false);
                setError('');
            } else {
                setError('Failed to create project');
            }
        } catch (err: any) {
            console.error('Failed to create project:', err);
            setError(err.response?.data?.message || 'Failed to create project');
        } finally {
            setCreating(false);
        }
    };

    const handleEdit = (project: any) => {
        setSelectedProject(project);
        setFormData({
            name: project.name || '',
            description: project.description || '',
        });
        setEditDialogOpen(true);
        setError('');
    };

    const handleUpdate = async () => {
        if (!formData.name.trim() || !selectedProject || !user?.tenantId) {
            setError('Project name is required');
            return;
        }

        setError('');
        setUpdating(true);
        try {
            const response = await projectsApi.update(user.tenantId, selectedProject.id, formData);
            if (response.success) {
                setProjects(projects.map(p => p.id === selectedProject.id ? response.data : p));
                setEditDialogOpen(false);
                setSelectedProject(null);
                setFormData({ name: '', description: '' });
                setError('');
            } else {
                setError('Failed to update project');
            }
        } catch (err: any) {
            console.error('Failed to update project:', err);
            setError(err.response?.data?.message || 'Failed to update project');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        if (!user?.tenantId) return;

        setDeleting(projectId);
        try {
            const response = await projectsApi.delete(user.tenantId, projectId);
            if (response.success) {
                setProjects(projects.filter(p => p.id !== projectId));
            } else {
                alert('Failed to delete project');
            }
        } catch (err: any) {
            console.error('Failed to delete project:', err);
            alert(err.response?.data?.message || 'Failed to delete project');
        } finally {
            setDeleting(null);
        }
    };

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                            Projects
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Manage and organize your projects
                        </p>
                    </div>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="w-4 h-4 mr-2" />
                                New Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                                <DialogDescription>
                                    Add a new project to organize your work
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Project Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="My Project"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        placeholder="Project description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                                    />
                                </div>
                                <LoadingButton 
                                    onClick={handleCreate} 
                                    className="w-full"
                                    loading={creating}
                                    loadingText="Creating..."
                                >
                                    Create Project
                                </LoadingButton>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" text="Loading projects..." />
                </div>
            ) : error && projects.length === 0 ? (
                <Card className="border shadow-sm">
                    <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                            <FolderKanban className="w-8 h-8 text-destructive" />
                        </div>
                        <p className="text-destructive font-medium mb-2">Error loading projects</p>
                        <p className="text-sm text-muted-foreground mb-4">{error}</p>
                        <LoadingButton 
                            onClick={loadProjects} 
                            variant="outline"
                            loading={loading}
                            loadingText="Retrying..."
                        >
                            Try Again
                        </LoadingButton>
                    </CardContent>
                </Card>
            ) : filteredProjects.length === 0 ? (
                <Card className="border shadow-sm">
                    <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                            <FolderKanban className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium mb-4">
                            {searchQuery ? 'No projects found matching your search' : 'No projects yet'}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setCreateDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Project
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="border shadow-sm hover:shadow-md transition-shadow group">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                                            {project.name}
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleEdit(project)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <LoadingButton
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(project.id)}
                                            loading={deleting === project.id}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </LoadingButton>
                                    </div>
                                </div>
                                {project.description && (
                                    <CardDescription className="line-clamp-2">
                                        {project.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {project.createdAt
                                        ? format(new Date(project.createdAt), 'MMM d, yyyy')
                                        : 'Unknown date'}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
                setEditDialogOpen(open);
                if (!open) {
                    setSelectedProject(null);
                    setFormData({ name: '', description: '' });
                    setError('');
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Update project information
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Project Name *</Label>
                            <Input
                                id="edit-name"
                                placeholder="My Project"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                placeholder="Project description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && handleUpdate()}
                            />
                        </div>
                        <LoadingButton 
                            onClick={handleUpdate} 
                            className="w-full"
                            loading={updating}
                            loadingText="Updating..."
                        >
                            Update Project
                        </LoadingButton>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

