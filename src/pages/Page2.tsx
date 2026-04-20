import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
                  onCheckedChange={setAllowTypologyEdit}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
              <span className="ideciclo-typology-label">Tipologia</span>
              <div className="flex flex-wrap gap-2">
                {TYPOLOGY_OPTIONS.map((option) => {
                  const selected = isTypologySelected(option.value);

                  return (
                    <span
                      key={option.value}
                      className={`${option.className} ${
                        selected
                          ? "ring-2 ring-black/15 opacity-100 saturate-100"
                          : "opacity-40 saturate-50"
                      }`}
                    >
                      {option.label}
                    </span>
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

                <Select
                  value={resolvedTypology}
                  onValueChange={(value) => handleRadioChange("infra_typology", value)}
                >
                  <SelectTrigger id="infra_typology">
                    <SelectValue placeholder="Selecione a tipologia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ciclovia">Ciclovia</SelectItem>
                    <SelectItem value="Ciclofaixa">Ciclofaixa</SelectItem>
                    <SelectItem value="Ciclorrota">Ciclorrota</SelectItem>
                    <SelectItem value="Compartilhada">Compartilhada</SelectItem>
                  </SelectContent>
                </Select>

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
          <Label>Posição na via:</Label>
          <RadioGroup
            value={data.position_on_road || "pista_calcada"}
            onValueChange={(value) => handleRadioChange("position_on_road", value)}
            className="grid grid-cols-2 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="canteiro" id="canteiro" />
              <Label htmlFor="canteiro">Sobre o canteiro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pista_canteiro" id="pista_canteiro" />
              <Label htmlFor="pista_canteiro">Pista, junto ao canteiro</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pista_calcada" id="pista_calcada" />
              <Label htmlFor="pista_calcada">Pista, junto à calçada</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="calcada" id="calcada" />
              <Label htmlFor="calcada">Sobre a calçada</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="centro_pista" id="centro_pista" />
              <Label htmlFor="centro_pista">Centro da pista</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="isolada" id="isolada" />
              <Label htmlFor="isolada">Isolada</Label>
            </div>
          </RadioGroup>
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
