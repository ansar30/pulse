import { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login(formData);
            if (response.success && response.data) {
                setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
                router.replace('/(tabs)/dashboard');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <StatusBar style={isDark ? 'light' : 'dark'} />
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
                            color: colors.primary,
                            fontFamily: 'cursive',
                            letterSpacing: 2,
                            marginBottom: 24,
                        }}>
                            Pulse
                        </Text>
                        <Text style={{ fontSize: 36, fontWeight: '700', marginBottom: 12, color: colors.text }}>
                            Welcome back
                        </Text>
                        <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 16 }}>
                            Sign in to continue to your account
                        </Text>
                    </View>

                    <Card style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: isDark ? 0.3 : 0.1,
                        shadowRadius: 12,
                        elevation: 8,
                    }}>
                        <CardHeader>
                            <CardTitle style={{ textAlign: 'center' }}>Sign In</CardTitle>
                            <CardDescription style={{ textAlign: 'center' }}>
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <View style={{
                                    padding: 16,
                                    marginBottom: 24,
                                    backgroundColor: colors.error + '15',
                                    borderWidth: 1,
                                    borderColor: colors.error + '40',
                                    borderRadius: 12,
                                }}>
                                    <Text style={{ fontSize: 14, color: colors.error, fontWeight: '500' }}>{error}</Text>
                                </View>
                            )}

                            <View style={{ gap: 24 }}>
                                <View style={{ gap: 12 }}>
                                    <Label style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Email</Label>
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

                                <View style={{ gap: 12 }}>
                                    <Label style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Password</Label>
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
                                        loadingText="Signing in..."
                                        variant="default"
                                        size="lg"
                                    >
                                        Sign In
                                    </LoadingButton>
                                </View>

                                {/* Register link commented out */}
                                {/* <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingTop: 16 }}>
                                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                                        Don't have an account?{' '}
                                    </Text>
                                    <Link href="/(auth)/register" asChild>
                                        <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>
                                            Sign up
                                        </Text>
                                    </Link>
                                </View> */}
                            </View>
                        </CardContent>
                    </Card>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
