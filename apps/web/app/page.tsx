import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppName } from '@/components/app-name';
import { appConfig } from '@/lib/app-config';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AppName variant="gradient" size="lg" />
                    </div>
                    <nav className="flex items-center space-x-4">
                        <Link href="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button>Get Started</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
                <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                        {appConfig.tagline}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
                        {appConfig.description}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
                        <Link href="/register" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 shadow-lg hover:shadow-xl transition-all">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 border-2 hover:shadow-md transition-all">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mt-12 sm:mt-16 lg:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <div className="group p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border-2 border-transparent hover:border-primary/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                            <svg
                                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors">Lightning Fast</h3>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Built with Next.js and optimized for performance. Your users will love the speed.
                        </p>
                    </div>

                    <div className="group p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border-2 border-transparent hover:border-primary/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                            <svg
                                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors">Secure by Default</h3>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Enterprise-grade security with JWT authentication and tenant isolation.
                        </p>
                    </div>

                    <div className="group p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border-2 border-transparent hover:border-primary/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 md:col-span-2 lg:col-span-1">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                            <svg
                                className="w-6 h-6 sm:w-7 sm:h-7 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-primary transition-colors">Scalable Architecture</h3>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            Multi-tenant architecture that scales with your business needs.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
