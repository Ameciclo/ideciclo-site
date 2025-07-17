import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Index = () => {
  return (
    <div className="container py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Sistema de Avaliação IDECICLO
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Avalie a qualidade da infraestrutura cicloviária da sua cidade e
          contribua para a melhoria da mobilidade urbana.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Avaliação</CardTitle>
            <CardDescription>
              Avalie os segmentos cicloviários da sua cidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Selecione uma cidade e avalie os segmentos cicloviários para
              contribuir com o índice IDECICLO.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/avaliacao" className="w-full">
              <Button className="w-full">Avaliar Segmentos</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking</CardTitle>
            <CardDescription>
              Veja o ranking das cidades avaliadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Confira o ranking das cidades brasileiras de acordo com o índice
              IDECICLO.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/ranking" className="w-full">
              <Button className="w-full">Ver Ranking</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aprimorar Dados</CardTitle>
            <CardDescription>
              Refine os dados da infraestrutura cicloviária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Selecione uma cidade e refine os dados da infraestrutura
              cicloviária.
            </p>
          </CardContent>
          <CardFooter>
            <Link to="/avaliar" className="w-full">
              <Button className="w-full">Aprimorar Dados</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Sobre o IDECICLO</h2>
        <p className="mb-4">
          O IDECICLO é um índice de desenvolvimento cicloviário que avalia a
          qualidade da infraestrutura para bicicletas nas cidades brasileiras.
          Desenvolvido por especialistas em mobilidade urbana, o índice utiliza
          uma metodologia padronizada para avaliar segmentos cicloviários.
        </p>
        <div className="flex justify-end">
          <Link to="/sobre">
            <Button variant="outline">Saiba mais</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
