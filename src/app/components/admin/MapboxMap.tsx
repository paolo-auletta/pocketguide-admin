'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
  cityCenter?: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

export function MapboxMap({
  latitude,
  longitude,
  onCoordinatesChange,
  cityCenter,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<unknown | null>(null);
  const marker = useRef<unknown | null>(null);
  const geocoder = useRef<unknown | null>(null);
  const mapboxglRef = useRef<unknown | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update marker position - memoized to avoid recreation
  const updateMarker = useCallback((lat: number, lng: number, shouldCenter = false) => {
    if (!map.current || !mapboxglRef.current) return;

    // Remove existing marker
    if (marker.current && typeof marker.current === 'object' && 'remove' in marker.current) {
      (marker.current as { remove: () => void }).remove();
    }

    // Create new marker element
    const el = document.createElement('div');
    el.className = 'w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center';
    el.innerHTML = '<div class="w-2 h-2 bg-white rounded-full"></div>';

    // Create marker using the stored mapboxgl reference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MapboxMarker = (mapboxglRef.current as any).Marker;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newMarker = new MapboxMarker({ element: el, draggable: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    marker.current = (newMarker as any).setLngLat([lng, lat]).addTo(map.current);

    // Only center/zoom when shouldCenter is true (e.g., from geocoder search or initial load)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (shouldCenter && typeof map.current === 'object' && map.current !== null && 'flyTo' in map.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map.current as any).flyTo({
        center: [lng, lat],
        zoom: 15,
        duration: 1000,
      });
    }
  }, []);

  // Fetch Mapbox token from environment
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setError('Mapbox token not configured. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.');
      setLoading(false);
      return;
    }
    setMapboxToken(token);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    const initializeMap = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapboxgl = await import('mapbox-gl');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const MapboxGeocoder = (await import('@mapbox/mapbox-gl-geocoder')).default;

        // Store mapboxgl reference for use in updateMarker
        mapboxglRef.current = mapboxgl.default;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapboxgl.default as any).accessToken = mapboxToken;

        // Determine initial center: use city center if available, otherwise use location coordinates
        const initialCenter: [number, number] = cityCenter
          ? [cityCenter.longitude, cityCenter.latitude]
          : [longitude || 0, latitude || 0];

        const initialZoom = cityCenter ? 13 : 12;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        map.current = new (mapboxgl.default as any).Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: initialCenter,
          zoom: initialZoom,
        });

        // Add navigation controls
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map.current as any).addControl(new (mapboxgl.default as any).NavigationControl(), 'top-right');

        // Initialize geocoder
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geocoder.current = new MapboxGeocoder({
          accessToken: mapboxToken,
          mapboxgl: mapboxgl.default,
          marker: false, // We'll manage our own marker
          placeholder: 'Search for a location...',
          proximity: initialCenter,
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map.current as any).addControl(geocoder.current, 'top-left');

        // Handle geocoder result
        if (geocoder.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (geocoder.current as any).on('result', (e: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = (e as any).result;
            if (result && result.geometry && result.geometry.coordinates) {
              const [lng, lat] = result.geometry.coordinates;
              updateMarker(lat, lng, true); // Zoom to geocoder search result
              onCoordinatesChange(lat, lng);
            }
          });
        }

        // Add click handler to map
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map.current as any).on('click', (e: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { lng, lat } = (e as any).lngLat;
          updateMarker(lat, lng, false); // Don't zoom when clicking on map
          onCoordinatesChange(lat, lng);
        });

        // Add initial marker if coordinates are set
        if (latitude !== 0 || longitude !== 0) {
          updateMarker(latitude, longitude, true); // Zoom to initial coordinates
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize map');
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map.current && typeof map.current === 'object' && 'remove' in map.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map.current as any).remove();
        map.current = null;
      }
    };
  }, [mapboxToken, cityCenter, updateMarker, latitude, longitude, onCoordinatesChange]);

  // Update marker when coordinates change from outside
  useEffect(() => {
    if (map.current && (latitude !== 0 || longitude !== 0)) {
      updateMarker(latitude, longitude, false); // Don't zoom when coordinates updated externally
    }
  }, [latitude, longitude, updateMarker]);

  if (error) {
    return (
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location Map
          {cityCenter && <span className="text-xs text-muted-foreground">({cityCenter.name})</span>}
        </Label>
        <p className="text-xs text-muted-foreground">
          Click on the map to set the location, or use the search box to find a specific place.
        </p>
      </div>

      <div className="relative w-full h-96 rounded-lg border border-input overflow-hidden bg-muted">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
              <p className="text-sm text-white">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="map-latitude">Latitude</Label>
          <Input
            id="map-latitude"
            type="number"
            step="0.000001"
            value={latitude}
            readOnly
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="map-longitude">Longitude</Label>
          <Input
            id="map-longitude"
            type="number"
            step="0.000001"
            value={longitude}
            readOnly
            className="bg-muted"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (cityCenter && map.current && typeof map.current === 'object' && 'flyTo' in map.current) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (map.current as any).flyTo({
                center: [cityCenter.longitude, cityCenter.latitude],
                zoom: 13,
                duration: 1000,
              });
            }
          }}
          disabled={!cityCenter}
        >
          Reset to City Center
        </Button>
      </div>
    </div>
  );
}
