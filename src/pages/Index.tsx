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
          <img
            src="/ideciclo_logo.png"
            alt="IDECICLO Banner"
            className="w-full max-h-48 object-contain cursor-pointer"
          />
        </a>
      </div>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="text-gray-700">
            <div className="mb-6 flex justify-center">
              <img
                src="/foto_ideciclo.png"
                alt="IDECICLO"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
            <p className="mb-4">
              Esta plataforma digital foi desenvolvida para facilitar o processo
              de coleta, análise e visualização dos dados do IDECICLO. Através
              dela, pesquisadores podem registrar avaliações de campo, gestores
              podem acessar relatórios e cidadãos podem consultar informações
              sobre a qualidade da infraestrutura cicloviária em suas cidades.
            </p>
            <p>
              O sistema permite o gerenciamento completo do ciclo de avaliação,
              desde o mapeamento inicial dos segmentos até a geração de
              relatórios finais, contribuindo para a transparência e eficiência
              do processo de avaliação.
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual</CardTitle>
                <CardDescription>Documentação do IDECICLO</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  O manual, lançado em agosto de 2025, está disponível para
                  download gratuito.
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
                <CardDescription>Avaliação de vias cicláveis</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  O formulário para avaliar as vias está disponível para
                  download.
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
                <CardDescription>Cálculo do IDECICLO</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  O método de cálculo IDECICLO está disponível para download.
                </p>
              </CardContent>
              <CardFooter>
                <a href="/manual_ideciclo.pdf" download className="w-full">
                  <Button className="w-full">Baixar cálculo</Button>
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
