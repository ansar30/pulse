import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImagePreviewModalProps {
    visible: boolean;
    imageUri: string | null;
    onClose: () => void;
}

export function ImagePreviewModal({ visible, imageUri, onClose }: ImagePreviewModalProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    if (!imageUri) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Close button */}
                <TouchableOpacity
                    style={[styles.closeButton, { top: insets.top + 16 }]}
                    onPress={onClose}
                    activeOpacity={0.8}
                >
                    <View style={[styles.closeButtonBg, { backgroundColor: colors.surface }]}>
                        <X size={24} color={colors.text} strokeWidth={2.5} />
                    </View>
                </TouchableOpacity>

                {/* Image */}
                <TouchableOpacity
                    style={styles.imageContainer}
                    activeOpacity={1}
                    onPress={onClose}
                >
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        zIndex: 10,
    },
    closeButtonBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
});



