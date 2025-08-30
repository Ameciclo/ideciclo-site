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
      {/* Header com Imagem de Capa */}
      <div className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
           style={{backgroundImage: "url('/pages_covers/ideciclo-navcover.png')"}}>
      </div>
      
      {/* Breadcrumb */}
      <nav className="bg-gray-400 text-white px-4 py-2">
        <span>Home</span>
      </nav>
      {/* Seção Principal */}
      <div className="container mx-auto py-12">
        {/* Título Principal com SVG */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="110%" height="57" viewBox="0 0 488 57" 
                 className="absolute bottom-[-30px] left-0 transform scale-x-105 drop-shadow-lg">
              <path d="M10.9295 34.8977C9.75216 26.5786 11.6236 18.2595 16.1429 11.0909C20.6622 3.92227 27.5294 -1.02273 35.3846 -2.2C51.0949 -4.55455 67.8052 -4.55455 84.5155 -2.2C92.3707 -1.02273 99.2379 3.92227 103.757 11.0909C108.276 18.2595 110.148 26.5786 108.971 34.8977L105.628 52.7273C104.451 61.0464 99.9317 68.215 93.0645 73.1591C86.1973 78.1032 77.3421 80.4577 68.4869 80.4577H35.3846C26.5294 80.4577 17.6742 78.1032 10.807 73.1591C3.93982 68.215 -0.579398 61.0464 -1.75674 52.7273L-5.1 34.8977Z" fill="#A5AEB8"/>
            </svg>
            <h1 className="text-3xl sm:text-5xl font-bold bg-ideciclo-red text-white rounded-[2.5rem] 
                           shadow-[0px_6px_8px_rgba(0,0,0,0.25)] inline-flex items-center justify-center 
                           h-[6rem] px-[2.1875rem] py-[1rem] gap-[1rem] flex-shrink-0 relative z-10">
              IDECICLO
            </h1>
          </div>
        </div>

        {/* Caixa de texto no topo */}
        <div className="bg-white rounded-[20px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] p-8 mb-12 mx-4">
          <p className="mb-4 text-justify text-text-grey text-lg leading-relaxed">
            Esta plataforma digital foi desenvolvida para facilitar o processo
            de coleta, análise e visualização dos dados do IDECICLO. Através
            dela, pesquisadores podem registrar avaliações de campo, gestores
            podem acessar relatórios e cidadãos podem consultar informações
            sobre a qualidade da infraestrutura cicloviária em suas cidades.
          </p>
          <p className="text-justify text-text-grey text-lg leading-relaxed">
            O sistema permite o gerenciamento completo do ciclo de avaliação,
            desde o mapeamento inicial dos segmentos até a geração de
            relatórios finais, contribuindo para a transparência e eficiência
            do processo de avaliação.
          </p>
        </div>

        {/* Seção de Explicações */}
        <section className="relative w-100 mb-12">
          <section className="relative z-[1] container mx-auto lg:w-4/6 my-5 md:my-6 rounded p-12 overflow-auto">
            <div className="flex p-6 justify-between items-center mb-4">
              <div className="relative inline-flex items-center justify-center">
                <h1 className="relative inline-flex items-center justify-center px-4 md:px-8 py-2 md:py-4 
                               gap-4 rounded-full bg-ideciclo-blue shadow-lg text-text-grey text-center 
                               font-lato text-xl md:text-3xl font-black leading-normal z-[0]">
                  O que é?
                </h1>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 341 80"
                     className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                                w-[120%] flex-shrink-0 z-[-1]"
                     style={{fill: '#EFC345', filter: 'drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.25))'}}>
                  <path d="M9.80432 49.4967C9.04999 36.8026 11.6236 24.1085 17.1429 12.7404C22.6622 1.37227 30.5294 -8.52273 39.3846 -10.7C56.0949 -15.0545 73.8052 -15.0545 91.5155 -10.7C100.371 -8.52273 108.238 1.37227 113.757 12.7404C119.276 24.1085 121.85 36.8026 121.096 49.4967L117.628 72.7273C116.874 85.4214 111.355 97.085 103.488 106.659C95.6207 116.232 85.7655 122.458 75.4869 122.458H39.3846C29.1061 122.458 19.2509 116.232 11.3837 106.659C3.51651 97.085 -1.00261 85.4214 -1.75674 72.7273L-5.22432 49.4967Z"/>
                </svg>
              </div>
            </div>
            <div className="relative z-[-2] top-[-50px] text-gray-800 p-12 py-24 mx-auto 
                            bg-background-grey shadow-2xl rounded-lg">
              <p className="text-justify mb-4">
                O IDECICLO – Índice de Desenvolvimento Cicloviário é uma metodologia
                de avaliação qualitativa da infraestrutura cicloviária de uma
                cidade, que considera não apenas a extensão das ciclovias e
                ciclofaixas, mas também a segurança, qualidade e o contexto viário
                em que estão inseridas.
              </p>
              <p className="text-justify">
                Criado inicialmente em 2016 pela Associação Metropolitana de
                Ciclistas do Recife (Ameciclo), o IDECICLO já foi aplicado em mais
                de 34 cidades e áreas brasileiras.
              </p>
            </div>
          </section>
          
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

        {/* Grid de 3 colunas com estilo subpágina */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card Manual */}
            <div className="rounded bg-white shadow-2xl ideciclo-card-hover">
              <div className="flex flex-col bg-white divide-y divide-gray-100">
                <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
                  <h3 className="text-ideciclo-red font-bold text-xl mb-2">MANUAL</h3>
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
                  <h3 className="text-ideciclo-red font-bold text-xl mb-2">FORMULÁRIO</h3>
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
                  <h3 className="text-ideciclo-red font-bold text-xl mb-2">CÁLCULO</h3>
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
      </div>
    </>
  );
};

export default Index;
