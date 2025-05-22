import { MapContainer, TileLayer, Polyline, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";
import { Segment } from "@/types";

interface CityMapProps {
  segments: Segment[];
}

const CityMap = ({ segments }: CityMapProps) => {
  return (
    <div>
      <MapContainer
        className="w-full h-96 rounded shadow"
        center={[-7.9845551, -34.8556378]}
        zoom={13}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default CityMap;
