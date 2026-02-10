'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@cp/firebase';

function HomePage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.replace('/tasks');
            } else {
                router.replace('/login');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
        </div>
    );
}

export default function Page() {
    return (
        <AuthProvider>
            <HomePage />
        </AuthProvider>
    );
}
