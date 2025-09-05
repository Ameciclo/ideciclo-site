import { Button } from "@/components/ui/button";
import type { InfoCard } from "@/types/content";

export const InfoCardsSection = ({ cards }) => {
  const renderInfoCard = (card: InfoCard) => (
    <div
      key={card.title}
      className="rounded bg-white shadow-2xl ideciclo-card-hover"
    >
      <div className="flex flex-col bg-white divide-y divide-gray-100">
        <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
          <h3 className="text-ideciclo-red font-bold text-xl mb-2">
            {card.title}
          </h3>
          <h3 className="text-lg mt-2 mb-4">
            <strong>{card.subtitle}</strong>
          </h3>
        </div>
        <div className="flex flex-col justify-center w-full p-6 text-center tracking-widest">
          <h3 className="text-ideciclo-red font-bold">{card.metric}</h3>
          <h3 className="text-2xl mt-2">
            <strong>{card.value}</strong>
          </h3>
        </div>
        <div className="flex flex-col justify-center w-full p-6 text-center">
          <a href={card.downloadUrl} download className="w-full">
            <Button className="w-full bg-ideciclo-teal hover:bg-ideciclo-blue text-white rounded-full py-3">
              {card.buttonText}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map(renderInfoCard)}
      </div>
    </div>
  );
};
