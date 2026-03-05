'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@cp/firebase';

import { WorkflowProvider } from '../../contexts/WorkflowContext';
import { TaskProvider } from '../../contexts/TaskContext';
import { StagedFileProvider } from '../../contexts/StagedFileContext';

function TasksIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className || 'h-5 w-5'}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
        </svg>
    );
}

function WorkflowsIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className || 'h-5 w-5'}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
        </svg>
    );
}

function LogoutIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className || 'h-5 w-5'}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
        </svg>
    );
}

const NAV_ITEMS = [
    { href: '/tasks', label: 'Tasks', icon: TasksIcon },
    { href: '/admin', label: 'Workflows', icon: WorkflowsIcon },
];

function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 bg-white border-r border-neutral-200">
            <div className="flex items-center h-16 px-6 border-b border-neutral-200">
                <Link href="/tasks">
                    <span className="text-xl font-bold text-chilli-red">Video Services</span>
                </Link>
            </div>
            <nav className="flex-1 py-4 px-3">
                {NAV_ITEMS.map(item => {
                    const isActive =
                        item.href === '/tasks'
                            ? pathname === '/tasks' || pathname.startsWith('/tasks/')
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-1 ${
                                isActive
                                    ? 'bg-chilli-red/10 text-chilli-red'
                                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-3 border-t border-neutral-200">
                <div className="px-3 py-2 mb-2">
                    <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                >
                    <LogoutIcon className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

function MobileHeader() {
    return (
        <header className="md:hidden sticky top-0 z-50 border-b border-neutral-200 bg-white">
            <div className="flex h-14 items-center justify-center px-4">
                <Link href="/tasks">
                    <span className="text-xl font-bold text-chilli-red">Video Services</span>
                </Link>
            </div>
        </header>
    );
}

function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 safe-area-bottom">
            <div className="flex items-center justify-around h-16">
                {NAV_ITEMS.map(item => {
                    const isActive =
                        item.href === '/tasks'
                            ? pathname === '/tasks' || pathname.startsWith('/tasks/')
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                                isActive
                                    ? 'text-chilli-red'
                                    : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        >
                            <item.icon className="h-6 w-6" />
                            <span className="text-xs mt-1 font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-screen bg-neutral-50 overflow-hidden">
            <Sidebar />
            <div className="md:pl-60 flex flex-col h-full">
                <MobileHeader />
                <main className="flex-1 flex flex-col px-4 py-6 pb-20 md:pb-6 md:px-6 lg:px-8 min-h-0 overflow-hidden">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
}

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <WorkflowProvider>
                <TaskProvider>
                    <StagedFileProvider>
                        <AppLayoutContent>{children}</AppLayoutContent>
                    </StagedFileProvider>
                </TaskProvider>
            </WorkflowProvider>
        </AuthProvider>
    );
}
