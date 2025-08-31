import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Segment } from '@/types';

interface MapboxMapProps {
  segments: Segment[];
  className?: string;
}

const MapboxMap = ({ segments, className }: MapboxMapProps) => {
  // Default center (Recife)
  const defaultCenter = { longitude: -34.8556378, latitude: -7.9845551 };

  // Convert segments to GeoJSON
  const geojsonData = {
    type: 'FeatureCollection',
    features: segments.map(segment => ({
      type: 'Feature',
      properties: {
        id: segment.id,
        name: segment.name,
        type: segment.type
      },
      geometry: segment.geometry
    }))
  };

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

  return (
    <div className={className}>
      {import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ? (
        <Map
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
          initialViewState={{
            ...defaultCenter,
            zoom: 13
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {segments.length > 0 && (
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