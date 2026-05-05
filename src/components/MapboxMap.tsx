import { useEffect, useMemo, useRef } from 'react';
import Map, { Layer, MapRef, Source } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Segment } from '@/types';
import { SEGMENT_TYPE_COLORS } from '@/utils/segmentBadgeStyles';

interface MapboxMapProps {
  segments: Segment[];
  className?: string;
  focusGeometry?: any;
}

const MapboxMap = ({ segments, className, focusGeometry }: MapboxMapProps) => {
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

  const focusGeoJson = useMemo(() => {
    if (!focusGeometry) return null;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { id: "focused-segment" },
          geometry: focusGeometry,
        },
      ],
    };
  }, [focusGeometry]);

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

  const focusBounds = useMemo(() => {
    if (!focusGeometry) return null;
    const coordinates = extractCoordinates(focusGeometry);
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
  }, [focusGeometry]);

  const layerStyle = {
    id: 'segments',
    type: 'line',
    paint: {
      'line-color': [
        'match',
        ['get', 'type'],
        'Ciclovia', SEGMENT_TYPE_COLORS.Ciclovia,
        'Ciclofaixa', SEGMENT_TYPE_COLORS.Ciclofaixa,
        'Ciclorrota', SEGMENT_TYPE_COLORS.Ciclorrota,
        'Compartilhada', SEGMENT_TYPE_COLORS.Compartilhada,
        '#6b7280'
      ],
      'line-width': 3
    }
  };

  const focusOutlineLayer = {
    id: "focus-outline",
    type: "line",
    paint: {
      "line-color": "#ffffff",
      "line-width": 10,
      "line-opacity": 0.95,
    },
  };

  const focusLayer = {
    id: "focus-highlight",
    type: "line",
    paint: {
      "line-color": "#f59e0b",
      "line-width": 6,
      "line-opacity": 0.98,
    },
  };

  useEffect(() => {
    if (!mapRef.current || !bounds) return;

    mapRef.current.fitBounds(bounds, {
      padding: 48,
      duration: 800,
      maxZoom: 16,
    });
  }, [bounds]);

  useEffect(() => {
    if (!mapRef.current || !focusBounds) return;
    mapRef.current.fitBounds(focusBounds, {
      padding: 80,
      duration: 700,
      maxZoom: 18,
    });
  }, [focusBounds]);

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
          {focusGeoJson && (
            <Source id="focus-source" type="geojson" data={focusGeoJson as any}>
              <Layer {...(focusOutlineLayer as any)} />
              <Layer {...(focusLayer as any)} />
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
