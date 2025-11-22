import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/providers/theme-provider';
import { AppearanceModal } from '@/components/settings/appearance-modal';
import { Avatar } from '@/components/ui/avatar';
import { User, Bell, Lock, Palette, Globe, HelpCircle, LogOut, ChevronRight, Moon, Shield, Crown, Users, Check, Image as ImageIcon, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { usersApi } from '@/lib/api-client';
import { themeNames } from '@/lib/theme-colors';
import * as ImagePicker from 'expo-image-picker';

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const { user, logout, updateUser } = useAuthStore();
    const { colors, darkMode, setDarkMode, colorTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showAppearanceModal, setShowAppearanceModal] = useState(false);
    const [showDarkModeSelector, setShowDarkModeSelector] = useState(false);

    // Get user's full name
    const getUserName = () => {
        if (user?.profile?.firstName && user?.profile?.lastName) {
            return `${user.profile.firstName} ${user.profile.lastName}`;
        }
        if (user?.profile?.firstName) {
            return user.profile.firstName;
        }
        if (user?.email) {
            return user.email.split('@')[0];
        }
        return 'User';
    };

    // Get user initials
    const getUserInitials = () => {
        const name = getUserName();
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const handlePickImage = async () => {
        console.log('handlePickImage called', { tenantId: user?.tenantId, userId: user?.id });
        
        if (!user?.tenantId || !user?.id) {
            Alert.alert('Error', 'User information not available');
            return;
        }

        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Permission status:', status);
            
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant permission to access your photos.');
                return;
            }

            // Launch image picker
            console.log('Launching image picker...');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            console.log('Image picker result:', result.canceled ? 'canceled' : 'selected');

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                if (asset.base64) {
                    // Determine MIME type from URI
                    const uri = asset.uri;
                    let mimeType = 'image/jpeg';
                    if (uri.endsWith('.png')) {
                        mimeType = 'image/png';
                    } else if (uri.endsWith('.webp')) {
                        mimeType = 'image/webp';
                    } else if (uri.endsWith('.gif')) {
                        mimeType = 'image/gif';
                    }

                    const base64Data = `data:${mimeType};base64,${asset.base64}`;

                    try {
                        setUploadingAvatar(true);
                        console.log('Uploading avatar, base64 length:', base64Data.length);
                        const response = await usersApi.uploadProfileImage(user.tenantId, user.id, base64Data);
                        console.log('Upload response:', response);
                        if (response.success && response.data) {
                            updateUser(response.data);
                            Alert.alert('Success', 'Profile picture updated successfully!');
                        } else {
                            throw new Error(response.message || 'Failed to update profile picture');
                        }
                    } catch (error: any) {
                        console.error('Avatar upload error:', error);
                        const errorMessage = error.response?.data?.message 
                            || error.message 
                            || 'Failed to upload profile picture. Please try again.';
                        console.error('Error details:', {
                            status: error.response?.status,
                            data: error.response?.data,
                            message: errorMessage
                        });
                        Alert.alert('Error', errorMessage);
                    } finally {
                        setUploadingAvatar(false);
                    }
                }
            } else {
                console.log('Image picker was canceled');
            }
        } catch (error: any) {
            console.error('Error in handlePickImage:', error);
            Alert.alert('Error', error.message || 'Failed to open image picker. Please try again.');
        }
    };

    const handleRemoveImage = () => {
        if (!user?.tenantId || !user?.id) {
            Alert.alert('Error', 'User information not available');
            return;
        }

        if (!user.profile?.avatar) {
            Alert.alert('Info', 'No profile picture to remove');
            return;
        }

        Alert.alert(
            'Remove Profile Picture',
            'Are you sure you want to remove your profile picture?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setUploadingAvatar(true);
                            const response = await usersApi.removeProfileImage(user.tenantId, user.id);
                            if (response.success && response.data) {
                                updateUser(response.data);
                                Alert.alert('Success', 'Profile picture removed successfully!');
                            } else {
                                throw new Error('Failed to remove profile picture');
                            }
                        } catch (error: any) {
                            console.error('Avatar remove error:', error);
                            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to remove profile picture. Please try again.');
                        } finally {
                            setUploadingAvatar(false);
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            router.replace('/(auth)/login');
                        } catch (error) {
                            console.error('Logout error:', error);
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        }
                    },
                },
            ]
        );
    };

    const handleChangePassword = () => {
        router.push('/change-password');
    };

    const handleEditProfile = () => {
        if (!user?.tenantId || !user?.id) {
            Alert.alert('Error', 'User information not available');
            return;
        }

        Alert.prompt(
            'Edit Profile',
            'Enter your new name:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Save',
                    onPress: async (newName: string | undefined) => {
                        if (!newName || newName.trim() === '') return;

                        try {
                            setUpdating(true);
                            const nameParts = newName.trim().split(' ');
                            const firstName = nameParts[0];
                            const lastName = nameParts.slice(1).join(' ') || '';

                            await usersApi.update(user.tenantId, user.id, {
                                profile: {
                                    firstName,
                                    lastName,
                                },
                            });

                            Alert.alert('Success', 'Profile updated successfully!');
                        } catch (error) {
                            console.error('Profile update error:', error);
                            Alert.alert('Error', 'Failed to update profile. Please try again.');
                        } finally {
                            setUpdating(false);
                        }
                    },
                },
            ],
            'plain-text',
            getUserName()
        );
    };

    const isAdmin = user?.role === 'ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const canSeeAdmin = isAdmin || isSuperAdmin;

    const handleNavigateToAdmin = () => {
        router.push('/(tabs)/admin');
    };

    const handleNavigateToEmpire = () => {
        router.push('/(tabs)/empire');
    };

    const handleDarkModePress = () => {
        setShowDarkModeSelector(true);
    };

    const handleDarkModeSelect = (mode: 'system' | 'light' | 'dark') => {
        setDarkMode(mode);
        setShowDarkModeSelector(false);
    };

    const getDarkModeLabel = () => {
        if (darkMode === 'system') return 'System';
        if (darkMode === 'dark') return 'Dark';
        return 'Light';
    };

    const settingsSections = [
        {
            title: 'Account',
            items: [
                {
                    icon: User,
                    label: 'Profile',
                    value: getUserName(),
                    onPress: handleEditProfile,
                    showChevron: true,
                },
                {
                    icon: ImageIcon,
                    label: user?.profile?.avatar ? 'Change Profile Picture' : 'Add Profile Picture',
                    onPress: handlePickImage,
                    showChevron: true,
                },
                ...(user?.profile?.avatar ? [{
                    icon: X,
                    label: 'Remove Profile Picture',
                    onPress: handleRemoveImage,
                    showChevron: false,
                }] : []),
                {
                    icon: Shield,
                    label: 'Role',
                    value: user?.role,
                    onPress: () => { },
                    showChevron: false,
                },
            ],
        },
        {
            title: 'Preferences',
            items: [
                {
                    icon: Bell,
                    label: 'Notifications',
                    toggle: true,
                    value: notifications,
                    onToggle: setNotifications,
                },
                {
                    icon: Moon,
                    label: 'Dark Mode',
                    value: getDarkModeLabel(),
                    onPress: handleDarkModePress,
                    showChevron: true,
                },
                {
                    icon: Palette,
                    label: 'Appearance',
                    value: themeNames[colorTheme],
                    onPress: () => setShowAppearanceModal(true),
                    showChevron: true,
                },
                {
                    icon: Globe,
                    label: 'Language',
                    value: 'English',
                    onPress: () => { },
                    showChevron: true,
                },
            ],
        },
        {
            title: 'Security',
            items: [
                {
                    icon: Lock,
                    label: 'Change Password',
                    onPress: handleChangePassword,
                    showChevron: true,
                },
                {
                    icon: Shield,
                    label: 'Privacy Settings',
                    onPress: () => { },
                    showChevron: true,
                },
            ],
        },
        ...(canSeeAdmin ? [{
            title: 'Administration',
            items: [
                {
                    icon: Users,
                    label: 'User Management',
                    onPress: handleNavigateToAdmin,
                    showChevron: true,
                },
                ...(isSuperAdmin ? [{
                    icon: Crown,
                    label: 'Empire',
                    onPress: handleNavigateToEmpire,
                    showChevron: true,
                }] : []),
            ],
        }] : []),
        {
            title: 'Support',
            items: [
                {
                    icon: HelpCircle,
                    label: 'Help & Support',
                    onPress: () => { },
                    showChevron: true,
                },
            ],
        },
    ];

    return (
        <>
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 4, backgroundColor: colors.surface }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                </View>

                {/* User Profile Card */}
                <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                    <TouchableOpacity
                        onPress={handlePickImage}
                        disabled={uploadingAvatar}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <View style={styles.avatarWrapper} pointerEvents="none">
                            <Avatar user={user} size="large" showBorder={true} />
                            {uploadingAvatar && (
                                <View style={[styles.avatarOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                                    <Text style={styles.uploadingText}>Uploading...</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: colors.text }]}>{getUserName()}</Text>
                        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
                    </View>
                </View>

                {/* Settings Sections */}
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {settingsSections.map((section, sectionIndex) => (
                        <View key={sectionIndex} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{section.title}</Text>
                            <View style={[styles.sectionContent, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                                {section.items.map((item, itemIndex) => (
                                    <TouchableOpacity
                                        key={itemIndex}
                                        style={[
                                            styles.settingItem,
                                            { borderBottomColor: colors.borderLight },
                                            itemIndex === section.items.length - 1 && styles.settingItemLast,
                                        ]}
                                        onPress={item.onPress}
                                        disabled={('toggle' in item && item.toggle) || !item.onPress}
                                    >
                                        <View style={styles.settingLeft}>
                                            <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '15' }]}>
                                                <item.icon size={18} color={colors.primary} strokeWidth={2.5} />
                                            </View>
                                            <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                                        </View>
                                        <View style={styles.settingRight}>
                                            {'toggle' in item && item.toggle ? (
                                                <Switch
                                                    value={item.value as boolean}
                                                    onValueChange={item.onToggle}
                                                    trackColor={{ false: colors.border, true: colors.primary + '80' }}
                                                    thumbColor={item.value ? colors.primary : colors.surfaceElevated}
                                                />
                                            ) : (
                                                <>
                                                    {'value' in item && item.value && (
                                                        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{String(item.value)}</Text>
                                                    )}
                                                    {item.showChevron && (
                                                        <ChevronRight size={18} color={colors.textTertiary} strokeWidth={2} />
                                                    )}
                                                </>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}

                    {/* Logout Button */}
                    <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.error + '30' }]} onPress={handleLogout}>
                        <LogOut size={20} color={colors.error} strokeWidth={2.5} />
                        <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
                    </TouchableOpacity>

                    {/* App Version */}
                    <Text style={[styles.versionText, { color: colors.textTertiary }]}>Version 1.0.0</Text>
                </ScrollView>
            </SafeAreaView>

            {/* Dark Mode Selector Modal */}
            {showDarkModeSelector && (
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
                    <TouchableOpacity
                        style={StyleSheet.absoluteFill}
                        activeOpacity={1}
                        onPress={() => setShowDarkModeSelector(false)}
                    />
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Dark Mode</Text>
                        {(['system', 'light', 'dark'] as const).map((mode) => (
                            <TouchableOpacity
                                key={mode}
                                style={[
                                    styles.modalOption,
                                    { borderBottomColor: colors.borderLight },
                                    mode === 'dark' && styles.modalOptionLast,
                                ]}
                                onPress={() => handleDarkModeSelect(mode)}
                            >
                                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                                    {mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light'}
                                </Text>
                                {darkMode === mode && (
                                    <Check size={20} color={colors.primary} strokeWidth={3} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Appearance Modal */}
            <AppearanceModal visible={showAppearanceModal} onClose={() => setShowAppearanceModal(false)} />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 8,
        padding: 18,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: 14,
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 3,
        letterSpacing: -0.3,
    },
    profileEmail: {
        fontSize: 13,
        fontWeight: '500',
        letterSpacing: 0.1,
    },
    editButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    sectionContent: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    settingItemLast: {
        borderBottomWidth: 0,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.1,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 16,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 32,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        width: '80%',
        maxWidth: 400,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalOptionLast: {
        borderBottomWidth: 0,
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
