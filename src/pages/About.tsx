import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const About = () => {
  const [parametersDialogOpen, setParametersDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  
  const sections = [
    {
      title: "O que é?",
      content: (
        <div className="text-justify text-text-grey">
          <p className="mb-4">
            O IDECICLO – Índice de Desenvolvimento Cicloviário é uma metodologia
            de avaliação qualitativa da infraestrutura cicloviária de uma
            cidade, que considera não apenas a extensão das ciclovias e
            ciclofaixas, mas também a segurança, qualidade e o contexto viário
            em que estão inseridas.
          </p>
          <p className="mb-4">
            Criado inicialmente em 2016 pela Associação Metropolitana de
            Ciclistas do Recife (Ameciclo), o IDECICLO já foi aplicado em mais
            de 34 cidades e áreas brasileiras.
          </p>
        </div>
      )
    },
    {
      title: "Para que serve?",
      content: (
        <div className="text-justify text-text-grey">
          <p className="mb-4">
            A metodologia foi desenvolvida por uma equipe multidisciplinar de
            urbanistas, ciclistas e cicloativistas, com o objetivo de fornecer
            indicadores objetivos sobre a qualidade das infraestruturas
            cicloviárias, permitindo avaliações consistentes, comparáveis e
            replicáveis em diferentes contextos urbanos, em todo o Brasil.
          </p>
          <p className="mb-4">
            O grande diferencial do IDECICLO é sua capacidade de
            ponderar a avaliação da infraestrutura cicloviária de
            acordo com a velocidade máxima permitida nas vias onde
            elas estão inseridas.
          </p>
        </div>
      )
    },
    {
      title: "Metodologia",
      content: (
        <div className="text-justify text-text-grey">
          <p className="mb-4">
            Em 2024, a metodologia passou por uma atualização colaborativa
            contando com especialistas e representantes de organizações não
            governamentais. O objetivo foi consolidar indicadores que reflitam a
            realidade de diferentes cidades, alinhados com o Código de Trânsito
            Brasileiro (CTB).
          </p>
          <p className="mb-4">
            São avaliados 23 parâmetros, separados em 5 eixos:
            planejamento cicloviário, projeto cicloviário ao longo
            da quadra, projeto cicloviário nas interseções,
            urbanidade e manutenção da infraestrutura cicloviária.
          </p>
        </div>
      )
    }
  ];

  return (
    <>
      {/* Header com Imagem de Capa */}
      <div className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
           style={{backgroundImage: "url('/pages_covers/ideciclo-navcover.png')"}}>
      </div>
      
      {/* Breadcrumb */}
      <nav className="bg-gray-400 text-white px-4 py-2">
        <a href="/" className="hover:underline">Home</a> {">"}  <span>Sobre</span>
      </nav>

      {/* Seção de Explicações com Design do Guia */}
      <section className="relative w-100">
        {/* Seção principal */}
        <section className="relative z-[1] container mx-auto lg:w-4/6 my-5 md:my-6 rounded p-12 overflow-auto">
          
          {/* Título com navegação */}
          <div className="flex p-6 justify-between items-center mb-4">
            {/* Título com SVG */}
            <div className="relative inline-flex items-center justify-center">
              <h1 className="relative inline-flex items-center justify-center px-4 md:px-8 py-2 md:py-4 
                             gap-4 rounded-full bg-ideciclo-blue shadow-lg text-text-grey text-center 
                             font-lato text-xl md:text-3xl font-black leading-normal z-[0]">
                {sections[currentSection].title}
              </h1>
              
              {/* SVG de fundo amarelo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 341 80"
                   className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                              w-[120%] flex-shrink-0 z-[-1]"
                   style={{fill: '#EFC345', filter: 'drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.25))'}}>
                <path d="M9.80432 49.4967C9.04999 36.8026 11.6236 24.1085 17.1429 12.7404C22.6622 1.37227 30.5294 -8.52273 39.3846 -10.7C56.0949 -15.0545 73.8052 -15.0545 91.5155 -10.7C100.371 -8.52273 108.238 1.37227 113.757 12.7404C119.276 24.1085 121.85 36.8026 121.096 49.4967L117.628 72.7273C116.874 85.4214 111.355 97.085 103.488 106.659C95.6207 116.232 85.7655 122.458 75.4869 122.458H39.3846C29.1061 122.458 19.2509 116.232 11.3837 106.659C3.51651 97.085 -1.00261 85.4214 -1.75674 72.7273L-5.22432 49.4967Z"/>
              </svg>
            </div>

            {/* Botões de navegação */}
            <div className="flex items-center">
              {/* Círculos indicadores */}
              {sections.map((_, index) => (
                <div 
                  key={index}
                  className={`w-5 h-5 rounded-full mx-1 cursor-pointer ${
                    index === currentSection ? 'bg-ideciclo-blue' : 'bg-ideciclo-yellow'
                  }`}
                  onClick={() => setCurrentSection(index)}
                ></div>
              ))}
              
              {/* Botão próximo */}
              <button 
                className="p-4 rounded-full ml-2 text-lg font-bold leading-none shadow-sm 
                           transform scale-y-150 hover:bg-gray-100"
                onClick={() => setCurrentSection((prev) => (prev + 1) % sections.length)}
              >
                {">"}  
              </button>
            </div>
          </div>
          
          {/* Caixa de conteúdo */}
          <div className="relative z-[-2] top-[-50px] text-gray-800 p-12 py-24 mx-auto 
                          bg-background-grey shadow-2xl rounded-lg">
            {sections[currentSection].content}
          </div>
        </section>
        
        {/* SVGs verticais de fundo */}
        <div className="absolute bottom-0 md:top-0 left-0 w-full z-0">
          <div className="flex mx-2 md:mx-12 md:translate-y-full">
            {Array.from({length: 20}).map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" width="68" height="268" 
                   viewBox="0 0 68 268" fill="none" className="px-2">
                <path d="M67.6863 246.015C67.833 250.383 66.2783 254.644 63.3332 257.946C60.388 261.248 56.2693 263.348 51.8002 263.826C39.4054 265.011 28.312 266.055 17.2806 267.2C6.6004 268.324 2.07628 260.152 1.37391 247.24C0.56825 232.642 0.113775 217.983 0.0931153 203.345C-0.0308293 144.898 -0.0308266 86.4448 0.0931231 27.9848C0.0931233 24.6515 0.361678 21.3182 0.692207 18.0652C0.988921 15.0779 2.07236 12.2152 3.83812 9.75323C5.60387 7.29125 7.99237 5.31295 10.7733 4.00907C20.0281 -0.288083 25.6678 -0.569205 44.7558 1.49905C48.8752 1.98753 52.6892 3.86075 55.5375 6.79441C58.3859 9.72807 60.0892 13.5375 60.3527 17.5632C66.3642 91.418 65.8271 166.578 67.6863 246.015Z" fill="#69BFAF"/>
              </svg>
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Accordion com design melhorado */}
      <div className="container py-8">

        {/* Título principal com estilo subpágina */}
        <div className="mx-auto text-center my-12 md:my-6">
          <h3 className="text-4xl font-bold p-6 my-8 mb-[50px] rounded-[40px] 
                         bg-ideciclo-teal mx-auto text-white shadow-[0px_6px_8px_rgba(0,0,0,0.25)]">
            Informações Detalhadas
          </h3>
        </div>

        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="mt-4">
              <Card className="hover:bg-ideciclo-yellow hover:bg-opacity-20 transition-colors duration-300 
                             rounded-[20px] shadow-[0px_4px_6px_rgba(0,0,0,0.15)]">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <h3 className="text-xl font-semibold text-left text-ideciclo-red">
                    Por que o IDECICLO é diferente?
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-2 pb-4">
                    <p className="mb-4 text-justify text-text-grey">
                      O grande diferencial do IDECICLO é sua capacidade de
                      ponderar a avaliação da infraestrutura cicloviária de
                      acordo com a velocidade máxima permitida nas vias onde
                      elas estão inseridas. Isso significa que a metodologia dá
                      maior peso às estruturas localizadas em vias de alta
                      velocidade, onde a proteção ao ciclista é mais urgente e
                      necessária.
                    </p>
                    <p className="mb-4 text-justify text-text-grey">
                      Assim, o IDECICLO não mede apenas quantos quilômetros de
                      ciclovias uma cidade tem, mas também onde elas estão e o
                      quanto oferecem segurança diante do risco que a alta
                      velocidade do trânsito motorizado representa.
                    </p>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="item-2" className="mt-4">
              <Card className="hover:bg-ideciclo-yellow hover:bg-opacity-20 transition-colors duration-300 
                             rounded-[20px] shadow-[0px_4px_6px_rgba(0,0,0,0.15)]">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <h3 className="text-xl font-semibold text-left text-ideciclo-red">
                    Para quem é o IDECICLO?
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-2 pb-4">
                    <p className="mb-4">
                      A metodologia do IDECICLO pode ser utilizada por diversos
                      públicos interessados em promover a mobilidade por
                      bicicleta com base em dados e evidências, entre eles,
                      indicamos a:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                      <li className="mb-2">
                        Gestores e gestoras públicas das áreas de mobilidade
                        urbana, planejamento urbano e infraestrutura, que buscam
                        ferramentas técnicas para avaliar, planejar e justificar
                        melhorias na malha cicloviária;
                      </li>
                      <li className="mb-2">
                        Técnicos e planejadores urbanos, que desejam incorporar
                        indicadores de qualidade cicloviária em planos, projetos
                        e diagnósticos urbanos;
                      </li>
                      <li className="mb-2">
                        Organizações cicloativistas da sociedade civil e
                        coletivos de mobilidade ativa que atuam na incidência da
                        promoção do uso da bicicleta e cidades mais seguras e
                        sustentáveis;
                      </li>
                      <li className="mb-2">
                        Pesquisadores, estudantes e universidades, interessados
                        em estudos sobre mobilidade urbana, segurança viária e
                        direito à cidade;
                      </li>
                      <li className="mb-2">
                        Ciclistas urbanos e conselhos de mobilidade, que buscam
                        evidenciar as condições reais de circulação e
                        infraestrutura para dialogar com o poder público de
                        forma qualificada.
                      </li>
                    </ul>
                    <p className="mb-4">
                      O IDECICLO é uma ferramenta aberta e replicável, pensada
                      para fortalecer, por meio de evidências, o planejamento
                      participativo, promover diagnósticos colaborativos e
                      construir pontes entre a sociedade civil e o poder público
                      na promoção de cidades mais seguras e humanas para quem
                      pedala.
                    </p>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="item-3" className="mt-4">
              <Card className="hover:bg-ideciclo-yellow hover:bg-opacity-20 transition-colors duration-300 
                             rounded-[20px] shadow-[0px_4px_6px_rgba(0,0,0,0.15)]">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <h3 className="text-xl font-semibold text-left text-ideciclo-red">
                    Como funciona?
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-2 pb-4">
                    <div className="mb-4">
                      <p className="mb-2">
                        São avaliados 23 parâmetros, separados em 5 eixos:
                        planejamento cicloviário, projeto cicloviário ao longo
                        da quadra, projeto cicloviário nas interseções,
                        urbanidade e manutenção da infraestrutura cicloviária.
                      </p>
                      <Button
                        onClick={() => setParametersDialogOpen(true)}
                        className="bg-ideciclo-teal hover:bg-ideciclo-blue text-white rounded-full"
                      >
                        Saiba mais
                      </Button>
                    </div>

                    <p className="mt-6 mb-4">
                      A avaliação deve ser feita em campo, por meio de um
                      formulário impresso ou diretamente na plataforma digital,
                      com dispositivo móvel.
                    </p>
                    <p className="mb-4">
                      As notas são obtidas por meio de uma média ponderada, que
                      considera o peso relativo de cada parâmetro e da
                      velocidade da via, garantindo que a avaliação reflita a
                      prioridade real de proteção aos ciclistas.
                    </p>
                    <p className="mb-4">
                      Para compreender melhor a metodologia, os indicadores e o
                      cálculo da nota, acesse o manual.
                    </p>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="item-4" className="mt-4">
              <Card className="hover:bg-ideciclo-yellow hover:bg-opacity-20 transition-colors duration-300 
                             rounded-[20px] shadow-[0px_4px_6px_rgba(0,0,0,0.15)]">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <h3 className="text-xl font-semibold text-left text-ideciclo-red">
                    Como aplicar?
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-2 pb-4">
                    <p className="mb-4">
                      Após a leitura do manual, os pesquisadores devem iniciar a
                      coleta pré-campo, organizar as equipes e realizar a
                      avaliação em campo, finalizando com o envio dos dados pela
                      plataforma. A coleta pode ser realizada da forma que for
                      mais conveniente: utilizando o formulário impresso, com
                      posterior transferência e revisão das informações no
                      formulário digital, ou diretamente pela plataforma
                      digital, redobrando a atenção durante o preenchimento.
                    </p>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            <AccordionItem value="item-5" className="mt-4">
              <Card className="hover:bg-ideciclo-yellow hover:bg-opacity-20 transition-colors duration-300 
                             rounded-[20px] shadow-[0px_4px_6px_rgba(0,0,0,0.15)]">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <h3 className="text-xl font-semibold text-left text-ideciclo-red">E depois?</h3>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-2 pb-4">
                    <p className="mb-4">
                      A plataforma irá calcular a nota da cidade, que pode ser
                      visualizada no ranking nacional.
                    </p>

                    <h4 className="text-lg font-medium mt-6 mb-3">
                      Como os resultados podem ser utilizados:
                    </h4>
                    <ul className="list-disc pl-6 mb-4">
                      <li className="mb-3">
                        <span className="font-medium">
                          Organizações cicloativistas da sociedade civil
                        </span>{" "}
                        podem levar os resultados aos gestores públicos locais,
                        utilizando os dados para promover o uso da bicicleta,
                        reivindicar melhorias na infraestrutura existente e
                        avaliar a adequação de novos projetos ao contexto viário
                        da cidade.
                      </li>
                      <li className="mb-3">
                        <span className="font-medium">
                          Gestores e gestoras públicas
                        </span>{" "}
                        são incentivados a serem receptivos às reivindicações
                        das organizações e coletivos que aplicaram o IDECICLO em
                        seu território, reconhecendo a importância desses dados
                        para fundamentar políticas públicas eficazes. Além
                        disso, podem tomar a iniciativa de aplicar o IDECICLO
                        para monitorar e aprimorar continuamente a malha
                        cicloviária, garantindo cidades mais seguras e
                        sustentáveis.
                      </li>
                      <li className="mb-3">
                        <span className="font-medium">
                          Técnicos e planejadores urbanos
                        </span>{" "}
                        têm a oportunidade de usar a nota e o manual como
                        referência para incorporar indicadores de qualidade e
                        segurança cicloviária em planos, projetos e diagnósticos
                        urbanos, contribuindo para seu aperfeiçoamento
                        profissional e mantendo-se atualizados com as melhores
                        práticas e ferramentas inovadoras na área.
                      </li>
                      <li className="mb-3">
                        <span className="font-medium">
                          Pesquisadores, estudantes e universidades
                        </span>{" "}
                        podem utilizar as notas e a metodologia de forma
                        transversal em estudos sobre mobilidade urbana,
                        segurança viária e direito à cidade, contribuindo
                        cientificamente para o desenvolvimento do conhecimento e
                        das políticas públicas baseadas em evidências.
                      </li>
                      <li className="mb-3">
                        <span className="font-medium">
                          Ciclistas urbanos e conselhos de mobilidade
                        </span>{" "}
                        podem usar as notas para evidenciar as condições reais
                        de circulação e infraestrutura, contribuindo para o
                        fortalecimento da sociedade civil na observância das
                        políticas públicas e colaborando com a atualização
                        contínua dos dados da sua cidade, qualificando o diálogo
                        com o poder público e contribuindo para melhorias.
                      </li>
                    </ul>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <Dialog
        open={parametersDialogOpen}
        onOpenChange={setParametersDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              23 Parâmetros de Avaliação
            </DialogTitle>
            <DialogDescription>
              Detalhamento dos parâmetros utilizados na metodologia IDECICLO
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                A. PLANEJAMENTO CICLOVIÁRIO
              </h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-1">
                  A.1. Adequação da tipologia de tratamento em relação à
                  velocidade da via e sua respectiva hierarquia
                </li>
                <li className="mb-1">
                  A.2. Conectividade da Rede Cicloviária
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                B. PROJETO CICLOVIÁRIO AO LONGO DA QUADRA
              </h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-1">
                  B.1. Espaço útil da Infraestrutura Cicloviária
                </li>
                <li className="mb-1">B.2. Tipo de Pavimento</li>
                <li className="mb-1">
                  B.3. Delimitação da Infraestrutura Cicloviária
                </li>
                <li className="mb-1">
                  B.4. Identificação do espaço cicloviário
                </li>
                <li className="mb-1">
                  B.5. Acessibilidade relativa ao uso do solo lindeiro
                </li>
                <li className="mb-1">
                  B.6. Medidas de moderação no compartilhamento viário
                </li>
                <li className="mb-1">
                  B.x.1. Conflitos com pontos de ônibus ou escolas
                </li>
                <li className="mb-1">
                  B.x.2. Existência de obstáculos horizontais no trecho
                </li>
                <li className="mb-1">
                  B.x.3. Existência de obstáculos verticais no trecho
                </li>
                <li className="mb-1">
                  B.x.4. Mudança de lado da infraestrutura no meio da
                  quadra
                </li>
                <li className="mb-1">
                  B.x.5. Sentido de circulação da infraestrutura contrário
                  ao fluxo veicular
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                C. PROJETO CICLOVIÁRIO NAS INTERSEÇÕES
              </h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-1">
                  C.1. Sinalização horizontal cicloviária na(s)
                  interseção(ões)
                </li>
                <li className="mb-1">
                  C.2. Acessibilidade entre conexões cicloviárias
                </li>
                <li className="mb-1">
                  C.3. Tratamento dos conflitos com a circulação de modos
                  motorizados
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">D. URBANIDADE</h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-1">D.1. Iluminação Pública</li>
                <li className="mb-1">D.2. Conforto térmico</li>
                <li className="mb-1">
                  D.3. Existência de mobiliário cicloviário
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                E. MANUTENÇÃO DA INFRAESTRUTURA CICLOVIÁRIA
              </h3>
              <ul className="list-disc pl-6 mb-4">
                <li className="mb-1">
                  E.1. Estado de conservação do pavimento
                </li>
                <li className="mb-1">
                  E.2. Estado de conservação dos elementos de delimitação
                  da infraestrutura
                </li>
                <li className="mb-1">
                  E.3. Estado de conservação da identificação do espaço
                  cicloviário
                </li>
                <li className="mb-1">
                  E.4. Estado de conservação da sinalização horizontal nas
                  interseções
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <DialogClose asChild>
              <Button>Fechar</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default About;
