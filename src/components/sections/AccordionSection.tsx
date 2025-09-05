import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

export const AccordionSection = ({ accordion }) => {
  const [parametersDialogOpen, setParametersDialogOpen] = useState(false);

  return (
    <div className="container py-8">
      <div className="mx-auto text-center my-12 md:my-6">
        <h3 className="text-4xl font-bold p-6 my-8 mb-[50px] rounded-[40px] bg-ideciclo-teal mx-auto text-white shadow-[0px_6px_8px_rgba(0,0,0,0.25)]">
          Mais sobre o IDECICLO
        </h3>
      </div>

      <div className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          {accordion.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="mt-4">
              <Card className="hover:bg-ideciclo-yellow hover:bg-opacity-20 transition-colors duration-300 rounded-[20px] shadow-[0px_4px_6px_rgba(0,0,0,0.15)]">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <h3 className="text-xl font-semibold text-left text-ideciclo-red">
                    {item.title}
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-2 pb-4">
                    {item.content.map((paragraph, index) => (
                      <p
                        key={index}
                        className="mb-4 text-justify text-text-grey text-lg"
                      >
                        {paragraph}
                      </p>
                    ))}

                    {item.hasButton && (
                      <div className="mb-4">
                        <Button
                          onClick={() => setParametersDialogOpen(true)}
                          className="bg-ideciclo-teal hover:bg-ideciclo-blue text-white rounded-full"
                        >
                          Saiba mais
                        </Button>
                      </div>
                    )}

                    {item.list && (
                      <ul className="list-disc pl-6 mb-4 text-lg text-text-grey">
                        {item.list.map((listItem, index) => (
                          <li key={index} className="mb-2">
                            {listItem}
                          </li>
                        ))}
                      </ul>
                    )}

                    {item.footer && <p className="mb-4">{item.footer}</p>}

                    {item.subtitle && (
                      <h4 className="text-lg font-medium mt-6 mb-3">
                        {item.subtitle}
                      </h4>
                    )}

                    {item.detailedList && (
                      <ul className="list-disc pl-6 mb-4 text-lg">
                        {item.detailedList.map((detailItem, index) => (
                          <li key={index} className="mb-3">
                            <span className="font-medium">
                              {detailItem.title}
                            </span>{" "}
                            {detailItem.description}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <Dialog
        open={parametersDialogOpen}
        onOpenChange={setParametersDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Parâmetros do IDECICLO</DialogTitle>
            <DialogDescription>
              Conheça os 23 parâmetros avaliados na metodologia IDECICLO
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                1. Planejamento Cicloviariário (2 parâmetros)
              </h3>
              <p className="text-sm text-gray-600">
                Avaliação do planejamento e integração da infraestrutura
                cicloviariária
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                2. Projeto Cicloviariário ao Longo da Quadra (11 parâmetros)
              </h3>
              <p className="text-sm text-gray-600">
                Avaliação da qualidade e segurança da infraestrutura ao longo
                das vias
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                3. Projeto Cicloviariário nas Interseções (3 parâmetros)
              </h3>
              <p className="text-sm text-gray-600">
                Avaliação da segurança e continuidade nas interseções
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                4. Urbanidade (3 parâmetros)
              </h3>
              <p className="text-sm text-gray-600">
                Avaliação do contexto urbano e integração com o ambiente
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                5. Manutenção da Infraestrutura (4 parâmetros)
              </h3>
              <p className="text-sm text-gray-600">
                Avaliação do estado de conservação e manutenção
              </p>
            </div>
          </div>
          <DialogClose asChild>
            <Button className="mt-4">Fechar</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};
