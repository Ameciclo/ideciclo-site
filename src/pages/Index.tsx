import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { fetchUniqueStatesFromDB, fetchCitiesByState } from "@/services/database";

const RankingTable = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch states
        const uniqueStates = await fetchUniqueStatesFromDB();
        setStates(uniqueStates);
        
        // Fetch cities for each state
        const allCities = [];
        for (const state of uniqueStates) {
          const stateCities = await fetchCitiesByState(state.id);
          allCities.push(...stateCities);
        }
        
        // Add placeholder ranking data
        const citiesWithRanking = allCities.map((city, index) => ({
          ...city,
          rank: index + 1,
          score: (Math.random() * 10).toFixed(1), // Random score between 0-10
          evaluatedSegments: Math.floor(Math.random() * 50), // Random number of segments
          status: Math.random() > 0.5 ? "completo" : "parcial" // Random status
        }));
        
        // Sort by score (descending)
        citiesWithRanking.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        
        setCities(citiesWithRanking);
      } catch (error) {
        console.error("Error fetching data for ranking:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do ranking.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableCaption>Ranking de cidades baseado no índice IDECICLO</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Posição</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Índice IDECICLO</TableHead>
            <TableHead>Segmentos Avaliados</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                Nenhuma cidade encontrada
              </TableCell>
            </TableRow>
          ) : (
            cities.map((city) => (
              <TableRow key={city.id}>
                <TableCell className="font-medium">{city.rank}</TableCell>
                <TableCell>{city.name}</TableCell>
                <TableCell>{city.state}</TableCell>
                <TableCell>{city.score}</TableCell>
                <TableCell>{city.evaluatedSegments}</TableCell>
                <TableCell>
                  <Badge variant={city.status === "completo" ? "default" : "secondary"}>
                    {city.status === "completo" ? "Completo" : "Parcial"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="mt-4 text-sm text-muted-foreground">
        <p>* Os dados de ranking são provisórios e serão atualizados conforme as avaliações forem concluídas.</p>
      </div>
    </div>
  );
};

const Index = () => {
  const { toast } = useToast();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Sistema de Avaliação IDECICLO</h1>
      <Tabs defaultValue="avaliacao" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="sobre">Sobre</TabsTrigger>
        </TabsList>

        <TabsContent value="avaliacao">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Refinar Dados</CardTitle>
                <CardDescription>
                  Selecione uma cidade e refine os dados da infraestrutura
                  cicloviária.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Refine os dados da infraestrutura cicloviária da sua cidade.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/avaliar">
                  <Button>Refinar Dados</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avaliação</CardTitle>
                <CardDescription>
                  Selecione uma cidade e avalie os segmentos cicloviários.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Comece a avaliar a infraestrutura cicloviária da sua cidade.
                </p>
              </CardContent>
              <CardFooter>
                <Link to="/avaliacao">
                  <Button>Avaliação</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Cidades</CardTitle>
              <CardDescription>
                Visualize o ranking das cidades de acordo com o índice IDECICLO.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RankingTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sobre">
          <div className="prose max-w-none">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">O que é o IDECICLO?</h3>
                <p className="mb-4">
                  O IDECICLO é um índice de desenvolvimento cicloviário que avalia a qualidade da infraestrutura 
                  para bicicletas nas cidades brasileiras. Desenvolvido por especialistas em mobilidade urbana, 
                  o índice utiliza uma metodologia padronizada para avaliar segmentos cicloviários, permitindo 
                  comparações entre diferentes cidades e regiões.
                </p>
                <p className="mb-4">
                  Esta ferramenta foi criada para auxiliar gestores públicos, técnicos e organizações da sociedade 
                  civil a identificar pontos fortes e fracos da infraestrutura cicloviária, orientando investimentos 
                  e melhorias para promover o uso seguro da bicicleta como meio de transporte.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Metodologia</h3>
                <p className="mb-4">
                  A metodologia do IDECICLO baseia-se na avaliação detalhada de segmentos cicloviários, 
                  considerando aspectos como segurança, conforto, conectividade e acessibilidade. Cada segmento 
                  é avaliado por pesquisadores treinados que utilizam critérios objetivos para classificar 
                  a infraestrutura.
                </p>
                <p className="mb-4">
                  O processo de avaliação inclui a identificação e mapeamento dos segmentos, coleta de dados 
                  em campo, análise e classificação da infraestrutura, e elaboração de relatórios com 
                  recomendações para melhorias.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Objetivos</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li className="mb-2">Avaliar a qualidade da infraestrutura cicloviária existente</li>
                  <li className="mb-2">Identificar pontos críticos que necessitam de intervenção</li>
                  <li className="mb-2">Fornecer dados para orientar políticas públicas de mobilidade</li>
                  <li className="mb-2">Promover a comparação entre diferentes cidades e regiões</li>
                  <li className="mb-2">Incentivar a melhoria contínua da infraestrutura para ciclistas</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
