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
      <InfoCardsSection cards={cardsData} />
      <AccordionSection accordion={accordionData} />
      <div className="mx-auto relative z-0">
        <img className="min-h-[100px]" src="/ideciclo-ciclovia.png" alt="" />
      </div>{" "}
      <SupportersSection
        partners={partnersData}
        consultants={consultantsData}
        sponsors={sponsorsData}
      />
    </>
  );
};

export default Index;
