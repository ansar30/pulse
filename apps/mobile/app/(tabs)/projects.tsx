import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/providers/theme-provider';
import { FolderKanban, Plus, Clock, CheckCircle2, Users, Calendar, TrendingUp } from 'lucide-react-native';
import { projectsApi } from '@/lib/api-client';
import { ErrorState } from '@/components/error-state';
import { EmptyState } from '@/components/empty-state';
import { LoadingSkeleton } from '@/components/loading-skeleton';
import { CreateProjectModal } from '@/components/projects/create-project-modal';

interface Project {
    id: string;
    name: string;
    description?: string;
    settings?: any;
    createdAt: string;
    updatedAt: string;
    _count?: { resources: number };
}

export default function ProjectsScreen() {
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { colors } = useTheme();
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchProjects = async () => {
        try {
            setError(null);

            if (!user?.tenantId) {
                throw new Error('No tenant ID found');
            }

            const response = await projectsApi.getAll(user.tenantId);
            const projectsData = response.data || [];

            setProjects(projectsData);
        } catch (err) {
            console.error('Projects fetch error:', err);
            setError(err instanceof Error ? err : new Error('Failed to load projects'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.tenantId) {
            fetchProjects();
        } else if (user && !user.tenantId) {
            // User exists but no tenantId - set error and stop loading
            setError(new Error('No tenant ID found'));
            setLoading(false);
        } else if (!user) {
            // No user at all - stop loading
            setLoading(false);
        }
    }, [user?.tenantId, user]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProjects();
    };

    const handleCreateProject = async (data: { name: string; description?: string }) => {
        if (!user?.tenantId) return;

        try {
            await projectsApi.create(user.tenantId, data);
            await fetchProjects();
            Alert.alert('Success', 'Project created successfully!');
        } catch (err) {
            console.error('Failed to create project:', err);
            throw err;
        }
    };

    const getProjectStatus = (project: Project) => {
        const status = project.settings?.status || 'active';
        return status.toLowerCase();
    };

    const getProjectProgress = (project: Project) => {
        const progress = project.settings?.progress || 0;
        return Math.min(100, Math.max(0, progress));
    };

    const filteredProjects = projects.filter((project) => {
        if (filter === 'all') return true;
        return getProjectStatus(project) === filter;
    });

    const activeCount = projects.filter((p) => getProjectStatus(p) === 'active').length;
    const completedCount = projects.filter((p) => getProjectStatus(p) === 'completed').length;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
                    <LoadingSkeleton width={150} height={28} />
                    <LoadingSkeleton width={44} height={44} borderRadius={22} />
                </View>
                <View style={styles.filterContainer}>
                    {[1, 2, 3].map((i) => (
                        <LoadingSkeleton key={i} width="30%" height={36} borderRadius={10} />
                    ))}
                </View>
                <View style={{ padding: 20 }}>
                    {[1, 2].map((i) => (
                        <LoadingSkeleton key={i} width="100%" height={140} borderRadius={16} style={{ marginBottom: 16 }} />
                    ))}
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        const isTenantIdError = error.message === 'No tenant ID found';
        const errorMessage = isTenantIdError 
            ? 'Your session data is incomplete. Please log out and log back in to refresh your account information.'
            : error.message;
        return <ErrorState error={errorMessage} onRetry={isTenantIdError ? undefined : fetchProjects} />;
    }

    if (projects.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
                <View style={[styles.header, { paddingTop: insets.top + 4, backgroundColor: colors.surface }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Projects</Text>
                    <TouchableOpacity style={[styles.newProjectButton, { backgroundColor: colors.primary + '15' }]} onPress={() => setShowCreateModal(true)}>
                        <Plus size={22} color={colors.primary} strokeWidth={2.5} />
                    </TouchableOpacity>
                </View>
                <EmptyState
                    icon={FolderKanban}
                    title="No Projects Yet"
                    message="Create your first project to get started."
                    actionLabel="Create Project"
                    onAction={() => setShowCreateModal(true)}
                />
                <CreateProjectModal
                    visible={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateProject}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.surface }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Projects</Text>
                <TouchableOpacity style={[styles.newProjectButton, { backgroundColor: colors.primary + '15' }]} onPress={() => setShowCreateModal(true)}>
                    <Plus size={22} color={colors.primary} strokeWidth={2.5} />
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={[styles.filterContainer, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'all' && { backgroundColor: colors.primary }]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, { color: filter === 'all' ? colors.surface : colors.textSecondary }]}>
                        All
                    </Text>
                    <View style={[styles.filterBadge, { backgroundColor: filter === 'all' ? colors.surface + '30' : colors.surfaceElevated }]}>
                        <Text style={[styles.filterBadgeText, { color: filter === 'all' ? colors.surface : colors.textSecondary }]}>
                            {projects.length}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'active' && { backgroundColor: colors.primary }]}
                    onPress={() => setFilter('active')}
                >
                    <Text style={[styles.filterText, { color: filter === 'active' ? colors.surface : colors.textSecondary }]}>
                        Active
                    </Text>
                    <View style={[styles.filterBadge, { backgroundColor: filter === 'active' ? colors.surface + '30' : colors.surfaceElevated }]}>
                        <Text style={[styles.filterBadgeText, { color: filter === 'active' ? colors.surface : colors.textSecondary }]}>
                            {activeCount}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, filter === 'completed' && { backgroundColor: colors.primary }]}
                    onPress={() => setFilter('completed')}
                >
                    <Text style={[styles.filterText, { color: filter === 'completed' ? colors.surface : colors.textSecondary }]}>
                        Done
                    </Text>
                    <View style={[styles.filterBadge, { backgroundColor: filter === 'completed' ? colors.surface + '30' : colors.surfaceElevated }]}>
                        <Text style={[styles.filterBadgeText, { color: filter === 'completed' ? colors.surface : colors.textSecondary }]}>
                            {completedCount}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Projects Grid */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
            >
                {filteredProjects.length === 0 ? (
                    <View style={{ paddingTop: 60 }}>
                        <EmptyState
                            icon={FolderKanban}
                            title={`No ${filter === 'all' ? '' : filter.charAt(0).toUpperCase() + filter.slice(1)} Projects`}
                            message={`You don't have any ${filter === 'all' ? '' : filter} projects yet.`}
                        />
                    </View>
                ) : (
                    <View style={styles.projectsGrid}>
                        {filteredProjects.map((project) => {
                            const status = getProjectStatus(project);
                            const progress = getProjectProgress(project);
                            const teamSize = project.settings?.teamSize || 0;
                            const tasks = project.settings?.tasks || [];
                            const completedTasks = tasks.filter((t: any) => t.completed).length;

                            return (
                                <TouchableOpacity key={project.id} style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                                    {/* Card Header */}
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.projectIcon, { backgroundColor: colors.primary + '15' }]}>
                                            <FolderKanban size={18} color={colors.primary} strokeWidth={2.5} />
                                        </View>
                                        <View style={[
                                            styles.statusDot,
                                            { backgroundColor: status === 'active' ? colors.success : status === 'completed' ? colors.success : colors.textTertiary }
                                        ]} />
                                    </View>

                                    {/* Project Name */}
                                    <Text style={[styles.projectName, { color: colors.text }]} numberOfLines={1}>
                                        {project.name}
                                    </Text>

                                    {/* Description */}
                                    {project.description && (
                                        <Text style={[styles.projectDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                                            {project.description}
                                        </Text>
                                    )}

                                    {/* Progress */}
                                    {progress > 0 && (
                                        <View style={styles.progressContainer}>
                                            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                                                <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
                                            </View>
                                            <Text style={[styles.progressText, { color: colors.primary }]}>{progress}%</Text>
                                        </View>
                                    )}

                                    {/* Footer Stats */}
                                    <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
                                        <View style={styles.stat}>
                                            <Calendar size={12} color={colors.textTertiary} strokeWidth={2} />
                                            <Text style={[styles.statText, { color: colors.textSecondary }]}>{formatDate(project.createdAt)}</Text>
                                        </View>
                                        {teamSize > 0 && (
                                            <View style={styles.stat}>
                                                <Users size={12} color={colors.textTertiary} strokeWidth={2} />
                                                <Text style={[styles.statText, { color: colors.textSecondary }]}>{teamSize}</Text>
                                            </View>
                                        )}
                                        {tasks.length > 0 && (
                                            <View style={styles.stat}>
                                                <CheckCircle2 size={12} color={colors.textTertiary} strokeWidth={2} />
                                                <Text style={[styles.statText, { color: colors.textSecondary }]}>{completedTasks}/{tasks.length}</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Create Project Modal */}
            <CreateProjectModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateProject}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    newProjectButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 10,
    },
    filterTab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        gap: 6,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: -0.1,
    },
    filterBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        minWidth: 22,
        alignItems: 'center',
    },
    filterBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    content: {
        flex: 1,
    },
    projectsGrid: {
        padding: 20,
        gap: 16,
    },
    projectCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    projectIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    projectName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    projectDescription: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 12,
        fontWeight: '500',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    progressBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: 6,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 14,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
});
