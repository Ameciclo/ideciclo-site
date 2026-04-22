import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page2Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  segmentType: string;
}

const TYPOLOGY_OPTIONS = [
  {
    value: "Ciclovia",
    label: "Ciclovia",
    className: "ideciclo-typology-chip ideciclo-typology-chip-ciclovia",
  },
  {
    value: "Ciclofaixa",
    label: "Ciclofaixa",
    className: "ideciclo-typology-chip ideciclo-typology-chip-ciclofaixa",
  },
  {
    value: "Compartilhada",
    label: "Calçada Partilhada",
    className: "ideciclo-typology-chip ideciclo-typology-chip-calcada",
  },
  {
    value: "Ciclorrota",
    label: "Ciclorrota",
    className: "ideciclo-typology-chip ideciclo-typology-chip-ciclorrota",
  },
] as const;

const FLOW_OPTIONS = [
  {
    value: "unidirectional",
    label: "Unidirecional",
    icon: "/icones/one-way-cycle.svg",
  },
  {
    value: "bidirectional",
    label: "Bidirecional",
    icon: "/icones/two-way-cycle.svg",
  },
] as const;

const POSITION_OPTIONS = [
  {
    value: "canteiro",
    label: "Sobre o canteiro",
    icon: "/icones/sobre-canteiro.svg",
  },
  {
    value: "pista_canteiro",
    label: "Pista, junto ao canteiro",
    icon: "/icones/proximo-canteiro.svg",
  },
  {
    value: "pista_calcada",
    label: "Pista, junto à calçada",
    icon: "/icones/pista-junto-calcada.svg",
  },
  {
    value: "calcada",
    label: "Sobre a calçada",
    icon: "/icones/na-calcada.svg",
  },
  {
    value: "centro_pista",
    label: "Centro da pista",
    icon: "/icones/centro-pista.svg",
  },
  {
    value: "isolada",
    label: "Isolada",
    icon: "/icones/isolada.svg",
  },
] as const;

const Page2: React.FC<Page2Props> = ({ data, onDataChange, segmentType }) => {
  const [allowTypologyEdit, setAllowTypologyEdit] = useState(false);

  useEffect(() => {
    if (!segmentType) {
      setAllowTypologyEdit(true);
    }
  }, [segmentType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onDataChange({ [name]: value });
  };

  const handleRadioChange = (name: string, value: string) => {
    onDataChange({ [name]: value });
  };

  const handleTypologyEditToggle = (checked: boolean) => {
    setAllowTypologyEdit(checked);

    if (!checked && segmentType) {
      onDataChange({ infra_typology: segmentType });
    }
  };

  const resolvedTypology = data.infra_typology || segmentType || "";
  const isTypologyEdited =
    Boolean(segmentType) &&
    Boolean(data.infra_typology) &&
    data.infra_typology.toLowerCase() !== segmentType.toLowerCase();
  const normalizedTypology = resolvedTypology.trim().toLowerCase();

  const isTypologySelected = (value: string) => {
    const normalizedValue = value.toLowerCase();

    if (normalizedValue === "compartilhada") {
      return normalizedTypology.includes("compart");
    }

    return normalizedTypology.includes(normalizedValue);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div>
          <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <Label htmlFor="infra_typology">Tipologia da infra:</Label>
                <p className="text-sm text-muted-foreground">
                  A tipologia vem da etapa anterior, mas pode ser corrigida em campo se houver erro.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="allow_typology_edit" className="text-sm">
                  Corrigir tipologia em campo
                </Label>
                <Switch
                  id="allow_typology_edit"
                  checked={allowTypologyEdit}
                  onCheckedChange={handleTypologyEditToggle}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <span className="ideciclo-typology-label">Tipologia</span>
              <div className="flex flex-wrap gap-2">
                {TYPOLOGY_OPTIONS.map((option) => {
                  const selected = isTypologySelected(option.value);
                  const clickable = allowTypologyEdit;

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant="ghost"
                      aria-disabled={!clickable}
                      onClick={() => {
                        if (!clickable) return;
                        handleRadioChange("infra_typology", option.value);
                      }}
                      className={`${option.className} h-auto border border-transparent px-4 py-2 ${
                        selected
                          ? "ring-2 ring-black/15 opacity-100 saturate-100"
                          : "opacity-40 saturate-50"
                      } ${
                        clickable
                          ? "cursor-pointer hover:opacity-85"
                          : "cursor-default"
                      }`}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {!allowTypologyEdit ? (
              <Input
                id="infra_typology"
                name="infra_typology"
                value={resolvedTypology}
                readOnly
                disabled
                className="bg-gray-100"
              />
            ) : (
              <div className="space-y-3">
                <Alert>
                  <AlertTitle>Atenção ao alterar a tipologia</AlertTitle>
                  <AlertDescription>
                    Essa mudança afeta os critérios exibidos e o cálculo da avaliação. Use apenas
                    quando a classificação prévia do trecho estiver incorreta.
                  </AlertDescription>
                </Alert>

                {segmentType ? (
                  <p className="text-sm text-muted-foreground">
                    Tipologia original do trecho: <strong>{segmentType}</strong>
                  </p>
                ) : null}

                <p className="text-sm text-muted-foreground">
                  Clique na tipologia acima para corrigir a classificação do trecho.
                </p>

                {isTypologyEdited ? (
                  <p className="text-sm font-medium text-amber-700">
                    A tipologia foi corrigida em campo e está diferente da classificação original.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Fluxo da infra:</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FLOW_OPTIONS.map((option) => {
              const isSelected = (data.infra_flow || "unidirectional") === option.value;

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant="ghost"
                  className={`h-auto justify-start rounded-2xl border px-4 py-4 transition-all ${
                    isSelected
                      ? "border-emerald-700 bg-emerald-50 shadow-sm opacity-100"
                      : "border-slate-200 bg-white opacity-45 hover:opacity-85"
                  }`}
                  onClick={() => handleRadioChange("infra_flow", option.value)}
                >
                  <div className="flex w-full items-center gap-4">
                    <img
                      src={option.icon}
                      alt={option.label}
                      className="h-16 w-16 shrink-0 object-contain"
                    />
                    <span className="text-left text-base font-semibold text-slate-700">
                      {option.label}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="mb-3 block">Posição na via:</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {POSITION_OPTIONS.map((option) => {
              const isSelected = (data.position_on_road || "pista_calcada") === option.value;

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant="ghost"
                  className={`h-auto justify-start rounded-2xl border px-4 py-4 transition-all ${
                    isSelected
                      ? "border-emerald-700 bg-emerald-50 shadow-sm opacity-100"
                      : "border-slate-200 bg-white opacity-45 hover:opacity-85"
                  }`}
                  onClick={() => handleRadioChange("position_on_road", option.value)}
                >
                  <div className="flex w-full items-center gap-4">
                    <img
                      src={option.icon}
                      alt={option.label}
                      className="h-16 w-16 shrink-0 object-contain"
                    />
                    <span className="text-left text-base font-semibold text-slate-700">
                      {option.label}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
        </div>

        {String(resolvedTypology || "")
          .toLowerCase()
          .includes("partilh") && (
          <div>
            <Label htmlFor="pedestrian_flow_per_hour_per_meter">
              Fluxo de pedestres por hora por metro:
            </Label>
            <Input
              id="pedestrian_flow_per_hour_per_meter"
              name="pedestrian_flow_per_hour_per_meter"
              type="number"
              value={data.pedestrian_flow_per_hour_per_meter || ""}
              onChange={handleChange}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Se passar de 200 pedestres/hora/metro, a calçada partilhada fica inadequada pelo manual.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Page2;
