<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { resolveAllCoordinates, getCountryCoordinates } from '../utils/countryCoordinates';

  export let countryData: Array<{ country: string; count: number }> = [];

  let mapContainer: HTMLDivElement;
  let map: L.Map | null = null;
  let markersLayer: L.LayerGroup | null = null;
  let coordinatesResolved = false;
  let isLoading = true;

  $: maxCount = Math.max(...countryData.map(c => c.count), 1);
  $: totalRecords = countryData.reduce((sum, c) => sum + c.count, 0);
  $: activeCountries = countryData.length;
  $: mappedCountries = coordinatesResolved
    ? countryData.filter(c => getCountryCoordinates(c.country) !== null)
    : [];
  $: unmappedCountries = coordinatesResolved
    ? countryData.filter(c => getCountryCoordinates(c.country) === null)
    : [];

  function getMarkerSize(count: number): number {
    const minSize = 24;
    const maxSize = 48;
    const ratio = count / maxCount;
    return minSize + ratio * (maxSize - minSize);
  }

  function createMarkerIcon(count: number): L.DivIcon {
    const size = getMarkerSize(count);
    const intensity = Math.min(count / maxCount, 1);
    const opacity = 0.6 + intensity * 0.4;

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-container" style="
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
      iconAnchor: [size / 2, size / 2]
    });
  }

  function updateMarkers() {
    if (!map || !markersLayer || !coordinatesResolved) return;

    markersLayer.clearLayers();

    countryData.forEach(({ country, count }) => {
      const coords = getCountryCoordinates(country);
      if (coords) {
        const marker = L.marker([coords.lat, coords.lng], {
          icon: createMarkerIcon(count)
        });

        marker.bindPopup(`
          <div style="text-align: center; padding: 4px;">
            <strong style="font-size: 14px; color: #1f2937;">${country}</strong><br/>
            <span style="font-size: 18px; font-weight: 700; color: #c8102e;">${count.toLocaleString()}</span><br/>
            <span style="font-size: 11px; color: #6b7280;">records</span>
          </div>
        `, {
          closeButton: false,
          className: 'custom-popup'
        });

        marker.on('mouseover', function() {
          this.openPopup();
        });
        marker.on('mouseout', function() {
          this.closePopup();
        });

        markersLayer.addLayer(marker);
      }
    });

    const mappedData = countryData.filter(c => getCountryCoordinates(c.country) !== null);
    if (mappedData.length > 0 && map) {
      const bounds = mappedData
        .map(c => getCountryCoordinates(c.country))
        .filter((c): c is { lat: number; lng: number } => c !== null)
        .map(c => [c.lat, c.lng] as L.LatLngTuple);

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 4 });
      }
    }
  }

  function handleResize() {
    if (map) {
      setTimeout(() => {
        map?.invalidateSize();
      }, 100);
    }
  }

  async function loadCoordinates() {
    if (countryData.length === 0) {
      isLoading = false;
      return;
    }

    const countries = countryData.map(c => c.country);
    await resolveAllCoordinates(countries);
    coordinatesResolved = true;
    isLoading = false;
    updateMarkers();
  }

  onMount(() => {
    if (!mapContainer) return;

    map = L.map(mapContainer, {
      center: [20, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 6,
      scrollWheelZoom: true,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    loadCoordinates();

    window.addEventListener('resize', handleResize);
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
    if (map) {
      map.remove();
      map = null;
    }
  });

  $: if (map && markersLayer && countryData && countryData.length > 0) {
    coordinatesResolved = false;
    isLoading = true;
    loadCoordinates();
  }
</script>

<div class="world-map">
  <div class="map-header">
    <div class="map-stats">
      <div class="stat">
        <span class="stat-value">{activeCountries}</span>
        <span class="stat-label">Countries</span>
      </div>
      <div class="stat">
        <span class="stat-value">{totalRecords.toLocaleString()}</span>
        <span class="stat-label">Total Records</span>
      </div>
    </div>
  </div>

  <div class="map-container" bind:this={mapContainer}>
    {#if isLoading}
      <div class="map-loading">
        <span class="loading-spinner"></span>
        <span>Loading locations...</span>
      </div>
    {/if}
  </div>

  <div class="country-list">
    {#each countryData as { country, count }}
      <div class="country-item" class:unmapped={coordinatesResolved && !getCountryCoordinates(country)}>
        <span class="country-name">
          {country}
          {#if coordinatesResolved && !getCountryCoordinates(country)}
            <span class="unmapped-indicator" title="Location not mapped">*</span>
          {/if}
        </span>
        <div class="country-bar-container">
          <div
            class="country-bar"
            style="width: {(count / maxCount) * 100}%"
          ></div>
        </div>
        <span class="country-count">{count.toLocaleString()}</span>
      </div>
    {/each}
  </div>

  {#if coordinatesResolved && unmappedCountries.length > 0}
    <div class="unmapped-note">
      * {unmappedCountries.length} location{unmappedCountries.length > 1 ? 's' : ''} not shown on map
    </div>
  {/if}
</div>

<style>
  .world-map {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .map-header {
    display: flex;
    justify-content: flex-end;
  }

  .map-stats {
    display: flex;
    gap: 1.5rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    background: var(--neutral-50);
    border-radius: 0.375rem;
  }

  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--chilli-red);
  }

  .stat-label {
    font-size: 0.7rem;
    color: var(--neutral-500);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .map-container {
    width: 100%;
    height: 400px;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 1px solid var(--neutral-200);
    position: relative;
  }

  .map-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    z-index: 1000;
    gap: 0.5rem;
    color: var(--neutral-600);
    font-size: 0.875rem;
  }

  .loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--neutral-200);
    border-top-color: var(--chilli-red);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .country-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .country-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    background: var(--neutral-50);
    border-radius: 0.25rem;
  }

  .country-item.unmapped {
    opacity: 0.7;
  }

  .country-name {
    font-size: 0.75rem;
    color: var(--neutral-700);
    min-width: 100px;
    flex-shrink: 0;
  }

  .unmapped-indicator {
    color: var(--warning-orange);
    font-weight: bold;
  }

  .country-bar-container {
    flex: 1;
    height: 6px;
    background: var(--neutral-200);
    border-radius: 3px;
    overflow: hidden;
  }

  .country-bar {
    height: 100%;
    background: var(--chilli-red);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .country-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--neutral-600);
    min-width: 40px;
    text-align: right;
  }

  .unmapped-note {
    font-size: 0.7rem;
    color: var(--neutral-500);
    font-style: italic;
    text-align: center;
  }

  :global(.custom-marker) {
    background: transparent !important;
    border: none !important;
  }

  :global(.custom-marker .marker-container:hover) {
    transform: scale(1.1);
  }

  :global(.custom-popup .leaflet-popup-content-wrapper) {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :global(.custom-popup .leaflet-popup-tip) {
    background: white;
  }

  :global(.leaflet-control-attribution) {
    font-size: 9px;
  }

  @media (max-width: 640px) {
    .country-list {
      grid-template-columns: 1fr;
    }

    .map-stats {
      gap: 1rem;
    }

    .map-container {
      height: 300px;
    }
  }

  @media print {
    .map-container {
      height: 300px;
    }
  }
</style>
