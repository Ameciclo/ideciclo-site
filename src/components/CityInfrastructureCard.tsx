import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CityInfrastructureCardProps {
  cityName: string;
  stateName: string;
  city: {
    vias_estruturais_km?: number;
    vias_alimentadoras_km?: number;
    vias_locais_km?: number;
  };
  resetCityData: () => void;
}

export const CityInfrastructureCard = ({
  cityName,
  stateName,
  city,
  resetCityData,
}: CityInfrastructureCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {cityName}, {stateName}
            </CardTitle>
            <CardDescription>
              Dados da infraestrutura cicloviária
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetCityData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar dados
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-semibold text-gray-500">
              VIAS ESTRUTURAIS
            </h4>
            <p className="text-2xl font-bold">{city?.vias_estruturais_km} km</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-semibold text-gray-500">
              VIAS ALIMENTADORAS
            </h4>
            <p className="text-2xl font-bold">
              {city?.vias_alimentadoras_km} km
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-semibold text-gray-500">VIAS LOCAIS</h4>
            <p className="text-2xl font-bold">{city?.vias_locais_km} km</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
