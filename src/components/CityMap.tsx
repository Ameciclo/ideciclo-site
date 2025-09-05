import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Segment } from '@/types';
import { useMemo } from 'react';

interface CityMapProps {
  segments: Segment[];
  className?: string;
  containerWidth?: number;
}

const CityMap = ({ segments, className }: CityMapProps) => {
  const defaultCenter = { longitude: -34.8556378, latitude: -7.9845551 };
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Filter visible segments
  const visibleSegments = useMemo(() => 
    segments?.filter(segment => !segment.parent_segment_id) || [], 
    [segments]
  );

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

  if (!segments || !Array.isArray(segments)) {
    return (
      <div className={className}>
        <div className="w-full h-96 rounded shadow bg-gray-100 flex items-center justify-center">
          <p>Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={className}>
        <div className="w-full h-96 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">Token do Mapbox não configurado</p>
            <p className="text-sm">Adicione VITE_MAPBOX_ACCESS_TOKEN no arquivo .env</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Map
        mapboxAccessToken={token}
        initialViewState={{
          ...defaultCenter,
          zoom: 13
        }}
        style={{ width: '100%', height: '384px' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {visibleSegments.length > 0 && (
          <Source id="segments-source" type="geojson" data={geojsonData}>
            <Layer {...layerStyle} />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default CityMap;