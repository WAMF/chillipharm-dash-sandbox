'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { VSAsset, AssetFilters } from '@cp/types';

import { useApiClient } from '../../hooks/useApiClient';
import { AssetFilterBar } from './AssetFilterBar';
import { AssetCard } from './AssetCard';

interface AssetPickerProps {
    siteId: string;
    selectedAssetIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
}

export function AssetPicker({
    siteId,
    selectedAssetIds,
    onSelectionChange,
}: AssetPickerProps) {
    const apiClient = useApiClient();
    const [allAssets, setAllAssets] = useState<VSAsset[]>([]);
    const [filteredAssets, setFilteredAssets] = useState<VSAsset[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const requestCounterRef = useRef(0);

    useEffect(() => {
        let cancelled = false;

        async function loadAllAssets() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.sites.getAssets(siteId);
                if (!cancelled) {
                    setAllAssets(response.assets);
                    setFilteredAssets(response.assets);
                }
            } catch {
                if (!cancelled) {
                    setError('Failed to load assets');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadAllAssets();
        return () => {
            cancelled = true;
        };
    }, [apiClient, siteId]);

    const handleFiltersChange = useCallback(
        async (filters: AssetFilters) => {
            requestCounterRef.current += 1;
            const thisRequest = requestCounterRef.current;

            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.sites.getAssets(
                    siteId,
                    filters
                );
                if (thisRequest === requestCounterRef.current) {
                    setFilteredAssets(response.assets);
                }
            } catch {
                if (thisRequest === requestCounterRef.current) {
                    setError('Failed to filter assets');
                }
            } finally {
                if (thisRequest === requestCounterRef.current) {
                    setIsLoading(false);
                }
            }
        },
        [apiClient, siteId]
    );

    const handleToggle = useCallback(
        (assetId: string) => {
            const next = new Set(selectedAssetIds);
            if (next.has(assetId)) {
                next.delete(assetId);
            } else {
                next.add(assetId);
            }
            onSelectionChange(next);
        },
        [selectedAssetIds, onSelectionChange]
    );

    return (
        <div className="space-y-4">
            <AssetFilterBar
                allAssets={allAssets}
                onFiltersChange={handleFiltersChange}
            />

            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 border-4 border-chilli-red border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-neutral-200 p-8 text-center">
                    <p className="text-sm text-neutral-500">
                        No assets match the current filters
                    </p>
                </div>
            ) : (
                <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
                        <span>
                            {filteredAssets.length} of {allAssets.length} assets
                        </span>
                        {selectedAssetIds.size > 0 && (
                            <span className="font-medium text-chilli-red">
                                {selectedAssetIds.size} selected
                            </span>
                        )}
                    </div>
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                        {filteredAssets.map((asset) => (
                            <AssetCard
                                key={asset.asset_id}
                                asset={asset}
                                selected={selectedAssetIds.has(asset.asset_id)}
                                onToggle={() => handleToggle(asset.asset_id)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
