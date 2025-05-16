
import { useState } from "react";
import { fetchCities, fetchStates } from "@/services/api";
import { IBGECity, IBGEState } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CitySelectionProps {
  onCitySelected: (stateId: string, cityId: string, cityName: string, stateName: string) => void;
}

const CitySelection = ({ onCitySelected }: CitySelectionProps) => {
  const [states, setStates] = useState<IBGEState[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedStateCode, setSelectedStateCode] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCityName, setSelectedCityName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const loadStates = async () => {
    try {
      setIsLoading(true);
      const statesData = await fetchStates();
      setStates(statesData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os estados",
        variant: "destructive",
      });
      console.error("Erro ao carregar estados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateChange = async (stateId: string) => {
    setSelectedState(stateId);
    const state = states.find(s => s.id.toString() === stateId);
    if (state) {
      setSelectedStateCode(state.sigla);
    }
    
    if (!stateId) {
      setCities([]);
      return;
    }

    try {
      setIsLoading(true);
      const citiesData = await fetchCities(stateId);
      setCities(citiesData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as cidades",
        variant: "destructive",
      });
      console.error("Erro ao carregar cidades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    const city = cities.find(c => c.id.toString() === cityId);
    if (city) {
      setSelectedCityName(city.nome);
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
    
    onCitySelected(selectedState, selectedCity, selectedCityName, selectedStateCode);
  };

  // Load states when component mounts
  useState(() => {
    loadStates();
  });

  return (
    <div className="flex flex-col space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <label htmlFor="estado" className="text-sm font-medium">Estado:</label>
        <Select disabled={isLoading || states.length === 0} onValueChange={handleStateChange} value={selectedState}>
          <SelectTrigger id="estado">
            <SelectValue placeholder="Selecione um estado" />
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.id} value={state.id.toString()}>
                {state.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="cidade" className="text-sm font-medium">Cidade:</label>
        <Select 
          disabled={isLoading || !selectedState || cities.length === 0} 
          onValueChange={handleCityChange}
          value={selectedCity}
        >
          <SelectTrigger id="cidade">
            <SelectValue placeholder="Selecione uma cidade" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id.toString()}>
                {city.nome}
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

export default CitySelection;
