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
        const geom = segment.geometry;
        console.log(geom);

        if (geom.type === "Polygon") {
          geom.coordinates.forEach((ring: number[][]) => {
            ring.forEach((coord: number[]) => {
              allCoords.push([coord[1], coord[0]]);
            });
          });
        } else if (geom.type === "LineString") {
          geom.coordinates.forEach((coord: number[]) => {
            allCoords.push([coord[1], coord[0]]);
          });
        } else if (geom.type === "MultiLineString") {
          geom.coordinates.forEach((line: number[][]) => {
            line.forEach((coord: number[]) => {
              allCoords.push([coord[1], coord[0]]);
            });
          });
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

        <FitBounds segments={segments} />
      </MapContainer>
    </div>
  );
};

export default CityMap;
