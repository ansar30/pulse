'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare, FolderKanban, Settings, LogOut, Shield, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppName } from '@/components/app-name';

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Chat', href: '/chat', icon: MessageSquare },
        { name: 'Projects', href: '/projects', icon: FolderKanban },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    // Add Admin links for Super Admins (both Admin and Super Admin)
    const adminNav = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'
        ? [
            { name: 'Admin', href: '/admin', icon: Shield },
            ...(user?.role === 'SUPER_ADMIN' ? [{ name: 'Super Admin', href: '/empire', icon: Crown }] : [])
          ]
        : [];

    const allNavigation = [...navigation, ...adminNav];

    return (
        <div className={cn("flex flex-col w-full h-full bg-[#1e1e2e] dark:bg-[#0f0f1a] text-white border-r border-[#2d2d44]", className)}>
            <div className="flex items-center h-16 px-6 border-b border-[#2d2d44]">
                <AppName variant="gradient" size="md" className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent" />
            </div>

            <nav className="flex-1 px-3 py-6 space-y-1">
                {allNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href}>
                            <div
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'text-gray-400 hover:bg-[#2d2d44] hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                <span className="font-medium">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#2d2d44]">
                <div className="flex items-center mb-4 p-3 rounded-xl bg-[#2d2d44]/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                        {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{user?.profile?.firstName} {user?.profile?.lastName}</div>
                        <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2d2d44] rounded-xl transition-all"
                    onClick={logout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
