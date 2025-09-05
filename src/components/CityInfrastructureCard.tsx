import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface CityInfrastructureCardProps {
  cityName: string;
  stateName: string;
  city: {
    vias_estruturais_km?: number;
    vias_alimentadoras_km?: number;
    vias_locais_km?: number;
  } | null;
}

export const CityInfrastructureCard = ({
  cityName,
  stateName,
  city,
}: CityInfrastructureCardProps) => {
  const [isVisible, setIsVisible] = useState(true);

  // Debug removed

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Safety check
  if (!city) {
    // No city data provided
    return (
      <Card>
        <CardHeader>
          <CardTitle>{cityName}, {stateName}</CardTitle>
          <CardDescription>Carregando dados da infraestrutura viária...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {cityName}, {stateName}
            </CardTitle>
            <CardDescription>Dados da infraestrutura viária</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={toggleVisibility}>
              {isVisible ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      {isVisible && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-semibold text-gray-500">
                VIAS ESTRUTURAIS
              </h4>
              <p className="text-2xl font-bold">
                {city?.vias_estruturais_km} km
              </p>
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
              <h4 className="text-sm font-semibold text-gray-500">
                VIAS LOCAIS
              </h4>
              <p className="text-2xl font-bold">{city?.vias_locais_km} km</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
