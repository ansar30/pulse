import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { X, FolderKanban } from 'lucide-react-native';

interface CreateProjectModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (data: { name: string; description?: string }) => Promise<void>;
}

export function CreateProjectModal({ visible, onClose, onCreate }: CreateProjectModalProps) {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await onCreate({
                name: name.trim(),
                description: description.trim() || undefined,
            });
            // Reset form
            setName('');
            setDescription('');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setName('');
            setDescription('');
            setError('');
            onClose();
        }
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
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    {/* Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <View style={styles.modalHeaderLeft}>
                            <View style={[styles.modalIconContainer, { backgroundColor: colors.primary + '15' }]}>
                                <FolderKanban size={20} color={colors.primary} strokeWidth={2.5} />
                            </View>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Project</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} strokeWidth={2} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Project Name */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Project Name <Text style={[styles.required, { color: colors.error }]}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                                placeholder="e.g. Website Redesign, Mobile App"
                                placeholderTextColor={colors.textTertiary}
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    setError('');
                                }}
                                editable={!loading}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                                placeholder="What's this project about?"
                                placeholderTextColor={colors.textTertiary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                editable={!loading}
                            />
                        </View>

                        {/* Error Message */}
                        {error && (
                            <View style={[styles.errorContainer, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
                                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.createButton, { backgroundColor: colors.primary }, (!name.trim() || loading) && { opacity: 0.5 }]}
                            onPress={handleCreate}
                            disabled={!name.trim() || loading}
                        >
                            <Text style={[styles.createButtonText, { color: colors.surface }]}>
                                {loading ? 'Creating...' : 'Create Project'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    modalContent: {
        borderRadius: 20,
        width: '100%',
        maxWidth: 500,
        maxHeight: '70%',
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
    modalBody: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: -0.1,
    },
    required: {
    },
    input: {
        fontSize: 15,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    textArea: {
        minHeight: 80,
        paddingTop: 12,
    },
    errorContainer: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.1,
    },
    createButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    createButtonDisabled: {
        opacity: 0.5,
    },
    createButtonText: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.1,
    },
});
