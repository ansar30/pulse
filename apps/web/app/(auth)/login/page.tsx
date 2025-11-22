'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authApi } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authApi.login(formData);
            if (response.success && response.data) {
                setAuth(response.data.user, response.data.accessToken, response.data.refreshToken);
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
            <div className="w-full max-w-md">
                <div className="mb-6 sm:mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-primary mb-3 sm:mb-4">
                        <span className="text-xl sm:text-2xl font-bold text-primary-foreground">B</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Welcome back</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Sign in to continue to your account</p>
                </div>
                
                <Card className="border shadow-lg">
                    <CardHeader className="space-y-1 pb-4 sm:pb-6">
                        <CardTitle className="text-xl sm:text-2xl font-bold text-center">Sign In</CardTitle>
                        <CardDescription className="text-center text-sm">Enter your credentials to access your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            {error && (
                                <div className="p-3 sm:p-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="h-10 sm:h-11"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="h-10 sm:h-11"
                                    required
                                />
                            </div>

                            <LoadingButton 
                                type="submit" 
                                className="w-full h-10 sm:h-11 text-sm sm:text-base font-medium" 
                                loading={loading}
                                loadingText="Signing in..."
                            >
                                Sign In
                            </LoadingButton>

                            <div className="text-center text-xs sm:text-sm text-muted-foreground pt-2">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-primary font-medium hover:underline">
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
