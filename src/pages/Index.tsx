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
    <>
      <div className="w-full mb-8 flex justify-center bg-blue-50">
        <a href="/manual_ideciclo.pdf" download className="w-full">
          <img src="/ideciclo_logo.png" alt="IDECICLO Banner" className="w-full max-h-48 object-contain cursor-pointer" />
        </a>
      </div>
      <div className="container py-8">
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Sistema de Avaliação IDECICLO
        </h1>
        <p className="text-gray-700 max-w-3xl mx-auto mb-4">
          Esta plataforma digital foi desenvolvida para facilitar o processo de coleta, análise e visualização dos dados do IDECICLO. Através dela, pesquisadores podem registrar avaliações de campo, gestores podem acessar relatórios e cidadãos podem consultar informações sobre a qualidade da infraestrutura cicloviária em suas cidades.
        </p>
        <p className="text-gray-700 max-w-3xl mx-auto">
          O sistema permite o gerenciamento completo do ciclo de avaliação, desde o mapeamento inicial dos segmentos até a geração de relatórios finais, contribuindo para a transparência e eficiência do processo de avaliação.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Manual</CardTitle>
            <CardDescription>
              Documentação do IDECICLO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              O manual, lançado em agosto de 2025, está disponível para download gratuito.
            </p>
          </CardContent>
          <CardFooter>
            <a href="/manual_ideciclo.pdf" download className="w-full">
              <Button className="w-full">Baixar Manual</Button>
            </a>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Formulário</CardTitle>
            <CardDescription>
              Avaliação de vias cicláveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              O formulário para avaliar as vias está disponível para download.
            </p>
          </CardContent>
          <CardFooter>
            <a href="/manual_ideciclo.pdf" download className="w-full">
              <Button className="w-full">Baixar Formulário</Button>
            </a>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cálculo IDECICLO</CardTitle>
            <CardDescription>
              Cálculo do IDECICLO
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
    </>
  );
};

export default Index;
