import React, { useState, createContext, useContext } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Pressable, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/theme-provider';
import { X } from 'lucide-react-native';

interface DialogContextType {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

function useDialogContext() {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('Dialog components must be used within a Dialog');
    }
    return context;
}

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
}

interface DialogTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

export function DialogTrigger({ children, asChild }: DialogTriggerProps) {
    const { onOpenChange } = useDialogContext();

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onPress: () => onOpenChange(true),
        } as any);
    }

    return (
        <Pressable onPress={() => onOpenChange(true)}>
            {children}
        </Pressable>
    );
}

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
    const { open, onOpenChange } = useDialogContext();
    const { colors } = useTheme();

    // Process children to add padding to non-header elements
    const processedChildren = React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Don't wrap DialogHeader - it has its own padding
        if (child.type === DialogHeader) {
            return child;
        }

        // Wrap other content in a padding container
        return (
            <View style={{
                paddingHorizontal: 24,
                paddingBottom: 8
            }}>
                {child}
            </View>
        );
    });

    return (
        <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={() => onOpenChange(false)}
        >
            <Pressable
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 16
                }}
                onPress={() => onOpenChange(false)}
            >
                <Pressable
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        shadowColor: colors.shadow,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                        width: '100%',
                        maxWidth: 500,
                        maxHeight: '90%'
                    }}
                    onPress={(e) => e.stopPropagation()}
                >
                    <ScrollView
                        style={{ maxHeight: '100%' }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                    >
                        {processedChildren}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
    const { onOpenChange } = useDialogContext();
    const { colors } = useTheme();

    return (
        <View style={{
            flexDirection: 'column',
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 16,
            position: 'relative',
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
        }}>
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    zIndex: 10,
                    padding: 8
                }}
                onPress={() => onOpenChange(false)}
            >
                <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={{ gap: 6 }}>
                {children}
            </View>
        </View>
    );
}

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
    const { colors } = useTheme();
    return (
        <Text style={{
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 24,
            color: colors.text,
            paddingRight: 32  // Space for close button
        }}>
            {children}
        </Text>
    );
}

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
    const { colors } = useTheme();
    return (
        <Text style={{
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
            marginTop: 4
        }}>
            {children}
        </Text>
    );
}
