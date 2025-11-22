import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { appConfig } from '@/lib/app-config';
import { Zap, Lock, TrendingUp, MessageSquare, Users, Shield } from 'lucide-react-native';
import { Carousel } from '@/components/ui/carousel';
import { useTheme } from '@/components/providers/theme-provider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Index() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { isAuthenticated, _hasHydrated } = useAuthStore();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    // Wait for store to hydrate before checking auth
    if (!_hasHydrated) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    // Redirect authenticated users to chat page
    if (isAuthenticated) {
        return <Redirect href="/(tabs)/chat" />;
    }

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const features = [
        {
            icon: Zap,
            title: 'Lightning Fast',
            description: 'Built for speed. Your team will love how fast everything works.',
            gradient: ['#3b82f6', '#2563eb'],
        },
        {
            icon: Shield,
            title: 'Secure by Default',
            description: 'Enterprise-grade security with JWT authentication and tenant isolation.',
            gradient: ['#8b5cf6', '#7c3aed'],
        },
        {
            icon: TrendingUp,
            title: 'Scalable Architecture',
            description: 'Multi-tenant architecture that scales with your business needs.',
            gradient: ['#10b981', '#059669'],
        },
        {
            icon: MessageSquare,
            title: 'Real-time Chat',
            description: 'Instant messaging with real-time updates and seamless collaboration.',
            gradient: ['#f59e0b', '#d97706'],
        },
        {
            icon: Users,
            title: 'Team Collaboration',
            description: 'Work together seamlessly with channels, threads, and team management.',
            gradient: ['#ec4899', '#db2777'],
        },
        {
            icon: Lock,
            title: 'Privacy First',
            description: 'Your data is encrypted and protected with industry-leading security.',
            gradient: ['#06b6d4', '#0891b2'],
        },
    ];

    const renderFeatureCard = (feature: typeof features[0], index: number) => {
        const IconComponent = feature.icon;
        const cardGradient = isDark
            ? [`${colors.surface}CC`, `${colors.surface}99`]
            : ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)'];
        const borderColor = isDark ? colors.border : 'rgba(255, 255, 255, 0.12)';
        
        return (
            <View style={styles.featureCard}>
                <LinearGradient
                    colors={cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.featureCardGradient, { borderColor }]}
                >
                    <View style={styles.featureCardContent}>
                        <LinearGradient
                            colors={feature.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.featureIconContainer}
                        >
                            <IconComponent size={28} color="#ffffff" strokeWidth={2.5} />
                        </LinearGradient>
                        <Text style={[styles.featureCardTitle, { color: colors.text }]}>{feature.title}</Text>
                        <Text style={[styles.featureCardDescription, { color: colors.textSecondary }]}>{feature.description}</Text>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    // Theme-aware background colors
    const backgroundGradient = isDark 
        ? [colors.background, colors.surface, colors.background]
        : [colors.background, colors.surface, colors.background];
    
    const accentGradient = isDark
        ? [`${colors.primary}20`, 'transparent']
        : [`${colors.primary}15`, 'transparent'];

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            
            {/* Mobile-native gradient background */}
            <LinearGradient
                colors={backgroundGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            
            <LinearGradient
                colors={accentGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 20,
                }}
            >
                {/* Minimal Header - Mobile Native Style */}
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft} />
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/login')}
                                style={styles.signInButton}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.signInButtonText, { color: colors.textSecondary }]}>Sign In</Text>
                            </TouchableOpacity>
                            {/* Register button commented out */}
                            {/* <TouchableOpacity
                                onPress={() => router.push('/(auth)/register')}
                                style={styles.getStartedButton}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[colors.primary, colors.primaryDark || colors.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.getStartedGradient}
                                >
                                    <Text style={styles.getStartedText}>Get Started</Text>
                                </LinearGradient>
                            </TouchableOpacity> */}
                        </View>
                    </View>
                </View>

                {/* Hero Section - Full Mobile Experience */}
                <Animated.View
                    style={[
                        styles.heroSection,
                        {
                            minHeight: SCREEN_HEIGHT * 0.65,
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.heroContent}>
                        {/* Cursive Logo - Typography Based */}
                        <View style={styles.logoContainer}>
                            <Text style={[styles.heroLogo, { color: colors.text, textShadowColor: `${colors.primary}40` }]}>Pulse</Text>
                            <View style={[styles.logoUnderline, { backgroundColor: colors.primary }]} />
                        </View>

                        {/* Main Title */}
                        <Text style={[styles.heroTitle, { color: colors.text }]}>
                            {appConfig.tagline}
                        </Text>

                        {/* Description */}
                        <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                            {appConfig.description}
                        </Text>
                    </View>
                </Animated.View>

                {/* CTA Buttons - Fixed at bottom of hero */}
                <Animated.View
                    style={[
                        styles.ctaSection,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    {/* Register button commented out */}
                    {/* <TouchableOpacity
                        onPress={() => router.push('/(auth)/register')}
                        style={styles.primaryCTA}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.primaryDark || colors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.primaryCTAGradient}
                        >
                            <Text style={styles.primaryCTAText}>Get Started</Text>
                        </LinearGradient>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        onPress={() => router.push('/(auth)/login')}
                        style={[styles.secondaryCTA, { 
                            borderColor: colors.border, 
                            backgroundColor: isDark ? colors.surface : 'rgba(255, 255, 255, 0.08)' 
                        }]}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.secondaryCTAText, { color: colors.text }]}>Sign In</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Features Carousel - Mobile Native Cards */}
                <View style={styles.featuresContainer}>
                    <View style={styles.featuresHeader}>
                        <Text style={[styles.featuresTitle, { color: colors.text }]}>Everything you need</Text>
                    </View>
                    
                    <Carousel
                        itemWidth={SCREEN_WIDTH - 40}
                        itemSpacing={16}
                        showPagination={true}
                        paginationStyle="dots"
                    >
                        {features.map((feature, index) => renderFeatureCard(feature, index))}
                    </Carousel>
                </View>

                {/* Bottom CTA - Mobile Native */}
                <View style={styles.bottomCTA}>
                    <Text style={[styles.bottomCTATitle, { color: colors.text }]}>Ready to get started?</Text>
                    {/* Register button commented out */}
                    {/* <TouchableOpacity
                        onPress={() => router.push('/(auth)/register')}
                        style={styles.bottomCTAButton}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.primaryDark || colors.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.bottomCTAGradient}
                        >
                            <Text style={styles.bottomCTAText}>Create Account</Text>
                        </LinearGradient>
                    </TouchableOpacity> */}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    headerLeft: {
        flex: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    signInButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    getStartedButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    getStartedGradient: {
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    getStartedText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    heroSection: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroContent: {
        alignItems: 'center',
        width: '100%',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    heroLogo: {
        fontSize: 68,
        fontWeight: '400',
        fontFamily: 'cursive',
        letterSpacing: 3,
        marginBottom: 10,
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    logoUnderline: {
        width: 70,
        height: 3,
        borderRadius: 2,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    heroDescription: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    ctaSection: {
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 32,
        width: '100%',
        gap: 12,
    },
    primaryCTA: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    primaryCTAGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryCTAText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#ffffff',
    },
    secondaryCTA: {
        width: '100%',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        borderWidth: 1.5,
    },
    secondaryCTAText: {
        fontSize: 17,
        fontWeight: '500',
    },
    featuresContainer: {
        paddingTop: 20,
        paddingBottom: 32,
    },
    featuresHeader: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    featuresTitle: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    featureCard: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    featureCardGradient: {
        borderRadius: 24,
        borderWidth: 1,
    },
    featureCardContent: {
        padding: 32,
        alignItems: 'center',
    },
    featureIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    featureCardTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    featureCardDescription: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    bottomCTA: {
        paddingHorizontal: 20,
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
    bottomCTATitle: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 24,
    },
    bottomCTAButton: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    bottomCTAGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomCTAText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#ffffff',
    },
});
