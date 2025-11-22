import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Pressable } from 'react-native';
import { useTheme } from '@/components/providers/theme-provider';
import { ChevronDown, Check } from 'lucide-react-native';

interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

export function Select({ value, onValueChange, children, disabled }: SelectProps) {
    const { colors } = useTheme();
    const [open, setOpen] = useState(false);
    const items: Array<{ value: string; label: string }> = [];

    // Extract items by checking props directly
    const extractItems = (node: React.ReactNode): void => {
        React.Children.forEach(node, (child) => {
            if (!React.isValidElement(child)) return;

            const childType = child.type as any;
            const displayName = childType?.displayName || childType?.name || '';

            // Check for SelectContent
            if (displayName === 'SelectContent' || childType === SelectContent) {
                extractItems(child.props.children);
            }
            // Check for SelectItem - directly extract value and label
            else if (displayName === 'SelectItem' || childType === SelectItem) {
                if (child.props.value && child.props.children) {
                    items.push({
                        value: child.props.value,
                        label: child.props.children,
                    });
                }
            }
            // Recursively check children
            else if (child.props?.children) {
                extractItems(child.props.children);
            }
        });
    };

    extractItems(children);

    const selectedItem = items.find((item) => item.value === value);

    return (
        <View>
            {/* Simple Trigger */}
            <TouchableOpacity
                disabled={disabled}
                onPress={() => {
                    console.log('Select opened. Items found:', items);
                    setOpen(true);
                }}
                style={{
                    height: 48,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    paddingHorizontal: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: disabled ? 0.5 : 1
                }}
            >
                <Text style={{
                    fontSize: 15,
                    color: selectedItem ? colors.text : colors.textTertiary
                }}>
                    {selectedItem?.label || 'Select...'}
                </Text>
                <ChevronDown size={18} color={colors.textTertiary} />
            </TouchableOpacity>

            {/* Centered Modal */}
            <Modal
                visible={open}
                transparent
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20
                    }}
                    onPress={() => setOpen(false)}
                >
                    <Pressable
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            width: '100%',
                            maxWidth: 320,
                            maxHeight: 400,
                            overflow: 'hidden'
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View style={{
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border
                        }}>
                            <Text style={{
                                fontSize: 17,
                                fontWeight: '600',
                                color: colors.text,
                                textAlign: 'center'
                            }}>
                                Select Option
                            </Text>
                        </View>

                        {/* Options */}
                        <ScrollView style={{ maxHeight: 300 }}>
                            {items.length === 0 ? (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: colors.textTertiary, fontSize: 14 }}>
                                        No options available
                                    </Text>
                                </View>
                            ) : (
                                items.map((item, index) => {
                                    const isSelected = item.value === value;
                                    return (
                                        <TouchableOpacity
                                            key={item.value}
                                            onPress={() => {
                                                console.log('Selected:', item.value);
                                                onValueChange(item.value);
                                                setOpen(false);
                                            }}
                                            style={{
                                                paddingHorizontal: 20,
                                                paddingVertical: 16,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                backgroundColor: isSelected ? colors.primary + '15' : colors.surface,
                                                borderBottomWidth: index < items.length - 1 ? 1 : 0,
                                                borderBottomColor: colors.borderLight
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 16,
                                                color: isSelected ? colors.primary : colors.text,
                                                fontWeight: isSelected ? '600' : '400'
                                            }}>
                                                {item.label}
                                            </Text>
                                            {isSelected && (
                                                <Check size={20} color={colors.primary} strokeWidth={2.5} />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            onPress={() => setOpen(false)}
                            style={{
                                padding: 16,
                                borderTopWidth: 1,
                                borderTopColor: colors.border,
                                backgroundColor: colors.surfaceElevated
                            }}
                        >
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: colors.textSecondary,
                                textAlign: 'center'
                            }}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

// Compatibility components with displayName
export function SelectTrigger({ children }: { children: React.ReactNode; className?: string }) {
    return null;
}
SelectTrigger.displayName = 'SelectTrigger';

export function SelectValue({ placeholder }: { placeholder?: string }) {
    return null;
}
SelectValue.displayName = 'SelectValue';

interface SelectContentProps {
    children: React.ReactNode;
}

export function SelectContent({ children }: SelectContentProps) {
    return <>{children}</>;
}
SelectContent.displayName = 'SelectContent';

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
    return null;
}
SelectItem.displayName = 'SelectItem';
