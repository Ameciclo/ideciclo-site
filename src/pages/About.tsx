import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-6">Sobre o IDECICLO</h2>
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

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">Objetivos</h3>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Avaliar a qualidade da infraestrutura cicloviária existente</li>
              <li className="mb-2">Identificar pontos críticos que necessitam de intervenção</li>
              <li className="mb-2">Fornecer dados para orientar políticas públicas de mobilidade</li>
              <li className="mb-2">Promover a comparação entre diferentes cidades e regiões</li>
              <li className="mb-2">Incentivar a melhoria contínua da infraestrutura para ciclistas</li>
              <li className="mb-2">Contribuir para o desenvolvimento de cidades mais sustentáveis e acessíveis</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">Aplicação</h3>
            <p className="mb-4">
              Esta plataforma digital foi desenvolvida para facilitar o processo de coleta, análise e 
              visualização dos dados do IDECICLO. Através dela, pesquisadores podem registrar avaliações 
              de campo, gestores podem acessar relatórios detalhados, e cidadãos podem consultar informações 
              sobre a qualidade da infraestrutura cicloviária em suas cidades.
            </p>
            <p>
              O sistema permite o gerenciamento completo do ciclo de avaliação, desde o mapeamento inicial 
              dos segmentos até a geração de relatórios finais, contribuindo para a transparência e 
              eficiência do processo de avaliação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;