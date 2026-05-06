import Map, { Layer, NavigationControl, Source } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMemo } from "react";

import type { Segment } from "@/types";

interface CityMapProps {
  segments: Segment[];
  className?: string;
  containerWidth?: number;
}

const CityMap = ({ segments, className }: CityMapProps) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Filter visible segments
  const visibleSegments = useMemo(() => 
    segments?.filter(segment => !segment.parent_segment_id) || [], 
    [segments]
  );

  // Convert segments to GeoJSON
  const geojsonData = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: visibleSegments.map((segment) => ({
        type: "Feature" as const,
        properties: {
          id: segment.id,
          name: segment.name,
          type: segment.type,
        },
        geometry: segment.geometry,
      })),
    }),
    [visibleSegments]
  );

  const extractLineCoordinates = (geometry: unknown): number[][] => {
    if (!geometry || typeof geometry !== "object" || !("type" in geometry)) {
      return [];
    }

    const typedGeometry = geometry as { type?: string; coordinates?: unknown };

    if (typedGeometry.type === "LineString" && Array.isArray(typedGeometry.coordinates)) {
      return typedGeometry.coordinates.filter(
        (coordinate): coordinate is number[] =>
          Array.isArray(coordinate) &&
          coordinate.length >= 2 &&
          typeof coordinate[0] === "number" &&
          typeof coordinate[1] === "number"
      );
    }

    if (typedGeometry.type === "MultiLineString" && Array.isArray(typedGeometry.coordinates)) {
      return typedGeometry.coordinates.flatMap((line) =>
        Array.isArray(line)
          ? line.filter(
              (coordinate): coordinate is number[] =>
                Array.isArray(coordinate) &&
                coordinate.length >= 2 &&
                typeof coordinate[0] === "number" &&
                typeof coordinate[1] === "number"
            )
          : []
      );
    }

    return [];
  };

  const bounds = useMemo(() => {
    const coordinates = visibleSegments.flatMap((segment) =>
      extractLineCoordinates(segment.geometry)
    );

    if (coordinates.length < 2) return null;

    const [firstLng, firstLat] = coordinates[0];
    let minLng = firstLng;
    let maxLng = firstLng;
    let minLat = firstLat;
    let maxLat = firstLat;

    for (const [lng, lat] of coordinates) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }

    const lngPadding = Math.max((maxLng - minLng) * 0.12, 0.003);
    const latPadding = Math.max((maxLat - minLat) * 0.12, 0.003);

    return [
      [minLng - lngPadding, minLat - latPadding],
      [maxLng + lngPadding, maxLat + latPadding],
    ] as [[number, number], [number, number]];
  }, [visibleSegments]);

  const layerStyle = {
    id: "segments",
    type: "line" as const,
    paint: {
      "line-color": [
        "match",
        ["get", "type"],
        "Ciclovia",
        "#3b82f6",
        "Ciclofaixa",
        "#8b5cf6",
        "Ciclorrota",
        "#10b981",
        "Compartilhada",
        "#ef4444",
        "#6b7280",
      ],
      "line-width": 3,
    },
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
        initialViewState={
          bounds
            ? {
                bounds,
                fitBoundsOptions: {
                  padding: 42,
                },
              }
            : {
                longitude: -34.8556378,
                latitude: -7.9845551,
                zoom: 13,
              }
        }
        style={{ width: "100%", height: "384px" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        scrollZoom={false}
      >
        <NavigationControl position="top-right" showCompass={false} />
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
