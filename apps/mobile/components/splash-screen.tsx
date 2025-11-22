import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { appConfig } from '@/lib/app-config';
import * as SplashScreen from 'expo-splash-screen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish?: () => void;
}

export function CustomSplashScreen({ onFinish }: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const gradientAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Prevent the native splash screen from auto-hiding
        SplashScreen.preventAutoHideAsync();

        // Start animations
        Animated.parallel([
            // Fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            // Scale in
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            // Gradient animation
            Animated.timing(gradientAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation loop
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseLoop.start();

        // Hide splash screen after animations
        const timer = setTimeout(() => {
            SplashScreen.hideAsync().then(() => {
                onFinish?.();
            });
        }, 2500);

        return () => {
            clearTimeout(timer);
            pulseLoop.stop();
        };
    }, []);


    return (
        <View style={styles.container}>
            {/* Animated gradient background */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                <LinearGradient
                    colors={['#0f172a', '#1e1b4b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>

            {/* Animated gradient orbs for depth */}
            <Animated.View
                style={[
                    styles.orb1,
                    {
                        opacity: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.3],
                        }),
                        transform: [
                            {
                                scale: gradientAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.5],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={['#3b82f6', '#7c3aed']}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.orb2,
                    {
                        opacity: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.2],
                        }),
                        transform: [
                            {
                                scale: gradientAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.3],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <LinearGradient
                    colors={['#ec4899', '#a855f7']}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>

            {/* Main content */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            {
                                scale: pulseAnim,
                            },
                        ],
                    },
                ]}
            >
                {/* Pulse Logo with animated glow effect */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoWrapper}>
                        <Text style={styles.logoText}>Pulse</Text>
                    </View>

                    {/* Animated underline */}
                    <Animated.View
                        style={[
                            styles.underline,
                            {
                                opacity: scaleAnim,
                                transform: [
                                    {
                                        scaleX: scaleAnim.interpolate({
                                            inputRange: [0.8, 1],
                                            outputRange: [0, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={['#3b82f6', '#a855f7', '#ec4899']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                </View>

                {/* Tagline */}
                <Animated.Text
                    style={[
                        styles.tagline,
                        {
                            opacity: fadeAnim.interpolate({
                                inputRange: [0, 0.5, 1],
                                outputRange: [0, 0, 1],
                            }),
                            transform: [
                                {
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {appConfig.tagline}
                </Animated.Text>
            </Animated.View>

            {/* Loading indicator */}
            <Animated.View
                style={[
                    styles.loaderContainer,
                    {
                        opacity: fadeAnim.interpolate({
                            inputRange: [0, 0.7, 1],
                            outputRange: [0, 0, 1],
                        }),
                    },
                ]}
            >
                <View style={styles.loaderDots}>
                    {[0, 1, 2].map((index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.loaderDot,
                                {
                                    backgroundColor: '#3b82f6',
                                    transform: [
                                        {
                                            scale: pulseAnim.interpolate({
                                                inputRange: [1, 1.1],
                                                outputRange: index === 1 ? [1, 1.2] : [1, 1],
                                            }),
                                        },
                                    ],
                                    opacity: pulseAnim.interpolate({
                                        inputRange: [1, 1.1],
                                        outputRange: index === 1 ? [0.6, 1] : [0.4, 0.6],
                                    }),
                                },
                            ]}
                        />
                    ))}
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoWrapper: {
        position: 'relative',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: 10,
    },
    logoText: {
        fontSize: 72,
        fontWeight: '400',
        color: '#ffffff',
        fontFamily: 'cursive',
        letterSpacing: 4,
        textShadowColor: 'rgba(59, 130, 246, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 25,
    },
    underline: {
        height: 4,
        borderRadius: 2,
        marginTop: 12,
        overflow: 'hidden',
    },
    tagline: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
        letterSpacing: 1,
        marginTop: 8,
    },
    orb1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        top: SCREEN_HEIGHT * 0.2,
        left: SCREEN_WIDTH * 0.1,
        opacity: 0.3,
    },
    orb2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        bottom: SCREEN_HEIGHT * 0.25,
        right: SCREEN_WIDTH * 0.15,
        opacity: 0.2,
    },
    loaderContainer: {
        position: 'absolute',
        bottom: SCREEN_HEIGHT * 0.15,
        alignItems: 'center',
    },
    loaderDots: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    loaderDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});

