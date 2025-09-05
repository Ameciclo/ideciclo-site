import { HeroSection } from "@/components/sections/HeroSection";
import { ExplanationSection } from "@/components/sections/ExplanationSection";
import { InfoCardsSection } from "@/components/sections/InfoCardsSection";
import { AccordionSection } from "@/components/sections/AccordionSection";
import { SupportersSection } from "@/components/sections/SupportersSection";
import sectionsData from "@/data/sections.json";
import cardsData from "@/data/cards.json";
import accordionData from "@/data/accordion.json";
import partnersData from "@/data/partners.json";
import consultantsData from "@/data/consultants.json";
import sponsorsData from "@/data/sponsors.json";

const Index = () => {
  return (
    <>
      <HeroSection coverUrl={"/pages_covers/ideciclo-navcover.png"} />
      <ExplanationSection sections={sectionsData} />

      <div className="container mt-36">
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-8">
          <a
            href="https://drive.google.com/uc?export=download&id=1fmf9-e1kMFoUasa88FGLx69zY_VA5srK" // <-- ajuste o destino
            role="button"
            aria-label="Abrir Manual do Ideciclo"
            className="relative flex flex-col justify-center rounded-[40px] font-semibold text-xl mx-auto w-full md:w-[468px] p-6 text-center tracking-wide shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-[1px] md:min-h-[150px]"
            style={{
              background: "#EFC345",
              boxShadow: "0px 6px 8px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <img
              src={"public/icones/qualidade-do-projeto.svg"}
              className="absolute -top-20 left-1/2 -translate-x-1/2"
              style={{ height: "108px", width: "104px" }}
              alt=""
            />
            <h3 className="text-xl font-semibold">Manual do Ideciclo</h3>
            <h3 className="text-2xl font-bold mt-1">E confira como funciona</h3>
          </a>

          <a
            href="https://drive.google.com/uc?export=download&id=1UuNs1iKAknE5jiK4a0ePIZvffkxt-IWa" // <-- ajuste o destino
            role="button"
            aria-label="Baixar formulário de avaliação"
            className="relative flex flex-col justify-center rounded-[40px] font-semibold text-xl mx-auto w-full md:w-[468px] p-6 text-center tracking-wide shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-[1px] md:min-h-[150px]"
            style={{
              background: "#5AC2E1",
              boxShadow: "0px 6px 8px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <img
              src={"public/icones/conflitos-ao-longo.svg"}
              className="absolute -top-20 left-1/2 -translate-x-1/2"
              style={{ height: "108px", width: "104px" }}
              alt=""
            />
            <h3 className="text-xl font-semibold">Formulário de avaliação</h3>
            <h3 className="text-2xl font-bold mt-1">
              Baixe aqui e avalie sua cidade
            </h3>
          </a>
        </div>
      </div>

      {/* <InfoCardsSection cards={cardsData} /> */}
      <AccordionSection accordion={accordionData} />
      <div className="mx-auto relative z-0">
        <img className="min-h-[100px]" src="/ideciclo-ciclovia.png" alt="" />
      </div>
      <SupportersSection
        partners={partnersData}
        consultants={consultantsData}
        sponsors={sponsorsData}
      />
    </>
  );
};

export default Index;
