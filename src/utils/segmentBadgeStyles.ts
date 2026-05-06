import { SegmentType } from "@/types";

export const SEGMENT_TYPE_COLORS: Record<string, string> = {
  Ciclovia: "#ea5b82",
  Ciclofaixa: "#8ea3de",
  Compartilhada: "#71e391",
  Ciclorrota: "#e9cd67",
};

export const getSegmentTypeBadgeClassName = (type: SegmentType | string) => {
  switch (type) {
    case SegmentType.CICLOVIA:
    case "Ciclovia":
      return "border-transparent bg-[#ea5b82] text-slate-900";
    case SegmentType.CICLOFAIXA:
    case "Ciclofaixa":
      return "border-transparent bg-[#8ea3de] text-slate-900";
    case SegmentType.COMPARTILHADA:
    case "Compartilhada":
      return "border-transparent bg-[#71e391] text-slate-900";
    case SegmentType.CICLORROTA:
    case "Ciclorrota":
      return "border-transparent bg-[#e9cd67] text-slate-900";
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
};

export const getHierarchyBadgeClassName = (classification?: string) => {
  if (classification === "estrutural") return "border-rose-200 bg-rose-50 text-rose-700";
  if (classification === "alimentadora") return "border-amber-200 bg-amber-50 text-amber-700";
  if (classification === "local") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
};

export const getEvaluatedBadgeClassName = (evaluated: boolean) =>
  evaluated
    ? "border-emerald-700 bg-emerald-700 text-white"
    : "border-rose-600 bg-rose-600 text-white";
