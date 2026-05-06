import React, { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { IdecicloFormData } from "@/types/idecicloForm";
import { getA1Decision, getA1FieldLabel } from "@/utils/idecicloAssessment";
import { HelpCircle } from "lucide-react";

interface Page2Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  segmentType: string;
  originalRoadHierarchy: string;
  originalInfraFlow?: string;
  originalPositionOnRoad?: string;
  originalVelocityKmh?: number;
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

const PEDESTRIAN_FLOW_OPTIONS = [
  {
    value: "quase_vazio",
    label: "Espaço quase vazio",
    description: "Fluxo muito baixo, com encontros raros entre pedestres.",
    rangeLabel: "<100 ped/h/m",
    representativeValue: 80,
  },
  {
    value: "ocasional",
    label: "Presença ocasional de pedestres",
    description: "Pedestres aparecem com alguma frequência, mas sem pressão sobre a passagem.",
    rangeLabel: "100-300 ped/h/m",
    representativeValue: 150,
  },
  {
    value: "continuo",
    label: "Fluxo contínuo confortável",
    description: "Há movimento constante, porém ainda com circulação fluida.",
    rangeLabel: "300-800 ped/h/m",
    representativeValue: 500,
  },
  {
    value: "intenso",
    label: "Fluxo intenso",
    description: "A circulação é forte e exige mais desvios e atenção.",
    rangeLabel: "800-1800 ped/h/m",
    representativeValue: 1200,
  },
  {
    value: "saturado",
    label: "Saturado/congestionado",
    description: "A passagem está disputada, com desconforto e lentidão.",
    rangeLabel: ">1800 ped/h/m",
    representativeValue: 2000,
  },
] as const;

const resolvePedestrianFlowCategory = (value?: number) => {
  if (!value || value <= 0) return null;
  if (value < 100) return "quase_vazio";
  if (value < 300) return "ocasional";
  if (value < 800) return "continuo";
  if (value < 1800) return "intenso";
  return "saturado";
};

const Page2: React.FC<Page2Props> = ({
  data,
  onDataChange,
  segmentType,
  originalRoadHierarchy,
  originalInfraFlow,
  originalPositionOnRoad,
  originalVelocityKmh,
  allowHierarchyEdit,
  onHierarchyEditToggle,
  onHierarchySelection,
}) => {
  const [allowTypologyEdit, setAllowTypologyEdit] = useState(false);
  const [allowFlowEdit, setAllowFlowEdit] = useState(false);
  const [allowPositionEdit, setAllowPositionEdit] = useState(false);

  useEffect(() => {
    if (!segmentType) {
      setAllowTypologyEdit(true);
    }
  }, [segmentType]);

  useEffect(() => {
    if (!originalInfraFlow) {
      setAllowFlowEdit(true);
    }
  }, [originalInfraFlow]);

  useEffect(() => {
    if (!originalPositionOnRoad) {
      setAllowPositionEdit(true);
    }
  }, [originalPositionOnRoad]);

  const handleRadioChange = (name: string, value: string) => {
    onDataChange({ [name]: value });
  };

  const handleTypologyEditToggle = (checked: boolean) => {
    setAllowTypologyEdit(checked);

    if (!checked && segmentType) {
      onDataChange({ infra_typology: segmentType });
    }
  };

  const handleFlowEditToggle = (checked: boolean) => {
    setAllowFlowEdit(checked);

    if (!checked) {
      onDataChange({ infra_flow: originalInfraFlow || "unidirectional" });
    }
  };

  const handlePositionEditToggle = (checked: boolean) => {
    setAllowPositionEdit(checked);

    if (!checked) {
      onDataChange({ position_on_road: originalPositionOnRoad || "pista_calcada" });
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

  const selectedSpeedChoices = Array.isArray(data.regulated_speed_choices)
    ? data.regulated_speed_choices
    : [];
  const resolvedSpeedChoices =
    selectedSpeedChoices.length > 0
      ? selectedSpeedChoices
      : data.velocity_kmh > 0
        ? [data.velocity_kmh]
        : originalVelocityKmh
          ? [originalVelocityKmh]
          : [];
  const selectedPedestrianFlowCategory = resolvePedestrianFlowCategory(
    Number(data.pedestrian_flow_per_hour_per_meter || 0)
  );
  const getSpeedCount = (speed: number) =>
    resolvedSpeedChoices.filter((value) => value === speed).length;
  const handleSpeedCountChange = (speed: number, delta: 1 | -1) => {
    const nextChoices =
      delta > 0
        ? [...resolvedSpeedChoices, speed]
        : (() => {
            const next = [...resolvedSpeedChoices];
            const removeIndex = next.lastIndexOf(speed);
            if (removeIndex >= 0) {
              next.splice(removeIndex, 1);
            }
            return next;
          })();
    const normalizedChoices = [...nextChoices].sort((a, b) => a - b);

    onDataChange({
      regulated_speed_choices: normalizedChoices,
      velocity_kmh:
        normalizedChoices.length > 0
          ? normalizedChoices[normalizedChoices.length - 1]
          : 0,
    });
  };

  const handlePedestrianFlowCategorySelect = (
    representativeValue: number
  ) => {
    onDataChange({
      pedestrian_flow_per_hour_per_meter: representativeValue,
    });
  };
  const a1Decision = getA1Decision(data);

  return (
      <div className="space-y-5">
        <Alert>
          <AlertTitle>{a1Decision.headline}</AlertTitle>
          <AlertDescription>
            {a1Decision.detail}
            {a1Decision.missingFields.length > 0
              ? ` Priorize: ${a1Decision.missingFields.map(getA1FieldLabel).join(", ")}.`
              : ""}
          </AlertDescription>
        </Alert>
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

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Label className="block text-base font-semibold text-slate-900">Fluxo da infra</Label>
            <div className="flex items-center gap-3">
              <Label htmlFor="allow_flow_edit" className="text-sm">
                Corrigir fluxo em campo
              </Label>
              <Switch
                id="allow_flow_edit"
                checked={allowFlowEdit}
                onCheckedChange={handleFlowEditToggle}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FLOW_OPTIONS.map((option) => {
              const isSelected = (data.infra_flow || "unidirectional") === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-disabled={!allowFlowEdit}
                  className={`w-full ${selectionCardClassName(isSelected)} ${
                    allowFlowEdit ? "cursor-pointer" : "cursor-default opacity-60"
                  }`}
                  onClick={() => {
                    if (!allowFlowEdit) return;
                    handleRadioChange("infra_flow", option.value);
                  }}
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
          {!allowFlowEdit && originalInfraFlow ? (
            <p className="text-sm text-muted-foreground">
              Fluxo original do trecho:{" "}
              <strong>{originalInfraFlow === "bidirectional" ? "Bidirecional" : "Unidirecional"}</strong>
            </p>
          ) : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <Label className="block text-base font-semibold text-slate-900">Posição na via</Label>
            <div className="flex items-center gap-3">
              <Label htmlFor="allow_position_edit" className="text-sm">
                Corrigir posição em campo
              </Label>
              <Switch
                id="allow_position_edit"
                checked={allowPositionEdit}
                onCheckedChange={handlePositionEditToggle}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {POSITION_OPTIONS.map((option) => {
              const isSelected = (data.position_on_road || "pista_calcada") === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-disabled={!allowPositionEdit}
                  className={`w-full ${selectionCardClassName(isSelected)} ${
                    allowPositionEdit ? "cursor-pointer" : "cursor-default opacity-60"
                  }`}
                  onClick={() => {
                    if (!allowPositionEdit) return;
                    handleRadioChange("position_on_road", option.value);
                  }}
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
          {!allowPositionEdit && originalPositionOnRoad ? (
            <p className="text-sm text-muted-foreground">
              Posição original do trecho:{" "}
              <strong>
                {POSITION_OPTIONS.find((option) => option.value === originalPositionOnRoad)?.label ||
                  originalPositionOnRoad}
              </strong>
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <Label className="block text-base font-semibold text-slate-900">
            Velocidade máxima regulamentada
          </Label>
          <p className="text-sm text-muted-foreground">
            Marque um ou mais valores. A avaliação considera a maior velocidade selecionada.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
            {SPEED_OPTIONS.map((speed) => {
              const count = getSpeedCount(speed);
              const isSelected = count > 0;

              return (
                <div
                  key={speed}
                  className={`flex items-stretch overflow-hidden rounded-2xl border transition ${
                    isSelected
                      ? "border-emerald-700 bg-emerald-50 shadow-sm"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSpeedCountChange(speed, 1)}
                    className="flex flex-1 flex-col items-center gap-2 px-3 py-3 transition hover:bg-slate-50/50"
                  >
                    <img
                      src={`/icones/${speed}-speed.svg`}
                      alt={`${speed} km/h`}
                      className="h-16 w-16 object-contain"
                    />
                    <span className="text-xs font-medium text-slate-600">
                      {isSelected ? `${count} placa${count > 1 ? "s" : ""}` : "Toque para somar"}
                    </span>
                  </button>
                  {isSelected ? (
                    <button
                      type="button"
                      onClick={() => handleSpeedCountChange(speed, -1)}
                      className="flex w-11 shrink-0 items-center justify-center border-l border-emerald-200 bg-white/60 text-slate-500 transition hover:bg-white hover:text-emerald-700"
                      aria-label={`Reduzir ${speed} km/h`}
                      title={`Reduzir ${speed} km/h`}
                    >
                      <span className="text-lg font-semibold leading-none">×</span>
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
          {resolvedSpeedChoices.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Valores registrados: <strong>{resolvedSpeedChoices.join(", ")} km/h</strong>
            </p>
          ) : null}
        </div>

        {String(resolvedTypology || "")
          .toLowerCase()
          .includes("partilh") && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label className="text-base font-semibold text-slate-900">
                  Movimento de pedestres
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Para a A.1, apenas as duas primeiras faixas contam como abaixo do limite operacional de 200 ped/h/m.
                </p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    title="Como observar o movimento de pedestres"
                    aria-label="Como observar o movimento de pedestres"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[min(92vw,720px)] p-4">
                  <div className="space-y-3 text-sm text-slate-700">
                    <div>
                      <div className="font-semibold text-slate-900">
                        O que observar
                      </div>
                      <p className="mt-1">
                        Conte quantas pessoas passam por um trecho da calçada durante um intervalo fixo e considere a largura útil disponível para caminhar.
                      </p>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        Metodologia sugerida
                      </div>
                      <p className="mt-1">
                        Escolha um ponto representativo, conte o fluxo bidirecional total por 1, 5, 10, 15 ou 30 minutos e divida pela largura útil da calçada.
                      </p>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full text-xs sm:text-sm">
                        <thead className="bg-slate-50 text-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold">Categoria</th>
                            <th className="px-3 py-2 text-right font-semibold">ped/h/m</th>
                            <th className="px-3 py-2 text-right font-semibold">1 min</th>
                            <th className="px-3 py-2 text-right font-semibold">5 min</th>
                            <th className="px-3 py-2 text-right font-semibold">10 min</th>
                            <th className="px-3 py-2 text-right font-semibold">15 min</th>
                            <th className="px-3 py-2 text-right font-semibold">30 min</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-slate-200">
                            <td className="px-3 py-2">Espaço quase vazio</td>
                            <td className="px-3 py-2 text-right">&lt;100</td>
                            <td className="px-3 py-2 text-right">&lt;2</td>
                            <td className="px-3 py-2 text-right">&lt;8</td>
                            <td className="px-3 py-2 text-right">&lt;17</td>
                            <td className="px-3 py-2 text-right">&lt;25</td>
                            <td className="px-3 py-2 text-right">&lt;50</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-3 py-2">Presença ocasional de pedestres</td>
                            <td className="px-3 py-2 text-right">100-300</td>
                            <td className="px-3 py-2 text-right">2-5</td>
                            <td className="px-3 py-2 text-right">8-25</td>
                            <td className="px-3 py-2 text-right">17-50</td>
                            <td className="px-3 py-2 text-right">25-75</td>
                            <td className="px-3 py-2 text-right">50-150</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-3 py-2">Fluxo contínuo confortável</td>
                            <td className="px-3 py-2 text-right">300-800</td>
                            <td className="px-3 py-2 text-right">5-13</td>
                            <td className="px-3 py-2 text-right">25-67</td>
                            <td className="px-3 py-2 text-right">50-133</td>
                            <td className="px-3 py-2 text-right">75-200</td>
                            <td className="px-3 py-2 text-right">150-400</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-3 py-2">Fluxo intenso</td>
                            <td className="px-3 py-2 text-right">800-1800</td>
                            <td className="px-3 py-2 text-right">13-30</td>
                            <td className="px-3 py-2 text-right">67-150</td>
                            <td className="px-3 py-2 text-right">133-300</td>
                            <td className="px-3 py-2 text-right">200-450</td>
                            <td className="px-3 py-2 text-right">400-900</td>
                          </tr>
                          <tr className="border-t border-slate-200">
                            <td className="px-3 py-2">Saturado / congestionado</td>
                            <td className="px-3 py-2 text-right">&gt;1800</td>
                            <td className="px-3 py-2 text-right">&gt;30</td>
                            <td className="px-3 py-2 text-right">&gt;150</td>
                            <td className="px-3 py-2 text-right">&gt;300</td>
                            <td className="px-3 py-2 text-right">&gt;450</td>
                            <td className="px-3 py-2 text-right">&gt;900</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>Todos os valores são por metro de largura útil da calçada e consideram o fluxo bidirecional total.</p>
                      <p>Exemplo: uma calçada útil de 2 m, com 50 pessoas em 5 min, resulta em 5 ped/min/m, ou 300 ped/h/m. Isso cai em "Fluxo contínuo confortável".</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="mt-4 grid gap-3">
              {PEDESTRIAN_FLOW_OPTIONS.map((option) => {
                const selected = selectedPedestrianFlowCategory === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePedestrianFlowCategorySelect(option.representativeValue)}
                    className={selectionCardClassName(selected)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{option.label}</div>
                        <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {option.rangeLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
  );
};

export default Page2;
