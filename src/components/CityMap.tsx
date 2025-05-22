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
import { useMemo } from "react";

interface CityMapProps {
  segments: Segment[];
  className?: string;
}

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
            const color = segment.type === "Ciclovia" ? "blue" : "red";

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
              console.log("HERE");
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
      </MapContainer>
    </div>
  );
};

export default CityMap;
