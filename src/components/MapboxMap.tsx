import { useEffect, useMemo, useRef } from 'react';
import Map, { Layer, MapRef, Source } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Segment } from '@/types';

interface MapboxMapProps {
  segments: Segment[];
  className?: string;
}

const MapboxMap = ({ segments, className }: MapboxMapProps) => {
  // Default center (Recife)
  const defaultCenter = { longitude: -34.8556378, latitude: -7.9845551 };
  const mapRef = useRef<MapRef | null>(null);

  const visibleSegments = useMemo(
    () => segments.filter((segment) => !segment.parent_segment_id),
    [segments]
  );

  const extractCoordinates = (geometry: any): number[][] => {
    if (!geometry?.coordinates) return [];

    if (geometry.type === 'LineString') {
      return geometry.coordinates;
    }

    if (geometry.type === 'MultiLineString') {
      return geometry.coordinates.flat();
    }

    if (geometry.type === 'Point') {
      return [geometry.coordinates];
    }

    return [];
  };

  // Convert segments to GeoJSON
  const geojsonData = useMemo(() => ({
    type: 'FeatureCollection',
    features: visibleSegments.map(segment => ({
      type: 'Feature',
      properties: {
        id: segment.id,
        name: segment.name,
        type: segment.type
      },
      geometry: segment.geometry
    }))
  }), [visibleSegments]);

  const bounds = useMemo(() => {
    const coordinates = visibleSegments.flatMap((segment) =>
      extractCoordinates(segment.geometry)
    );

    if (coordinates.length === 0) return null;

    let minLng = coordinates[0][0];
    let minLat = coordinates[0][1];
    let maxLng = coordinates[0][0];
    let maxLat = coordinates[0][1];

    coordinates.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    });

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ] as [[number, number], [number, number]];
  }, [visibleSegments]);

  const layerStyle = {
    id: 'segments',
    type: 'line',
    paint: {
      'line-color': [
        'match',
        ['get', 'type'],
        'Ciclovia', '#3b82f6',
        'Ciclofaixa', '#8b5cf6',
        'Ciclorrota', '#10b981',
        'Compartilhada', '#ef4444',
        '#6b7280'
      ],
      'line-width': 3
    }
  };

  useEffect(() => {
    if (!mapRef.current || !bounds) return;

    mapRef.current.fitBounds(bounds, {
      padding: 48,
      duration: 800,
      maxZoom: 16,
    });
  }, [bounds]);

  return (
    <div className={className}>
      {import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ? (
        <Map
          ref={mapRef}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
          initialViewState={{
            ...defaultCenter,
            zoom: 13
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {visibleSegments.length > 0 && (
            <Source id="segments-source" type="geojson" data={geojsonData}>
              <Layer {...layerStyle} />
            </Source>
          )}
        </Map>
      ) : (
        <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">Token do Mapbox não configurado</p>
            <p className="text-sm">Adicione VITE_MAPBOX_ACCESS_TOKEN no arquivo .env</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
