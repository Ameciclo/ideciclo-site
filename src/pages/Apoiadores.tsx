import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Apoiadores = () => {
  const supporters = [
    {
      name: "AMECICLO",
      description: "Associação Metropolitana de Ciclistas do Recife",
      logo: "/ideciclo/ideciclo-logo.png"
    },
    {
      name: "Rodas da Paz",
      description: "Organização pela mobilidade urbana sustentável",
      logo: null
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {supporters.map((supporter) => (
            <div key={supporter.name} 
                 className="flex flex-col rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] 
                            h-full p-6 justify-center align-center bg-white text-text-grey 
                            hover:bg-ideciclo-yellow hover:text-text-grey transition-colors text-center">
              <div className="mx-auto mb-6 w-32 h-32 rounded-full bg-background-grey 
                              flex items-center justify-center overflow-hidden">
                {supporter.logo ? (
                  <img src={supporter.logo} alt={supporter.name} className="w-24 h-24 object-contain" />
                ) : (
                  <div className="w-20 h-20 bg-ideciclo-teal rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {supporter.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-ideciclo-red mb-3">{supporter.name}</h3>
              <p className="text-text-grey">{supporter.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Apoiadores;