'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { AppName } from '@/components/app-name';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-background">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex lg:flex-shrink-0">
                    <div className="w-64">
                        <Sidebar />
                    </div>
                </aside>

                {/* Mobile Sidebar */}
                <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

                {/* Main Content */}
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    {/* Mobile Header */}
                    <header className="lg:hidden flex items-center justify-between px-4 h-16 border-b bg-background z-30">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileSidebarOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <div className="flex items-center space-x-2">
                            <AppName variant="gradient" size="md" />
                        </div>
                        <div className="w-10" /> {/* Spacer for centering */}
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto bg-background">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
