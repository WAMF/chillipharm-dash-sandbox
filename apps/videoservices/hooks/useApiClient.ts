'use client';

import { useMemo } from 'react';
import { useAuth } from '@cp/firebase';
import { createVideoservicesApiClient } from '../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_VS_API_URL || '';

export function useApiClient() {
    const { getIdToken } = useAuth();

    const client = useMemo(() => {
        return createVideoservicesApiClient({
            baseUrl: API_BASE_URL,
            getAuthToken: async () => {
                try {
                    return await getIdToken();
                } catch {
                    return null;
                }
            },
        });
    }, [getIdToken]);

    return client;
}
