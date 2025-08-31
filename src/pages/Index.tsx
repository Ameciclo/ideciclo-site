import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const Index = () => {
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
      ),
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
            O grande diferencial do IDECICLO é sua capacidade de ponderar a
            avaliação da infraestrutura cicloviária de acordo com a velocidade
            máxima permitida nas vias onde elas estão inseridas.
          </p>
        </div>
      ),
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
            São avaliados 23 parâmetros, separados em 5 eixos: planejamento
            cicloviário, projeto cicloviário ao longo da quadra, projeto
            cicloviário nas interseções, urbanidade e manutenção da
            infraestrutura cicloviária.
          </p>
        </div>
      ),
    },
  ];

  const sponsors = [
    {
      name: "Itaú Unibanco",
      description: "Patrocinador oficial do IDECICLO",
      logo: "/logos/sponsors/itau unibanco.png",
    },
    {
      name: "Tembici",
      description: "Patrocinador oficial do IDECICLO",
      logo: "/logos/sponsors/tembici.png",
    },
  ];

  const partners = [
    {
      name: "AMECICLO",
      description: "Associação Metropolitana de Ciclistas do Recife",
      logo: "/logos/partners/ameciclo.png",
    },
    {
      name: "BH em Ciclo",
      description: "Organização cicloativista de Belo Horizonte",
      logo: "/logos/partners/BH em Ciclo.png",
    },
    {
      name: "Bici Nos Planos MS",
      description: "Coletivo de mobilidade urbana do Mato Grosso do Sul",
      logo: "/logos/partners/Bici Nos Planos MS.png",
    },
    {
      name: "Ciclobservatório IFC",
      description: "Observatório da mobilidade por bicicleta",
      logo: "/logos/partners/Ciclobservatório IFC.png",
    },
    {
      name: "Ciclocidade",
      description: "Associação dos Ciclistas Urbanos de São Paulo",
      logo: "/logos/partners/Ciclocidade.png",
    },
    {
      name: "Cicloiguaçu",
      description: "Coletivo de ciclistas de Foz do Iguaçu",
      logo: "/logos/partners/Cicloiguaçu.png",
    },
    {
      name: "Ciclomobi",
      description: "Organização pela mobilidade urbana sustentável",
      logo: "/logos/partners/Ciclomobi.png",
    },
    {
      name: "ObMob Salvador",
      description: "Observatório da Mobilidade de Salvador",
      logo: "/logos/partners/ObMob Salvador.png",
    },
    {
      name: "Pedaleco",
      description: "Coletivo de ciclistas urbanos",
      logo: "/logos/partners/Pedaleco.png",
    },
    {
      name: "Rodas da Paz",
      description: "Organização pela mobilidade urbana sustentável",
      logo: "/logos/partners/Rodas da Paz.png",
    },
  ];

  const consultants = [
    {
      name: "ITDP Brasil",
      description: "Instituto de Políticas de Transporte e Desenvolvimento",
      logo: "/logos/consultants/itdp brasil.png",
    },
    {
      name: "WRI Brasil",
      description: "World Resources Institute Brasil",
      logo: "/logos/consultants/wri brasil.png",
    },
  ];

  return (
    <>
      {/* Header com Imagem de Capa */}
      <div
        className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
        style={{
          backgroundImage: "url('/pages_covers/ideciclo-navcover.png')",
        }}
      ></div>

      {/* Breadcrumb */}
      <nav className="bg-gray-400 text-white px-4 py-2">
        <span>Home</span>
      </nav>
      {/* Seção de Explicações */}
      {/* Seção de Explicações com Design do Guia */}
      <section className="relative w-100">
        {/* Seção principal */}
        <section className="relative z-[1] container mx-auto lg:w-4/6 my-5 md:my-6 rounded p-12 overflow-auto">
          {/* Título com navegação */}
          <div className="flex p-6 justify-between items-center mb-4">
            {/* Título com SVG */}
            <div className="relative inline-flex items-center justify-center">
              <h1
                className="relative inline-flex items-center justify-center px-4 md:px-8 py-2 md:py-4 
                             gap-4 rounded-full bg-ideciclo-blue shadow-lg text-text-grey text-center 
                             font-lato text-xl md:text-3xl font-black leading-normal z-[0]"
              >
                {sections[currentSection].title}
              </h1>

              {/* SVG de fundo amarelo */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 341 80"
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                              w-[120%] flex-shrink-0 z-[-1]"
                style={{
                  fill: "#EFC345",
                  filter: "drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.25))",
                }}
              >
                <path d="M9.80432 49.4967C9.04999 36.8026 11.6236 24.1085 17.1429 12.7404C22.6622 1.37227 30.5294 -8.52273 39.3846 -10.7C56.0949 -15.0545 73.8052 -15.0545 91.5155 -10.7C100.371 -8.52273 108.238 1.37227 113.757 12.7404C119.276 24.1085 121.85 36.8026 121.096 49.4967L117.628 72.7273C116.874 85.4214 111.355 97.085 103.488 106.659C95.6207 116.232 85.7655 122.458 75.4869 122.458H39.3846C29.1061 122.458 19.2509 116.232 11.3837 106.659C3.51651 97.085 -1.00261 85.4214 -1.75674 72.7273L-5.22432 49.4967Z" />
              </svg>
            </div>

            {/* Botões de navegação */}
            <div className="flex items-center">
              {/* Círculos indicadores */}
              {sections.map((_, index) => (
                <div
                  key={index}
                  className={`w-5 h-5 rounded-full mx-1 cursor-pointer ${
                    index === currentSection
                      ? "bg-ideciclo-blue"
                      : "bg-ideciclo-yellow"
                  }`}
                  onClick={() => setCurrentSection(index)}
                ></div>
              ))}

              {/* Botão próximo */}
              <button
                className="p-4 rounded-full ml-2 text-lg font-bold leading-none shadow-sm 
                           transform scale-y-150 hover:bg-gray-100"
                onClick={() =>
                  setCurrentSection((prev) => (prev + 1) % sections.length)
                }
              >
                {">"}
              </button>
            </div>
          </div>

          {/* Caixa de conteúdo */}
          <div
            className="relative z-[-2] top-[-50px] text-gray-800 p-12 py-24 mx-auto 
                          bg-background-grey shadow-2xl rounded-lg"
          >
            {sections[currentSection].content}
          </div>
        </section>

        {/* SVGs verticais de fundo */}
        <div className="absolute bottom-0 md:top-0 left-0 w-full z-0">
          <div className="flex mx-2 md:mx-12 md:translate-y-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                width="68"
                height="268"
                viewBox="0 0 68 268"
                fill="none"
                className="px-2"
              >
                <path
                  d="M67.6863 246.015C67.833 250.383 66.2783 254.644 63.3332 257.946C60.388 261.248 56.2693 263.348 51.8002 263.826C39.4054 265.011 28.312 266.055 17.2806 267.2C6.6004 268.324 2.07628 260.152 1.37391 247.24C0.56825 232.642 0.113775 217.983 0.0931153 203.345C-0.0308293 144.898 -0.0308266 86.4448 0.0931231 27.9848C0.0931233 24.6515 0.361678 21.3182 0.692207 18.0652C0.988921 15.0779 2.07236 12.2152 3.83812 9.75323C5.60387 7.29125 7.99237 5.31295 10.7733 4.00907C20.0281 -0.288083 25.6678 -0.569205 44.7558 1.49905C48.8752 1.98753 52.6892 3.86075 55.5375 6.79441C58.3859 9.72807 60.0892 13.5375 60.3527 17.5632C66.3642 91.418 65.8271 166.578 67.6863 246.015Z"
                  fill="#69BFAF"
                />
              </svg>
            ))}
          </div>
        </div>
      </section>
      {/* Seção Principal */}
      <div className="container mx-auto py-12">
        {/* Grid de 3 colunas com estilo subpágina */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card Manual */}
          <div className="rounded bg-white shadow-2xl ideciclo-card-hover">
            <div className="flex flex-col bg-white divide-y divide-gray-100">
              <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                <h3 className="text-ideciclo-red font-bold text-xl mb-2">
                  MANUAL
                </h3>
                <h3 className="text-lg mt-2 mb-4">
                  <strong>DOCUMENTAÇÃO</strong> completa da metodologia IDECICLO
                </h3>
              </div>

              <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                <h3 className="text-ideciclo-red font-bold">VERSÃO</h3>
                <h3 className="text-2xl mt-2">
                  <strong>2024</strong>
                </h3>
              </div>

              <div className="flex flex-col justify-center w-full p-6 text-center">
                <a href="/manual_ideciclo.pdf" download className="w-full">
                  <Button className="w-full bg-ideciclo-teal hover:bg-ideciclo-blue text-white rounded-full py-3">
                    Baixar Manual
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Card Formulário */}
          <div className="rounded bg-white shadow-2xl ideciclo-card-hover">
            <div className="flex flex-col bg-white divide-y divide-gray-100">
              <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                <h3 className="text-ideciclo-red font-bold text-xl mb-2">
                  FORMULÁRIO
                </h3>
                <h3 className="text-lg mt-2 mb-4">
                  <strong>AVALIAÇÃO</strong> de vias cicláveis em campo
                </h3>
              </div>

              <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                <h3 className="text-ideciclo-red font-bold">PARÂMETROS</h3>
                <h3 className="text-2xl mt-2">
                  <strong>23</strong>
                </h3>
              </div>

              <div className="flex flex-col justify-center w-full p-6 text-center">
                <a href="/manual_ideciclo.pdf" download className="w-full">
                  <Button className="w-full bg-ideciclo-teal hover:bg-ideciclo-blue text-white rounded-full py-3">
                    Baixar Formulário
                  </Button>
                </a>
              </div>
            </div>
          </div>

          {/* Card Cálculo */}
          <div className="rounded bg-white shadow-2xl ideciclo-card-hover">
            <div className="flex flex-col bg-white divide-y divide-gray-100">
              <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                <h3 className="text-ideciclo-red font-bold text-xl mb-2">
                  CÁLCULO
                </h3>
                <h3 className="text-lg mt-2 mb-4">
                  <strong>METODOLOGIA</strong> de cálculo do índice
                </h3>
              </div>

              <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                <h3 className="text-ideciclo-red font-bold">EIXOS</h3>
                <h3 className="text-2xl mt-2">
                  <strong>5</strong>
                </h3>
              </div>

              <div className="flex flex-col justify-center w-full p-6 text-center">
                <a href="/manual_ideciclo.pdf" download className="w-full">
                  <Button className="w-full bg-ideciclo-teal hover:bg-ideciclo-blue text-white rounded-full py-3">
                    Baixar Cálculo
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Accordion com design melhorado */}
        <div className="container py-8">
          {/* Título principal com estilo subpágina */}
          <div className="mx-auto text-center my-12 md:my-6">
            <h3 className="text-4xl font-bold p-6 my-8 mb-[50px] rounded-[40px] 
                           bg-ideciclo-teal mx-auto text-white shadow-[0px_6px_8px_rgba(0,0,0,0.25)]">
              Mais sobre o IDECICLO
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

      {/* Seção de Apoiadores */}
      <div className="container mx-auto py-12">
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="110%"
                height="57"
                viewBox="0 0 488 57"
                className="absolute bottom-[-30px] left-0 transform scale-x-105 drop-shadow-lg"
              >
                <path
                  d="M10.9295 34.8977C9.75216 26.5786 11.6236 18.2595 16.1429 11.0909C20.6622 3.92227 27.5294 -1.02273 35.3846 -2.2C51.0949 -4.55455 67.8052 -4.55455 84.5155 -2.2C92.3707 -1.02273 99.2379 3.92227 103.757 11.0909C108.276 18.2595 110.148 26.5786 108.971 34.8977L105.628 52.7273C104.451 61.0464 99.9317 68.215 93.0645 73.1591C86.1973 78.1032 77.3421 80.4577 68.4869 80.4577H35.3846C26.5294 80.4577 17.6742 78.1032 10.807 73.1591C3.93982 68.215 -0.579398 61.0464 -1.75674 52.7273L-5.1 34.8977Z"
                  fill="#A5AEB8"
                />
              </svg>
              <h1
                className="text-3xl sm:text-5xl font-bold bg-ideciclo-red text-white rounded-[2.5rem] 
                           shadow-[0px_6px_8px_rgba(0,0,0,0.25)] inline-flex items-center justify-center 
                           h-[6rem] px-[2.1875rem] py-[1rem] gap-[1rem] flex-shrink-0 relative z-10"
              >
                Apoiadores
              </h1>
            </div>
          </div>

          <div className="mb-8 text-text-grey text-center">
            <p className="mb-4 text-lg">
              O IDECICLO é possível graças ao apoio e colaboração de
              organizações comprometidas com a promoção da mobilidade urbana
              sustentável e segura.
            </p>
          </div>

          {/* Parceiros */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-ideciclo-red mb-6 text-center">
              Parceria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex flex-col rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] 
                              h-full p-6 justify-center align-center bg-white text-text-grey 
                              hover:bg-ideciclo-yellow hover:text-text-grey transition-colors text-center"
                >
                  <div className="mx-auto mb-6 w-40 h-32 flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-ideciclo-red mb-3">
                    {partner.name}
                  </h3>
                  <p className="text-text-grey">{partner.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Consultores */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-ideciclo-red mb-6 text-center">
              Consultoria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {consultants.map((consultant) => (
                <div
                  key={consultant.name}
                  className="flex flex-col rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] 
                              h-full p-6 justify-center align-center bg-white text-text-grey 
                              hover:bg-ideciclo-yellow hover:text-text-grey transition-colors text-center"
                >
                  <div className="mx-auto mb-6 w-40 h-32 flex items-center justify-center">
                    <img
                      src={consultant.logo}
                      alt={consultant.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-ideciclo-red mb-3">
                    {consultant.name}
                  </h3>
                  <p className="text-text-grey">{consultant.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Patrocinadores */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-ideciclo-red mb-6 text-center">
              Patrocínio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.name}
                  className="flex flex-col rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] 
                              h-full p-6 justify-center align-center bg-white text-text-grey 
                              hover:bg-ideciclo-yellow hover:text-text-grey transition-colors text-center"
                >
                  <div className="mx-auto mb-6 w-40 h-32 flex items-center justify-center">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-ideciclo-red mb-3">
                    {sponsor.name}
                  </h3>
                  <p className="text-text-grey">{sponsor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Parâmetros */}
      <Dialog open={parametersDialogOpen} onOpenChange={setParametersDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Parâmetros do IDECICLO</DialogTitle>
            <DialogDescription>
              Conheça os 23 parâmetros avaliados na metodologia IDECICLO
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Planejamento Cicloviariário (2 parâmetros)</h3>
              <p className="text-sm text-gray-600">Avaliação do planejamento e integração da infraestrutura cicloviariária</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">2. Projeto Cicloviariário ao Longo da Quadra (11 parâmetros)</h3>
              <p className="text-sm text-gray-600">Avaliação da qualidade e segurança da infraestrutura ao longo das vias</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">3. Projeto Cicloviariário nas Interseções (3 parâmetros)</h3>
              <p className="text-sm text-gray-600">Avaliação da segurança e continuidade nas interseções</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">4. Urbanidade (3 parâmetros)</h3>
              <p className="text-sm text-gray-600">Avaliação do contexto urbano e integração com o ambiente</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">5. Manutenção da Infraestrutura (4 parâmetros)</h3>
              <p className="text-sm text-gray-600">Avaliação do estado de conservação e manutenção</p>
            </div>
          </div>
          <DialogClose asChild>
            <Button className="mt-4">Fechar</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Index;
