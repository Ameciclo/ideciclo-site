import { MapContainer, TileLayer, Polyline, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";
import { Segment } from "@/types";

interface CityMapProps {
  segments: Segment[];
}

const CityMap = ({ segments }: CityMapProps) => {
  // const center: LatLngExpression = [-7.9845551, -34.8556378];

  return (
    <div>
      <MapContainer center={[-7.9845551, -34.8556378]} zoom={14}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default CityMap;
