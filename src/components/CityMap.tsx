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
}

interface FitBoundsProps {
  segments: Segment[];
}

const FitBounds = ({ segments }: FitBoundsProps) => {
  const map = useMap();

  useEffect(() => {
    const allCoords: LatLngExpression[] = [];

    segments.forEach((segment) => {
      const geom = segment.geometry;

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
  }, [segments, map]);

  return null;
};

const CityMap = ({ segments, className }: CityMapProps) => {
  const defaultCenter: LatLngExpression = [-7.9845551, -34.8556378];

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

        {segments.map((segment) => {
          try {
            const geom = segment.geometry;
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
            } else {
              return null;
            }
          } catch (error) {
            console.error("Invalid geometry for segment", segment.id, error);
            return null;
          }
        })}

        <FitBounds segments={segments} />
      </MapContainer>
    </div>
  );
};

export default CityMap;
