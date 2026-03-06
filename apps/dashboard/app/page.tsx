'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@cp/firebase';

function RedirectHandler() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            router.replace(user ? '/dashboard' : '/login');
        }
    }, [user, loading, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
            <div className="text-center">
                <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-neutral-500">Loading...</p>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <AuthProvider>
            <RedirectHandler />
        </AuthProvider>
    );
}
