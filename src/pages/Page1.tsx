import React, { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IdecicloFormData } from "@/types/idecicloForm";

interface Page1Props {
  data: IdecicloFormData;
  onDataChange: (data: Partial<IdecicloFormData>) => void;
  originalCounts: {
    blocks_count: number | null;
    intersections_count: number | null;
    relevant_intersections_count: number | null;
    connected_intersections_count: number | null;
  };
}

const clampMinimumOne = (value: number) => Math.max(1, Math.round(value));
const clampNonNegative = (value: number) => Math.max(0, Math.round(value));

const Page1: React.FC<Page1Props> = ({ data, onDataChange, originalCounts }) => {
  const [allowBlocksEdit, setAllowBlocksEdit] = useState(false);
  const [allowIntersectionsEdit, setAllowIntersectionsEdit] = useState(false);

  const resolvedOriginals = useMemo(
    () => ({
      blocks_count:
        originalCounts.blocks_count !== null
          ? clampMinimumOne(originalCounts.blocks_count)
          : 1,
      intersections_count:
        originalCounts.intersections_count !== null
          ? clampNonNegative(originalCounts.intersections_count)
          : 0,
      relevant_intersections_count:
        originalCounts.relevant_intersections_count !== null
          ? clampNonNegative(originalCounts.relevant_intersections_count)
          : 0,
      connected_intersections_count:
        originalCounts.connected_intersections_count !== null
          ? clampNonNegative(originalCounts.connected_intersections_count)
          : 0,
    }),
    [originalCounts]
  );

  useEffect(() => {
    setAllowBlocksEdit(originalCounts.blocks_count === null);
  }, [originalCounts.blocks_count]);

  useEffect(() => {
    const hasAllIntersectionValues =
      originalCounts.intersections_count !== null &&
      originalCounts.relevant_intersections_count !== null &&
      originalCounts.connected_intersections_count !== null;

    setAllowIntersectionsEdit(!hasAllIntersectionValues);
  }, [
    originalCounts.connected_intersections_count,
    originalCounts.intersections_count,
    originalCounts.relevant_intersections_count,
  ]);

  const updateCountField = (
    field:
      | "blocks_count"
      | "intersections_count"
      | "relevant_intersections_count"
      | "connected_intersections_count",
    nextValue: number
  ) => {
    if (field === "blocks_count") {
      onDataChange({ blocks_count: clampMinimumOne(nextValue) });
      return;
    }

    if (field === "intersections_count") {
      const intersectionsCount = clampNonNegative(nextValue);
      const relevantIntersectionsCount = Math.min(
        clampNonNegative(data.relevant_intersections_count || 0),
        intersectionsCount
      );
      const connectedIntersectionsCount = Math.min(
        clampNonNegative(data.connected_intersections_count || 0),
        relevantIntersectionsCount
      );

      onDataChange({
        intersections_count: intersectionsCount,
        relevant_intersections_count: relevantIntersectionsCount,
        connected_intersections_count: connectedIntersectionsCount,
      });
      return;
    }

    if (field === "relevant_intersections_count") {
      const relevantIntersectionsCount = Math.min(
        clampNonNegative(nextValue),
        clampNonNegative(data.intersections_count || 0)
      );
      const connectedIntersectionsCount = Math.min(
        clampNonNegative(data.connected_intersections_count || 0),
        relevantIntersectionsCount
      );

      onDataChange({
        relevant_intersections_count: relevantIntersectionsCount,
        connected_intersections_count: connectedIntersectionsCount,
      });
      return;
    }

    onDataChange({
      connected_intersections_count: Math.min(
        clampNonNegative(nextValue),
        clampNonNegative(data.relevant_intersections_count || 0)
      ),
    });
  };

  const handleBlocksEditToggle = (checked: boolean) => {
    setAllowBlocksEdit(checked);

    if (!checked) {
      onDataChange({ blocks_count: resolvedOriginals.blocks_count });
    }
  };

  const handleIntersectionsEditToggle = (checked: boolean) => {
    setAllowIntersectionsEdit(checked);

    if (!checked) {
      const intersectionsCount = resolvedOriginals.intersections_count;
      const relevantIntersectionsCount = Math.min(
        resolvedOriginals.relevant_intersections_count,
        intersectionsCount
      );
      const connectedIntersectionsCount = Math.min(
        resolvedOriginals.connected_intersections_count,
        relevantIntersectionsCount
      );

      onDataChange({
        intersections_count: intersectionsCount,
        relevant_intersections_count: relevantIntersectionsCount,
        connected_intersections_count: connectedIntersectionsCount,
      });
    }
  };

  const renderStepper = ({
    id,
    label,
    value,
    onDecrease,
    onIncrease,
    disabled,
    min,
  }: {
    id: string;
    label: string;
    value: number;
    onDecrease: () => void;
    onIncrease: () => void;
    disabled: boolean;
    min?: number;
  }) => (
    <div className="rounded-xl border p-4">
      <Label htmlFor={id} className="mb-3 block">
        {label}
      </Label>
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-11 rounded-full p-0 text-lg"
          onClick={onDecrease}
          disabled={disabled || value <= (min ?? 1)}
        >
          -
        </Button>
        <div
          id={id}
          className={`flex min-h-[44px] min-w-[72px] items-center justify-center rounded-xl border px-4 text-lg font-bold ${
            disabled ? "bg-slate-100 text-slate-500" : "bg-white text-slate-900"
          }`}
        >
          {value}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-11 rounded-full p-0 text-lg"
          onClick={onIncrease}
          disabled={disabled}
        >
          +
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
        <div className="rounded-2xl border p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">A.2. Conectividade da rede cicloviaria</div>
              <p className="text-sm text-muted-foreground">
                Primeiro confirme o numero de quadras do trecho. Depois ajuste as intersecoes
                relevantes e quantas delas conectam com outra infraestrutura.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Quadras do trecho</div>
                  <p className="text-sm text-muted-foreground">
                    Quando houver dado prévio do trecho, ele fica bloqueado até a correção em campo.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline">
                    Original:{" "}
                    {originalCounts.blocks_count !== null ? resolvedOriginals.blocks_count : "Sem dado"}
                  </Badge>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="allow_blocks_edit" className="text-sm">
                      Corrigir quadras
                    </Label>
                    <Switch
                      id="allow_blocks_edit"
                      checked={allowBlocksEdit}
                      onCheckedChange={handleBlocksEditToggle}
                    />
                  </div>
                </div>
              </div>

              {renderStepper({
                id: "blocks_count",
                label: "N° quadras:",
                value: clampMinimumOne(data.blocks_count || 1),
                disabled: !allowBlocksEdit,
                min: 1,
                onDecrease: () =>
                  updateCountField("blocks_count", clampMinimumOne(data.blocks_count || 1) - 1),
                onIncrease: () =>
                  updateCountField("blocks_count", clampMinimumOne(data.blocks_count || 1) + 1),
              })}
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Intersecoes consideradas em A.2</div>
                  <p className="text-sm text-muted-foreground">
                Interseções com arteriais/coletoras nunca passam do total de interseções, e as com
                infra cicloviária nunca passam das arteriais/coletoras.
              </p>
                </div>
                <div className="flex items-center gap-3">
                  <Label htmlFor="allow_intersections_edit" className="text-sm">
                    Corrigir interseções
                  </Label>
                  <Switch
                    id="allow_intersections_edit"
                    checked={allowIntersectionsEdit}
                    onCheckedChange={handleIntersectionsEditToggle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {renderStepper({
                  id: "intersections_count",
                  label: "N° Interseções:",
                  value: clampNonNegative(data.intersections_count || 0),
                  disabled: !allowIntersectionsEdit,
                  min: 0,
                  onDecrease: () =>
                    updateCountField(
                      "intersections_count",
                      clampNonNegative(data.intersections_count || 0) - 1
                    ),
                  onIncrease: () =>
                    updateCountField(
                      "intersections_count",
                      clampNonNegative(data.intersections_count || 0) + 1
                    ),
                })}
                {renderStepper({
                  id: "relevant_intersections_count",
                  label: "Interseções com arteriais/coletoras:",
                  value: clampNonNegative(data.relevant_intersections_count || 0),
                  disabled: !allowIntersectionsEdit,
                  min: 0,
                  onDecrease: () =>
                    updateCountField(
                      "relevant_intersections_count",
                      clampNonNegative(data.relevant_intersections_count || 0) - 1
                    ),
                  onIncrease: () =>
                    updateCountField(
                      "relevant_intersections_count",
                      clampNonNegative(data.relevant_intersections_count || 0) + 1
                    ),
                })}
                {renderStepper({
                  id: "connected_intersections_count",
                  label: "Interseções com arteriais/coletoras com infra cicloviária:",
                  value: clampNonNegative(data.connected_intersections_count || 0),
                  disabled: !allowIntersectionsEdit,
                  min: 0,
                  onDecrease: () =>
                    updateCountField(
                      "connected_intersections_count",
                      clampNonNegative(data.connected_intersections_count || 0) - 1
                    ),
                  onIncrease: () =>
                    updateCountField(
                      "connected_intersections_count",
                      clampNonNegative(data.connected_intersections_count || 0) + 1
                    ),
                })}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Page1;
