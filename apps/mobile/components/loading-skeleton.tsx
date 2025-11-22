import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface LoadingSkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export function LoadingSkeleton({ width = '100%', height = 20, borderRadius = 8, style }: LoadingSkeletonProps) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
}

export function CardSkeleton() {
    return (
        <View style={styles.card}>
            <LoadingSkeleton width="60%" height={24} style={{ marginBottom: 12 }} />
            <LoadingSkeleton width="100%" height={16} style={{ marginBottom: 8 }} />
            <LoadingSkeleton width="80%" height={16} />
        </View>
    );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <View style={styles.list}>
            {Array.from({ length: count }).map((_, index) => (
                <CardSkeleton key={index} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#e2e8f0',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    list: {
        padding: 16,
    },
});
