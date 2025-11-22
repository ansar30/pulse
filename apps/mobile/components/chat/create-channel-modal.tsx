import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { X, Hash } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CreateChannelModalProps {
    visible: boolean;
    onClose: () => void;
    onCreate: (data: { name: string; description?: string; type: 'PUBLIC' | 'PRIVATE' }) => Promise<void>;
}

export function CreateChannelModal({ visible, onClose, onCreate }: CreateChannelModalProps) {
    const { colors } = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!name.trim()) {
            setError('Channel name is required');
            return;
        }

        // Validate channel name (alphanumeric and hyphens only)
        if (!/^[a-zA-Z0-9-]+$/.test(name)) {
            setError('Channel name can only contain letters, numbers, and hyphens');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await onCreate({
                name: name.trim().toLowerCase(),
                description: description.trim() || undefined,
                type,
            });
            // Reset form
            setName('');
            setDescription('');
            setType('PUBLIC');
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create channel');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setName('');
            setDescription('');
            setType('PUBLIC');
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
                                <Hash size={20} color={colors.primary} strokeWidth={2.5} />
                            </View>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Channel</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={colors.textSecondary} strokeWidth={2} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Channel Name */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Channel Name <Text style={[styles.required, { color: colors.error }]}>*</Text>
                            </Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                                <Text style={[styles.inputPrefix, { color: colors.textSecondary }]}>#</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text }]}
                                    placeholder="e.g. general, random, team-updates"
                                    placeholderTextColor={colors.textTertiary}
                                    value={name}
                                    onChangeText={(text) => {
                                        setName(text.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                                        setError('');
                                    }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    editable={!loading}
                                />
                            </View>
                            <Text style={[styles.hint, { color: colors.textSecondary }]}>Use lowercase letters, numbers, and hyphens</Text>
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
                                placeholder="What's this channel about?"
                                placeholderTextColor={colors.textTertiary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                editable={!loading}
                            />
                        </View>

                        {/* Channel Type */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Channel Type</Text>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[styles.typeOption, { borderColor: colors.border, backgroundColor: colors.surface }, type === 'PUBLIC' && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
                                    onPress={() => setType('PUBLIC')}
                                    disabled={loading}
                                >
                                    <View style={styles.typeOptionContent}>
                                        <Text style={[styles.typeOptionTitle, { color: colors.text }, type === 'PUBLIC' && { color: colors.primary }]}>
                                            Public
                                        </Text>
                                        <Text style={[styles.typeOptionDescription, { color: colors.textSecondary }, type === 'PUBLIC' && { color: colors.primary }]}>
                                            Anyone in the workspace can join
                                        </Text>
                                    </View>
                                    {type === 'PUBLIC' && (
                                        <View style={[styles.typeOptionCheck, { borderColor: colors.primary }]}>
                                            <View style={[styles.typeOptionCheckInner, { backgroundColor: colors.primary }]} />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.typeOption, { borderColor: colors.border, backgroundColor: colors.surface }, type === 'PRIVATE' && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }]}
                                    onPress={() => setType('PRIVATE')}
                                    disabled={loading}
                                >
                                    <View style={styles.typeOptionContent}>
                                        <Text style={[styles.typeOptionTitle, { color: colors.text }, type === 'PRIVATE' && { color: colors.primary }]}>
                                            Private
                                        </Text>
                                        <Text style={[styles.typeOptionDescription, { color: colors.textSecondary }, type === 'PRIVATE' && { color: colors.primary }]}>
                                            Only invited members can access
                                        </Text>
                                    </View>
                                    {type === 'PRIVATE' && (
                                        <View style={[styles.typeOptionCheck, { borderColor: colors.primary }]}>
                                            <View style={[styles.typeOptionCheckInner, { backgroundColor: colors.primary }]} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
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
                            style={[styles.createButton, (!name.trim() || loading) && styles.createButtonDisabled]}
                            onPress={handleCreate}
                            disabled={!name.trim() || loading}
                        >
                            <LinearGradient
                                colors={!name.trim() || loading ? [colors.textTertiary, colors.textTertiary] : [colors.primary, colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.createButtonGradient}
                            >
                                <Text style={[styles.createButtonText, { color: colors.surface }]}>
                                    {loading ? 'Creating...' : 'Create Channel'}
                                </Text>
                            </LinearGradient>
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
        maxHeight: '80%',
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
        padding: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    required: {
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputPrefix: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 4,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 80,
    },
    hint: {
        fontSize: 12,
        marginTop: 6,
    },
    typeSelector: {
        gap: 12,
    },
    typeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 2,
        borderRadius: 12,
    },
    typeOptionContent: {
        flex: 1,
    },
    typeOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    typeOptionDescription: {
        fontSize: 13,
    },
    typeOptionCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeOptionCheckInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
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
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopWidth: 1,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    createButtonDisabled: {
        opacity: 0.5,
    },
    createButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
