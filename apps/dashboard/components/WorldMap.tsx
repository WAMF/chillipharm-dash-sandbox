'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
    resolveAllCoordinates,
    getCountryCoordinates,
} from '@cp/data-processing';

interface CountryData {
    country: string;
    count: number;
}

interface WorldMapProps {
    countryData: CountryData[];
    onCountryClick?: (country: string) => void;
}

const MapContainerWithNoSSR = dynamic(
    () => import('react-leaflet').then(module_ => module_.MapContainer),
    { ssr: false }
);

const TileLayerWithNoSSR = dynamic(
    () => import('react-leaflet').then(module_ => module_.TileLayer),
    { ssr: false }
);

const MarkerWithNoSSR = dynamic(
    () => import('react-leaflet').then(module_ => module_.Marker),
    { ssr: false }
);

const PopupWithNoSSR = dynamic(
    () => import('react-leaflet').then(module_ => module_.Popup),
    { ssr: false }
);

function MapMarker({
    country,
    count,
    coords,
    maxCount,
    onClick,
}: {
    country: string;
    count: number;
    coords: { lat: number; lng: number };
    maxCount: number;
    onClick?: () => void;
}) {
    const [L, setL] = useState<typeof import('leaflet') | null>(null);

    useEffect(() => {
        import('leaflet').then(setL);
    }, []);

    const icon = useMemo(() => {
        if (!L) return undefined;

        const minSize = 24;
        const maxSize = 48;
        const ratio = count / maxCount;
        const size = minSize + ratio * (maxSize - minSize);
        const intensity = Math.min(count / maxCount, 1);
        const opacity = 0.6 + intensity * 0.4;

        return L.divIcon({
            className: 'custom-marker',
            html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: rgba(200, 16, 46, ${opacity});
          border: 2px solid rgba(200, 16, 46, 1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: ${size > 32 ? '12px' : '10px'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${count}
        </div>
      `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    }, [L, count, maxCount]);

    if (!L || !icon) return null;

    return (
        <MarkerWithNoSSR
            position={[coords.lat, coords.lng]}
            icon={icon}
            eventHandlers={{
                click: () => onClick?.(),
            }}
        >
            <PopupWithNoSSR>
                <div style={{ textAlign: 'center', padding: '4px' }}>
                    <strong style={{ fontSize: '14px', color: '#1f2937' }}>
                        {country}
                    </strong>
                    <br />
                    <span
                        style={{
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#c8102e',
                        }}
                    >
                        {count.toLocaleString()}
                    </span>
                    <br />
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                        records
                    </span>
                </div>
            </PopupWithNoSSR>
        </MarkerWithNoSSR>
    );
}

export function WorldMap({ countryData, onCountryClick }: WorldMapProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [coordinatesResolved, setCoordinatesResolved] = useState(false);
    const [mounted, setMounted] = useState(false);
    const previousCountryDataRef = useRef<string>('');

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const currentDataString = JSON.stringify(
            countryData.map(c => c.country)
        );
        if (currentDataString === previousCountryDataRef.current) return;
        previousCountryDataRef.current = currentDataString;

        async function loadCoordinates() {
            if (countryData.length === 0) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const countries = countryData.map(c => c.country);
                await resolveAllCoordinates(countries);
                setCoordinatesResolved(true);
            } catch (error) {
                console.error('Failed to resolve country coordinates:', error);
                setCoordinatesResolved(true);
            } finally {
                setIsLoading(false);
            }
        }

        loadCoordinates();
    }, [countryData]);

    const maxCount = useMemo(
        () => Math.max(...countryData.map(c => c.count), 1),
        [countryData]
    );

    const totalRecords = useMemo(
        () => countryData.reduce((sum, c) => sum + c.count, 0),
        [countryData]
    );

    const activeCountries = countryData.length;

    const mappedCountries = useMemo(() => {
        if (!coordinatesResolved) return [];
        return countryData.filter(
            c => getCountryCoordinates(c.country) !== null
        );
    }, [countryData, coordinatesResolved]);

    const unmappedCountries = useMemo(() => {
        if (!coordinatesResolved) return [];
        return countryData.filter(
            c => getCountryCoordinates(c.country) === null
        );
    }, [countryData, coordinatesResolved]);

    const handleCountryClick = useCallback(
        (country: string) => {
            onCountryClick?.(country);
        },
        [onCountryClick]
    );

    if (!mounted) {
        return (
            <div className="flex flex-col gap-4">
                <div className="h-[400px] bg-neutral-100 rounded-lg animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end gap-6">
                <div className="flex flex-col items-center px-4 py-2 bg-neutral-50 rounded-md">
                    <span className="text-xl font-bold text-chilli-red">
                        {activeCountries}
                    </span>
                    <span className="text-[0.7rem] text-neutral-500 uppercase tracking-wide">
                        Countries
                    </span>
                </div>
                <div className="flex flex-col items-center px-4 py-2 bg-neutral-50 rounded-md">
                    <span className="text-xl font-bold text-chilli-red">
                        {totalRecords.toLocaleString()}
                    </span>
                    <span className="text-[0.7rem] text-neutral-500 uppercase tracking-wide">
                        Total Records
                    </span>
                </div>
            </div>

            <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-neutral-200">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-[1000] gap-2">
                        <div className="w-6 h-6 border-3 border-neutral-200 border-t-chilli-red rounded-full animate-spin" />
                        <span className="text-sm text-neutral-600">
                            Loading locations...
                        </span>
                    </div>
                )}
                <MapContainerWithNoSSR
                    center={[20, 0]}
                    zoom={2}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayerWithNoSSR
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    {coordinatesResolved &&
                        mappedCountries.map(({ country, count }) => {
                            const coords = getCountryCoordinates(country);
                            if (!coords) return null;
                            return (
                                <MapMarker
                                    key={country}
                                    country={country}
                                    count={count}
                                    coords={coords}
                                    maxCount={maxCount}
                                    onClick={() => handleCountryClick(country)}
                                />
                            );
                        })}
                </MapContainerWithNoSSR>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
                {countryData.map(({ country, count }) => {
                    const isUnmapped =
                        coordinatesResolved &&
                        getCountryCoordinates(country) === null;
                    return (
                        <div
                            key={country}
                            className={`flex items-center gap-2 px-2 py-1.5 bg-neutral-50 rounded ${isUnmapped ? 'opacity-70' : ''}`}
                        >
                            <span className="text-xs text-neutral-700 min-w-[100px] flex-shrink-0">
                                {country}
                                {isUnmapped && (
                                    <span
                                        className="text-orange-500 font-bold ml-1"
                                        title="Location not mapped"
                                    >
                                        *
                                    </span>
                                )}
                            </span>
                            <div className="flex-1 h-1.5 bg-neutral-200 rounded overflow-hidden">
                                <div
                                    className="h-full bg-chilli-red rounded transition-all duration-300"
                                    style={{
                                        width: `${(count / maxCount) * 100}%`,
                                    }}
                                />
                            </div>
                            <span className="text-xs font-semibold text-neutral-600 min-w-[40px] text-right">
                                {count.toLocaleString()}
                            </span>
                        </div>
                    );
                })}
            </div>

            {coordinatesResolved && unmappedCountries.length > 0 && (
                <div className="text-[0.7rem] text-neutral-500 italic text-center">
                    * {unmappedCountries.length} location
                    {unmappedCountries.length > 1 ? 's' : ''} not shown on map
                </div>
            )}
        </div>
    );
}
