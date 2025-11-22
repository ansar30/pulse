import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, ButtonProps } from './button';

interface LoadingButtonProps extends Omit<ButtonProps, 'loading'> {
    loading?: boolean;
    loadingText?: string;
    children?: React.ReactNode;
}

export function LoadingButton({
    loading = false,
    loadingText,
    children,
    disabled,
    ...props
}: LoadingButtonProps) {
    return (
        <View style={styles.container}>
            <Button
                disabled={disabled || loading}
                loading={loading}
                {...props}
            >
                {loading ? loadingText || children : children}
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
});

