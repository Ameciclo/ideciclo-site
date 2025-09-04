import { useEffect, useRef, useMemo } from "react";
import Map, { Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Segment } from "@/types";
import type { MapRef } from "react-map-gl";

interface CityMapProps {
  segments: Segment[];
  className?: string;
  containerWidth?: number;
}

const CityMap = ({ segments, className, containerWidth }: CityMapProps) => {
  const mapRef = useRef<MapRef>(null);
  const defaultCenter = { longitude: -34.8556378, latitude: -7.9845551 };

  // Filter out child segments for map display
  const visibleSegments = segments.filter(segment => !segment.parent_segment_id);

  // Create GeoJSON data for segments
  const geojsonData = useMemo(() => {
    const features = visibleSegments.map((segment) => {
      const colorMap = {
        Ciclovia: "#0000ff",
        Ciclofaixa: "#800080", 
        Ciclorrota: "#008000",
        Compartilhada: "#ff0000",
      };

      return {
        type: "Feature" as const,
        properties: {
          id: segment.id,
          type: segment.type,
          color: colorMap[segment.type] || "#808080"
        },
        geometry: segment.geometry
      };
    });

    return {
      type: "FeatureCollection" as const,
      features
    };
  }, [visibleSegments]);

  // Fit bounds when segments change
  useEffect(() => {
    if (!mapRef.current || visibleSegments.length === 0) return;

    const timer = setTimeout(() => {
      const allCoords: [number, number][] = [];

      visibleSegments.forEach((segment) => {
        const geom = segment.geometry;

        if (geom.type === "LineString") {
          allCoords.push(...geom.coordinates as [number, number][]);
        } else if (geom.type === "MultiLineString") {
          geom.coordinates.forEach((line) => {
            allCoords.push(...line as [number, number][]);
          });
        } else if (geom.type === "Polygon") {
          geom.coordinates.forEach((ring) => {
            allCoords.push(...ring as [number, number][]);
          });
        }
      });

      if (allCoords.length > 0) {
        const lngs = allCoords.map(coord => coord[0]);
        const lats = allCoords.map(coord => coord[1]);
        
        const bounds = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)]
        ] as [[number, number], [number, number]];

        mapRef.current?.fitBounds(bounds, { padding: 20 });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [visibleSegments, containerWidth]);

  return (
    <div className={className}>
      <Map
        ref={mapRef}
        initialViewState={{
          ...defaultCenter,
          zoom: 13
        }}
        style={{ width: "100%", height: "384px" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"}
        className="w-full h-96 rounded shadow"
      >
        <Source id="segments" type="geojson" data={geojsonData}>
          <Layer
            id="segments-line"
            type="line"
            paint={{
              "line-color": ["get", "color"],
              "line-width": 3,
              "line-opacity": 0.8
            }}
          />
        </Source>
      </Map>
    </div>
  );
};

export default CityMap;