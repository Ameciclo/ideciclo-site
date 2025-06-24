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
              <CardTitle>Ranking</CardTitle>
              <CardDescription>
                Visualize o ranking das cidades de acordo com o índice IDECICLO.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Funcionalidade em desenvolvimento.</p>
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
