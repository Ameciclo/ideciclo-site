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
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Projeto</CardTitle>
              <CardDescription>Informações sobre o projeto.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Saiba mais sobre o projeto (em desenvolvimento).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
