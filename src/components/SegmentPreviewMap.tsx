import Map, { Layer, NavigationControl, Source } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import type { Segment } from "@/types";

interface SegmentPreviewMapProps {
  segment: Segment;
  className?: string;
}

const defaultCenter = { longitude: -34.8556378, latitude: -7.9845551, zoom: 13 };

const getSegmentColor = (type: Segment["type"]) => {
  switch (type) {
    case "Ciclovia":
      return "#3b82f6";
    case "Ciclofaixa":
      return "#8b5cf6";
    case "Ciclorrota":
      return "#10b981";
    case "Compartilhada":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

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

const getBounds = (coordinates: number[][]) => {
  if (coordinates.length === 0) {
    return null;
  }

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

  const lngPadding = Math.max((maxLng - minLng) * 0.15, 0.0015);
  const latPadding = Math.max((maxLat - minLat) * 0.15, 0.0015);

  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding],
  ] as [[number, number], [number, number]];
};

const SegmentPreviewMap = ({ segment, className }: SegmentPreviewMapProps) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const coordinates = extractLineCoordinates(segment.geometry);
  const bounds = getBounds(coordinates);
  const hasValidGeometry = coordinates.length >= 2;

  const geojsonData = {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {
          id: segment.id,
          name: segment.name,
          type: segment.type,
        },
        geometry: segment.geometry,
      },
    ],
  };

  const layerStyle = {
    id: `segment-preview-${segment.id}`,
    type: "line" as const,
    paint: {
      "line-color": getSegmentColor(segment.type),
      "line-width": 5,
      "line-opacity": 0.9,
    },
  };

  if (!token) {
    return (
      <div className={className}>
        <div className="flex h-full min-h-[260px] items-center justify-center rounded-[24px] border-2 border-dashed border-slate-300 bg-slate-100 p-6 text-center text-slate-500">
          <div>
            <p className="text-base font-semibold">Token do Mapbox não configurado</p>
            <p className="mt-1 text-sm">Adicione `VITE_MAPBOX_ACCESS_TOKEN` para visualizar o mapa do trecho.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasValidGeometry || !bounds) {
    return (
      <div className={className}>
        <div className="flex h-full min-h-[260px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
          <div>
            <p className="text-base font-semibold">Geometria indisponível</p>
            <p className="mt-1 text-sm">Este trecho não possui coordenadas válidas para exibição no mapa.</p>
          </div>
        </div>
      </div>
    );
  }

  const initialViewState = {
    bounds,
    fitBoundsOptions: {
      padding: 42,
    },
  };

  return (
    <div className={className}>
      <Map
        key={segment.id}
        mapboxAccessToken={token}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        scrollZoom={false}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <Source id={`segment-preview-source-${segment.id}`} type="geojson" data={geojsonData}>
          <Layer {...layerStyle} />
        </Source>
      </Map>
    </div>
  );
};

export default SegmentPreviewMap;
