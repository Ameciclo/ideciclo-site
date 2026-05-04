import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page2Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  segmentType: string;
  originalRoadHierarchy: string;
  allowHierarchyEdit: boolean;
  onHierarchyEditToggle: (checked: boolean) => void;
  onHierarchySelection: (value: string) => void;
}

const SPEED_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

const HIERARCHY_OPTIONS = [
  { value: "local", label: "Local" },
  { value: "alimentadora", label: "Alimentadora" },
  { value: "estrutural", label: "Estrutural" },
] as const;

const normalizeHierarchyValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

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

const Page2: React.FC<Page2Props> = ({
  data,
  onDataChange,
  segmentType,
  originalRoadHierarchy,
  allowHierarchyEdit,
  onHierarchyEditToggle,
  onHierarchySelection,
}) => {
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
  const resolvedHierarchy = data.road_hierarchy || data.classification || originalRoadHierarchy || "";
  const normalizedHierarchy = normalizeHierarchyValue(resolvedHierarchy);
  const normalizedOriginalHierarchy = normalizeHierarchyValue(originalRoadHierarchy || "");
  const isHierarchyEdited =
    allowHierarchyEdit &&
    Boolean(normalizedHierarchy) &&
    Boolean(normalizedOriginalHierarchy) &&
    normalizedHierarchy !== normalizedOriginalHierarchy;

  const isTypologySelected = (value: string) => {
    const normalizedValue = value.toLowerCase();

    if (normalizedValue === "compartilhada") {
      return normalizedTypology.includes("compart");
    }

    return normalizedTypology.includes(normalizedValue);
  };

  const selectionCardClassName = (selected: boolean) =>
    `rounded-2xl border px-4 py-4 text-left transition-all ${
      selected
        ? "border-emerald-700 bg-emerald-50 shadow-sm"
        : "border-slate-200 bg-white hover:bg-slate-50"
    }`;

  const compactChipClassName = (selected: boolean, muted = false) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition ${
      selected
        ? "border-slate-900 bg-slate-900 text-white"
        : muted
          ? "border-slate-200 bg-white text-slate-400"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
    }`;

  return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <Label htmlFor="road_hierarchy" className="text-base font-semibold text-slate-900">
                Hierarquia viária
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">
                A hierarquia original vem do cadastro do trecho e entra no cálculo de adequação da
                tipologia.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="allow_hierarchy_edit" className="text-sm">
                Corrigir hierarquia em campo
              </Label>
              <Switch
                id="allow_hierarchy_edit"
                checked={allowHierarchyEdit}
                onCheckedChange={onHierarchyEditToggle}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {HIERARCHY_OPTIONS.map((option) => {
              const isSelected = normalizedHierarchy === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-disabled={!allowHierarchyEdit}
                  onClick={() => {
                    if (!allowHierarchyEdit) return;
                    onHierarchySelection(option.value);
                  }}
                  className={`${compactChipClassName(
                    isSelected,
                    !allowHierarchyEdit && !isSelected
                  )} ${allowHierarchyEdit ? "cursor-pointer" : "cursor-default"}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {!allowHierarchyEdit ? null : (
            <div className="mt-4 space-y-3">
              <Alert>
                <AlertTitle>Atenção ao alterar a hierarquia</AlertTitle>
                <AlertDescription>
                  Essa mudança afeta o enquadramento do A.1. Use apenas quando a classificação
                  prévia do trecho estiver incorreta.
                </AlertDescription>
              </Alert>

              {originalRoadHierarchy ? (
                <p className="text-sm text-muted-foreground">
                  Hierarquia original do trecho: <strong>{originalRoadHierarchy}</strong>
                </p>
              ) : null}

              <p className="text-sm text-muted-foreground">
                Clique na hierarquia acima para corrigir a classificação do trecho.
              </p>

              {isHierarchyEdited ? (
                <p className="text-sm font-medium text-amber-700">
                  A hierarquia foi corrigida em campo e está diferente da classificação original.
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <Label htmlFor="infra_typology" className="text-base font-semibold text-slate-900">
                  Tipologia da infra
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
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

            <div className="mt-4 flex flex-wrap gap-3">
                {TYPOLOGY_OPTIONS.map((option) => {
                  const selected = isTypologySelected(option.value);
                  const clickable = allowTypologyEdit;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-disabled={!clickable}
                      onClick={() => {
                        if (!clickable) return;
                        handleRadioChange("infra_typology", option.value);
                      }}
                      className={`${option.className} min-h-[56px] rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        selected
                          ? "border-black/10 ring-2 ring-black/10 opacity-100 saturate-100"
                          : clickable
                            ? "border-slate-200 opacity-60 saturate-75 hover:opacity-85"
                            : "border-slate-200 opacity-45 saturate-50"
                      } ${clickable ? "cursor-pointer" : "cursor-default"}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
            </div>

            {!allowTypologyEdit ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Tipologia original do trecho: <strong>{resolvedTypology || "Não informada"}</strong>
              </p>
            ) : (
              <div className="mt-4 space-y-3">
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

        <div className="space-y-3">
          <Label className="block text-base font-semibold text-slate-900">Fluxo da infra</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FLOW_OPTIONS.map((option) => {
              const isSelected = (data.infra_flow || "unidirectional") === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full ${selectionCardClassName(isSelected)}`}
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
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="block text-base font-semibold text-slate-900">Posição na via</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {POSITION_OPTIONS.map((option) => {
              const isSelected = (data.position_on_road || "pista_calcada") === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full ${selectionCardClassName(isSelected)}`}
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
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="block text-base font-semibold text-slate-900">
            Velocidade máxima regulamentada
          </Label>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
            {SPEED_OPTIONS.map((speed) => {
              const isSelected = data.velocity_kmh === speed;

              return (
                <button
                  key={speed}
                  type="button"
                  className={`flex h-auto w-full flex-col gap-2 ${selectionCardClassName(isSelected)} px-3 py-3`}
                  onClick={() => onDataChange({ velocity_kmh: speed })}
                >
                  <img
                    src={`/icones/${speed}-speed.svg`}
                    alt={`${speed} km/h`}
                    className="h-16 w-16 object-contain"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {String(resolvedTypology || "")
          .toLowerCase()
          .includes("partilh") && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <Label
              htmlFor="pedestrian_flow_per_hour_per_meter"
              className="text-base font-semibold text-slate-900"
            >
              Fluxo de pedestres por hora por metro:
            </Label>
            <Input
              id="pedestrian_flow_per_hour_per_meter"
              name="pedestrian_flow_per_hour_per_meter"
              type="number"
              value={data.pedestrian_flow_per_hour_per_meter || ""}
              onChange={handleChange}
              className="mt-3"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Se passar de 200 pedestres/hora/metro, a calçada partilhada fica inadequada pelo manual.
            </p>
          </div>
        )}
      </div>
  );
};

export default Page2;
