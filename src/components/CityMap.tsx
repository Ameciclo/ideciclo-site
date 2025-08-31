
import {
  MapContainer,
  TileLayer,
  Polyline,
  Polygon,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression, LatLngBounds } from "leaflet";
import { Segment } from "@/types";
import { useEffect } from "react";

interface CityMapProps {
  segments: Segment[];
  className?: string;
  containerWidth?: number; // Add this to trigger re-render when splitter changes
}

interface FitBoundsProps {
  segments: Segment[];
  containerWidth?: number;
}

const FitBounds = ({ segments, containerWidth }: FitBoundsProps) => {
  const map = useMap();

  useEffect(() => {
    if (!segments || segments.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
        
        const allCoords: LatLngExpression[] = [];
        const visibleSegments = segments.filter(segment => !segment.parent_segment_id);

        visibleSegments.forEach((segment) => {
          const geom = segment.geometry;
          if (!geom || !geom.coordinates) return;

          if (geom.type === "LineString") {
            allCoords.push(
              ...geom.coordinates.map(
                (coord) => [coord[1], coord[0]] as LatLngExpression
              )
            );
          } else if (geom.type === "MultiLineString") {
            geom.coordinates.forEach((line) => {
              allCoords.push(
                ...line.map((coord) => [coord[1], coord[0]] as LatLngExpression)
              );
            });
          } else if (geom.type === "Polygon") {
            geom.coordinates.forEach((ring) => {
              allCoords.push(
                ...ring.map((coord) => [coord[1], coord[0]] as LatLngExpression)
              );
            });
          }
        });

        if (allCoords.length > 0) {
          const bounds = new LatLngBounds(allCoords);
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (error) {
        console.error("Error in FitBounds:", error);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [segments, containerWidth, map]);

  return null;
};

const CityMap = ({ segments, className, containerWidth }: CityMapProps) => {
  const defaultCenter: LatLngExpression = [-7.9845551, -34.8556378];

  // Debug removed

  // Safety check
  if (!segments || !Array.isArray(segments)) {
    // No segments or invalid segments
    return (
      <div className={className}>
        <div className="w-full h-96 rounded shadow bg-gray-100 flex items-center justify-center">
          <p>Carregando mapa...</p>
        </div>
      </div>
    );
  }

  // Filter out child segments for map display - only show parent merged segments or non-merged segments
  const visibleSegments = segments.filter(segment => !segment.parent_segment_id);

  return (
    <div className={className}>
      <MapContainer
        className="w-full h-96 rounded shadow"
        center={defaultCenter}
        zoom={13}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {visibleSegments.map((segment) => {
          try {
            const geom = segment.geometry;
            if (!geom || !geom.type || !geom.coordinates) {
              console.warn("Invalid geometry for segment", segment.id);
              return null;
            }

            const colorMap = {
              Ciclovia: "blue",
              Ciclofaixa: "purple",
              Ciclorrota: "green",
              Compartilhada: "red",
            };

            const color = colorMap[segment.type] || "gray";

            if (geom.type === "LineString") {
              const coordinates = geom.coordinates.map(
                (coord: number[]) => [coord[1], coord[0]] as LatLngExpression
              );

              return (
                <Polyline
                  key={segment.id}
                  positions={coordinates}
                  pathOptions={{ color }}
                />
              );
            } else if (geom.type === "MultiLineString") {
              return geom.coordinates.map((line: number[][], idx: number) => {
                const coordinates = line.map(
                  (coord: number[]) => [coord[1], coord[0]] as LatLngExpression
                );

                return (
                  <Polyline
                    key={`${segment.id}-${idx}`}
                    positions={coordinates}
                    pathOptions={{ color }}
                  />
                );
              });
            } else if (geom.type === "Polygon") {
              const coordinates = geom.coordinates.map((ring: number[][]) =>
                ring.map(
                  (coord: number[]) => [coord[1], coord[0]] as LatLngExpression
                )
              );

              return (
                <Polygon
                  key={segment.id}
                  positions={coordinates}
                  pathOptions={{ color: "green" }}
                />
              );
            }
            return null;
          } catch (error) {
            console.error("Invalid geometry for segment", segment.id, error);
            return null;
          }
        })}
        <FitBounds segments={segments} containerWidth={containerWidth} />
      </MapContainer>
    </div>
  );
};

export default CityMap;
