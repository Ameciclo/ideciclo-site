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
}

const FitBounds = ({ segments }: { segments: Segment[] }) => {
  const map = useMap();

  const bounds = useMemo(() => {
    const allCoords: LatLngExpression[] = [];

    segments.forEach((segment) => {
      try {
        const geom = JSON.parse(segment.geometry);
        const coords = geom.coordinates.map(
          (coord: number[]) => [coord[1], coord[0]] as LatLngExpression
        );

        if (geom.type === "Polygon") {
          coords.forEach((ring: LatLngExpression) => allCoords.push(ring));
        } else {
          allCoords.push(...coords);
        }
      } catch (e) {
        console.error("Invalid geometry", e);
      }
    });

    return allCoords.length > 0 ? new LatLngBounds(allCoords) : null;
  }, [segments]);

  if (bounds) {
    map.fitBounds(bounds, { padding: [20, 20] });
  }

  return null;
};

const CityMap = ({ segments }: CityMapProps) => {
  const defaultCenter: LatLngExpression = [-7.9845551, -34.8556378];

  return (
    <div>
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
            console.log("seg", segment.geometry[0]);
            const geom = JSON.parse(segment.geometry);
            const coordinates = geom.coordinates.map(
              (coord: number[]) => [coord[1], coord[0]] as LatLngExpression
            );

            const color = segment.type === "Ciclovia" ? "blue" : "red";

            if (geom.type === "LineString") {
              return (
                <Polyline
                  key={segment.id}
                  positions={coordinates}
                  pathOptions={{ color }}
                />
              );
            } else if (geom.type === "Polygon") {
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
