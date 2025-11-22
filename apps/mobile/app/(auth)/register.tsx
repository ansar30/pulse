/* Register page commented out - registration is disabled
import { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';
import { Link } from 'expo-router';
import { useTheme } from '@/components/providers/theme-provider';

export default function RegisterScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        tenantName: '',
    });

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await authApi.register(formData);
            if (response.success && response.data) {
                setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
                router.replace('/(tabs)/dashboard');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Use gradient background for light mode, solid color for dark mode
    const gradientColors = isDark 
        ? [colors.background, colors.surface, colors.background]
        : [colors.primary, colors.primaryLight, colors.accent];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <StatusBar style={isDark ? 'light' : 'dark'} />
            {!isDark && (
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            )}
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: insets.top + 20,
                    paddingBottom: insets.bottom + 20,
                    paddingHorizontal: 24,
                    justifyContent: 'center',
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={{ width: '100%', maxWidth: 400, alignSelf: 'center' }}>
                    <View style={{ marginBottom: 32, alignItems: 'center' }}>
                        <Text style={{ 
                            fontSize: 42, 
                            fontWeight: '600', 
                            color: isDark ? colors.primary : '#ffffff',
                            fontFamily: 'cursive',
                            letterSpacing: 2,
                            marginBottom: 24,
                            textShadowColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.2)',
                            textShadowOffset: { width: 0, height: 2 },
                            textShadowRadius: 4,
                        }}>
                            Pulse
                        </Text>
                        <Text style={{ fontSize: 36, fontWeight: '700', marginBottom: 8, color: isDark ? colors.text : '#ffffff' }}>
                            Get started
                        </Text>
                        <Text style={{ fontSize: 16, color: isDark ? colors.textSecondary : 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }}>
                            Create your account to begin
                        </Text>
                    </View>

                    <Card style={{
                        borderWidth: 0,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: isDark ? 0.3 : 0.15,
                        shadowRadius: 24,
                        elevation: 12,
                        backgroundColor: colors.surface,
                    }}>
                        <CardHeader style={{ paddingBottom: 24 }}>
                            <CardTitle style={{ fontSize: 28, fontWeight: '700', textAlign: 'center', color: colors.text }}>
                                Create Account
                            </CardTitle>
                            <CardDescription style={{ textAlign: 'center', fontSize: 14, marginTop: 8, color: colors.textSecondary }}>
                                Enter your information to get started
                            </CardDescription>
                        </CardHeader>
                        <CardContent style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                            {error && (
                                <View style={{
                                    padding: 16,
                                    marginBottom: 20,
                                    backgroundColor: colors.error + '15',
                                    borderWidth: 1,
                                    borderColor: colors.error + '40',
                                    borderRadius: 12,
                                }}>
                                    <Text style={{ fontSize: 14, color: colors.error, fontWeight: '500' }}>{error}</Text>
                                </View>
                            )}

                            <View style={{ gap: 20 }}>
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    <View style={{ flex: 1, gap: 8 }}>
                                        <Label style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                            First Name
                                        </Label>
                                        <Input
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                                            autoCapitalize="words"
                                            style={{ height: 56 }}
                                        />
                                    </View>
                                    <View style={{ flex: 1, gap: 8 }}>
                                        <Label style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                            Last Name
                                        </Label>
                                        <Input
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                                            autoCapitalize="words"
                                            style={{ height: 56 }}
                                        />
                                    </View>
                                </View>

                                <View style={{ gap: 8 }}>
                                    <Label style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                        Company Name
                                    </Label>
                                    <Input
                                        placeholder="Acme Inc"
                                        value={formData.tenantName}
                                        onChangeText={(text) => setFormData({ ...formData, tenantName: text })}
                                        autoCapitalize="words"
                                        style={{ height: 56 }}
                                    />
                                </View>

                                <View style={{ gap: 8 }}>
                                    <Label style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                        Email
                                    </Label>
                                    <Input
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        style={{ height: 56 }}
                                    />
                                </View>

                                <View style={{ gap: 8 }}>
                                    <Label style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                                        Password
                                    </Label>
                                    <Input
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                                        secureTextEntry
                                        autoComplete="password"
                                        style={{ height: 56 }}
                                    />
                                </View>

                                <View style={{ marginTop: 8, width: '100%' }}>
                                    <LoadingButton
                                        onPress={handleSubmit}
                                        loading={loading}
                                        loadingText="Creating account..."
                                        variant="default"
                                        size="lg"
                                    >
                                        Create Account
                                    </LoadingButton>
                                </View>

                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingTop: 16,
                                }}>
                                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                                        Already have an account?{' '}
                                    </Text>
                                    <Link href="/(auth)/login" asChild>
                                        <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
                                            Sign in
                                        </Text>
                                    </Link>
                                </View>
                            </View>
                        </CardContent>
                    </Card>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
*/

// Register page is disabled - returning null to prevent access
export default function RegisterScreen() {
    return null;
}
