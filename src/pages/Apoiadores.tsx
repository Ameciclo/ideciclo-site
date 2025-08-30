import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Apoiadores = () => {
  const sponsors = [
    {
      name: "Itaú Unibanco",
      description: "Patrocinador oficial do IDECICLO",
      logo: "/logos/sponsors/itau unibanco.png"
    },
    {
      name: "Tembici",
      description: "Patrocinador oficial do IDECICLO",
      logo: "/logos/sponsors/tembici.png"
    },
  ];

  const partners = [
    {
      name: "AMECICLO",
      description: "Associação Metropolitana de Ciclistas do Recife",
      logo: "/logos/partners/ameciclo.png"
    },
    {
      name: "BH em Ciclo",
      description: "Organização cicloativista de Belo Horizonte",
      logo: "/logos/partners/BH em Ciclo.png"
    },
    {
      name: "Bici Nos Planos MS",
      description: "Coletivo de mobilidade urbana do Mato Grosso do Sul",
      logo: "/logos/partners/Bici Nos Planos MS.png"
    },
    {
      name: "Ciclobservatório IFC",
      description: "Observatório da mobilidade por bicicleta",
      logo: "/logos/partners/Ciclobservatório IFC.png"
    },
    {
      name: "Ciclocidade",
      description: "Associação dos Ciclistas Urbanos de São Paulo",
      logo: "/logos/partners/Ciclocidade.png"
    },
    {
      name: "Cicloiguaçu",
      description: "Coletivo de ciclistas de Foz do Iguaçu",
      logo: "/logos/partners/Cicloiguaçu.png"
    },
    {
      name: "Ciclomobi",
      description: "Organização pela mobilidade urbana sustentável",
      logo: "/logos/partners/Ciclomobi.png"
    },
    {
      name: "ObMob Salvador",
      description: "Observatório da Mobilidade de Salvador",
      logo: "/logos/partners/ObMob Salvador.png"
    },
    {
      name: "Pedaleco",
      description: "Coletivo de ciclistas urbanos",
      logo: "/logos/partners/Pedaleco.png"
    },
    {
      name: "Rodas da Paz",
      description: "Organização pela mobilidade urbana sustentável",
      logo: "/logos/partners/Rodas da Paz.png"
    },
  ];

  const consultants = [
    {
      name: "ITDP Brasil",
      description: "Instituto de Políticas de Transporte e Desenvolvimento",
      logo: "/logos/consultants/itdp brasil.png"
    },
    {
      name: "WRI Brasil",
      description: "World Resources Institute Brasil",
      logo: "/logos/consultants/wri brasil.png"
    },
  ];

  return (
    <>
      {/* Header com Imagem de Capa */}
      <div className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
           style={{backgroundImage: "url('/pages_covers/ideciclo-navcover.png')"}}>
      </div>
      
      {/* Breadcrumb */}
      <nav className="bg-gray-400 text-white px-4 py-2">
        <a href="/" className="hover:underline">Home</a> {">"} <span>Apoiadores</span>
      </nav>

      <div className="container py-8">
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
              Apoiadores
            </h1>
          </div>
        </div>
        
        <div className="mb-8 text-text-grey text-center">
          <p className="mb-4 text-lg">
            O IDECICLO é possível graças ao apoio e colaboração de organizações comprometidas 
            com a promoção da mobilidade urbana sustentável e segura.
          </p>
        </div>

        {/* Patrocinadores */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-ideciclo-red mb-6 text-center">Patrocinadores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sponsors.map((sponsor) => (
              <div key={sponsor.name} 
                   className="flex flex-col rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] 
                              h-full p-6 justify-center align-center bg-white text-text-grey 
                              hover:bg-ideciclo-yellow hover:text-text-grey transition-colors text-center">
                <div className="mx-auto mb-6 w-32 h-32 rounded-full bg-background-grey 
                                flex items-center justify-center overflow-hidden">
                  <img src={sponsor.logo} alt={sponsor.name} className="w-24 h-24 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-ideciclo-red mb-3">{sponsor.name}</h3>
                <p className="text-text-grey">{sponsor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Consultores */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-ideciclo-red mb-6 text-center">Consultores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {consultants.map((consultant) => (
              <div key={consultant.name} 
                   className="flex flex-col rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] 
                              h-full p-6 justify-center align-center bg-white text-text-grey 
                              hover:bg-ideciclo-yellow hover:text-text-grey transition-colors text-center">
                <div className="mx-auto mb-6 w-32 h-32 rounded-full bg-background-grey 
                                flex items-center justify-center overflow-hidden">
                  <img src={consultant.logo} alt={consultant.name} className="w-24 h-24 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-ideciclo-red mb-3">{consultant.name}</h3>
                <p className="text-text-grey">{consultant.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Parceiros */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-ideciclo-red mb-6 text-center">Parceiros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner) => (
              <div key={partner.name} 
                   className="flex flex-col rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] 
                              h-full p-6 justify-center align-center bg-white text-text-grey 
                              hover:bg-ideciclo-yellow hover:text-text-grey transition-colors text-center">
                <div className="mx-auto mb-6 w-32 h-32 rounded-full bg-background-grey 
                                flex items-center justify-center overflow-hidden">
                  <img src={partner.logo} alt={partner.name} className="w-24 h-24 object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-ideciclo-red mb-3">{partner.name}</h3>
                <p className="text-text-grey">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Apoiadores;