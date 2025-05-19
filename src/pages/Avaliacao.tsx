
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { City, Segment } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const Avaliacao = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [states, setStates] = useState<{id: string, name: string}[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch states from DB
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('state')
          .distinct();
        
        if (error) {
          console.error("Error fetching states:", error);
          return;
        }

        const uniqueStates = data.map(item => ({
          id: item.state,
          name: item.state
        }));

        setStates(uniqueStates);
      } catch (error) {
        console.error("Error fetching states:", error);
      }
    };

    fetchStates();
  }, []);

  // Fetch cities when state is selected
  useEffect(() => {
    if (selectedState) {
      const fetchCities = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('cities')
            .select('*')
            .eq('state', selectedState);
          
          if (error) {
            console.error("Error fetching cities:", error);
            setError("Erro ao carregar cidades");
            return;
          }

          setCities(data as City[]);
        } catch (error) {
          console.error("Error fetching cities:", error);
          setError("Erro ao carregar cidades");
        } finally {
          setIsLoading(false);
        }
      };

      fetchCities();
    }
  }, [selectedState]);

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCityId("");
    setSelectedCity(null);
    setSegments([]);
  };

  const handleCityChange = (value: string) => {
    setSelectedCityId(value);
    const city = cities.find(c => c.id === value) || null;
    setSelectedCity(city);
    
    if (value) {
      fetchSegmentsForCity(value);
    } else {
      setSegments([]);
    }
  };

  const fetchSegmentsForCity = async (cityId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('segments')
        .select('*')
        .eq('id_cidade', cityId)
        .eq('evaluated', true);
      
      if (error) {
        console.error("Error fetching segments:", error);
        setError("Erro ao carregar segmentos avaliados");
        return;
      }

      setSegments(data as Segment[]);
    } catch (error) {
      console.error("Error fetching segments:", error);
      setError("Erro ao carregar segmentos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStart = () => {
    navigate("/");
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const sortedSegments = [...segments].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    
    if (sortDirection === "asc") {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });

  const filteredSegments = selectedRating === "all" 
    ? sortedSegments 
    : sortedSegments.filter(segment => {
        // Filter by rating logic would go here
        // For now just return all as we don't have ratings in our current data model
        return true;
      });

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Avaliação de Infraestrutura Cicloviária</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackToStart}>Voltar ao Início</Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selecionar Cidade</CardTitle>
          <CardDescription>
            Escolha o estado e a cidade para visualizar os segmentos avaliados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select value={selectedState} onValueChange={handleStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map(state => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Select value={selectedCityId} onValueChange={handleCityChange} disabled={!selectedState || cities.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p>Carregando dados... Por favor aguarde.</p>
          </div>
        </div>
      )}

      {!isLoading && selectedCity && segments.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{selectedCity.name}, {selectedCity.state}</CardTitle>
                  <CardDescription>Segmentos avaliados</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-500">VIAS ESTRUTURAIS</h4>
                  <p className="text-2xl font-bold">{selectedCity.vias_estruturais_km} km</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-500">VIAS ALIMENTADORAS</h4>
                  <p className="text-2xl font-bold">{selectedCity.vias_alimentadoras_km} km</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-semibold text-gray-500">VIAS LOCAIS</h4>
                  <p className="text-2xl font-bold">{selectedCity.vias_locais_km} km</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleSortDirection}
                  >
                    Ordenar por Nome {sortDirection === "asc" ? "↑" : "↓"}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="filter-rating">Filtrar por nota:</Label>
                    <Select value={selectedRating} onValueChange={setSelectedRating}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableCaption>Lista de segmentos cicloviários avaliados</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Extensão (km)</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSegments.map(segment => (
                      <TableRow key={segment.id}>
                        <TableCell className="font-medium">{segment.name}</TableCell>
                        <TableCell>{segment.type}</TableCell>
                        <TableCell className="text-right">{segment.length.toFixed(4)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/avaliar/formulario/${segment.id}`}>
                              Ver Avaliação
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && selectedCity && segments.length === 0 && (
        <Alert>
          <AlertTitle>Nenhum segmento avaliado</AlertTitle>
          <AlertDescription>
            Não foram encontrados segmentos avaliados para esta cidade.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Avaliacao;
