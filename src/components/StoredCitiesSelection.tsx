import { useState, useEffect } from "react";
import { City } from "@/types";
import { fetchStoredCities } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StoredCitiesSelectionProps {
  onCitySelected: (stateId: string, cityId: string, cityName: string, stateName: string) => void;
}

const StoredCitiesSelection = ({ onCitySelected }: StoredCitiesSelectionProps) => {
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCityName, setSelectedCityName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Load stored cities when component mounts
  useEffect(() => {
    loadStoredCities();
  }, []);

  const loadStoredCities = async () => {
    try {
      setIsLoading(true);
      const storedCities = await fetchStoredCities();
      setCities(storedCities);
      
      // Extract unique states from cities
      const uniqueStates = Array.from(new Set(storedCities.map(city => city.state)));
      setStates(uniqueStates);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as cidades armazenadas",
        variant: "destructive",
      });
      console.error("Erro ao carregar cidades armazenadas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedCity("");
    setSelectedCityName("");
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    const city = cities.find(c => c.id === cityId);
    if (city) {
      setSelectedCityName(city.name);
    }
  };

  const handleSubmit = () => {
    if (!selectedState || !selectedCity) {
      toast({
        title: "Aviso",
        description: "Selecione um estado e uma cidade",
        variant: "default",
      });
      return;
    }
    
    onCitySelected("", selectedCity, selectedCityName, selectedState);
  };

  // Filter cities by selected state
  const filteredCities = cities.filter(city => city.state === selectedState);

  return (
    <div className="flex flex-col space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <label htmlFor="estado-refinamento" className="text-sm font-medium">Estado:</label>
        <Select disabled={isLoading || states.length === 0} onValueChange={handleStateChange} value={selectedState}>
          <SelectTrigger id="estado-refinamento">
            <SelectValue placeholder="Selecione um estado" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="cidade-refinamento" className="text-sm font-medium">Cidade:</label>
        <Select 
          disabled={isLoading || !selectedState || filteredCities.length === 0} 
          onValueChange={handleCityChange}
          value={selectedCity}
        >
          <SelectTrigger id="cidade-refinamento">
            <SelectValue placeholder="Selecione uma cidade" />
          </SelectTrigger>
          <SelectContent>
            {filteredCities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        className="w-full mt-4" 
        onClick={handleSubmit}
        disabled={isLoading || !selectedState || !selectedCity}
      >
        {isLoading ? "Carregando..." : "Prosseguir"}
      </Button>
    </div>
  );
};

export default StoredCitiesSelection;