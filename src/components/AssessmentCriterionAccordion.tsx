import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, Trash2 } from "lucide-react";
import ManualHelpDialog from "@/components/ManualHelpDialog";
import { useCriteriaAccordionFilter } from "@/components/criteriaAccordionContext";
import { CriterionScorePreviewItem } from "@/utils/criterionScorePreview";

export interface CriterionPagerConfig {
  count: number;
  currentIndex: number;
  prefix: string;
  onSelect: (index: number) => void;
  itemRatings?: Array<string | null | undefined>;
}

interface AssessmentCriterionAccordionProps {
  value: string;
  title: string;
  description?: string;
  scorePreview?: CriterionScorePreviewItem[];
  answered?: boolean;
  inAnalysis?: boolean;
  onAnalysisChange?: (value: boolean) => void;
  onClear?: () => void;
  helpKey?: string;
  pager?: CriterionPagerConfig;
  extraBadges?: React.ReactNode;
  children: React.ReactNode;
}

const AssessmentCriterionAccordion: React.FC<AssessmentCriterionAccordionProps> = ({
  value,
  title,
  description,
  scorePreview = [],
  answered = false,
  inAnalysis = false,
  onAnalysisChange,
  onClear,
  helpKey,
  pager,
  extraBadges,
  children,
}) => {
  const { filter } = useCriteriaAccordionFilter();
  const ratingBadgeClassName = (rating: string | null | undefined) => {
    if (rating === "A") return "border-transparent bg-[#b8e5db] text-[#163b38]";
    if (rating === "B") return "border-transparent bg-[#9fd3cb] text-[#163b38]";
    if (rating === "C") return "border-transparent bg-[#8fafad] text-[#163b38]";
    if (rating === "D") return "border-transparent bg-[#748987] text-white";
    return "border-slate-200 bg-white text-slate-500";
  };
  const handleClear = () => {
    if (!onClear) return;

    const confirmed = window.confirm(
      "Tem certeza que quer limpar as respostas deste item?"
    );

    if (confirmed) {
      onClear();
    }
  };

  const answerMatches =
    filter.answer === "all" ||
    (filter.answer === "answered" && answered) ||
    (filter.answer === "unanswered" && (!answered || inAnalysis));

  const reviewMatches =
    filter.review === "all" ||
    (filter.review === "analysis" && inAnalysis);

  const hasAnswerFilter = filter.answer !== "all";
  const hasReviewFilter = filter.review !== "all";

  let visible = true;

  if (hasAnswerFilter && hasReviewFilter) {
    visible =
      filter.mode === "and"
        ? answerMatches && reviewMatches
        : answerMatches || reviewMatches;
  } else if (hasAnswerFilter) {
    visible = answerMatches;
  } else if (hasReviewFilter) {
    visible = reviewMatches;
  }

  const hidden = !visible;

  if (hidden) return null;

  const primaryRating = scorePreview.find((item) => item.rating)?.rating;
  const pagerChipClassName = (index: number, isActive: boolean) => {
    const itemRating = pager?.itemRatings?.[index] || primaryRating;

    if (!answered || !itemRating) {
      return isActive
        ? "border-slate-400 bg-white text-slate-900"
        : "border-slate-200 bg-white text-slate-500";
    }

    if (itemRating === "A") {
      return isActive
        ? "border-transparent bg-[#b8e5db] text-[#163b38]"
        : "border-[#b8e5db] bg-[#edf8f5] text-[#163b38]";
    }

    if (itemRating === "B") {
      return isActive
        ? "border-transparent bg-[#9fd3cb] text-[#163b38]"
        : "border-[#9fd3cb] bg-[#ecf7f5] text-[#163b38]";
    }

    if (itemRating === "C") {
      return isActive
        ? "border-transparent bg-[#8fafad] text-[#163b38]"
        : "border-[#8fafad] bg-[#edf2f2] text-[#163b38]";
    }

    return isActive
      ? "border-transparent bg-[#748987] text-white"
      : "border-[#748987] bg-[#e8eceb] text-[#314543]";
  };

  return (
    <AccordionItem
      value={value}
      id={`criterion-${value}`}
      className="overflow-hidden rounded-[24px] border border-slate-200 bg-background px-4 shadow-sm"
    >
      <div className="py-4">
        <AccordionTrigger className="w-full py-0 text-left hover:no-underline [&>svg]:ml-3">
          <div className="min-w-0 pr-2">
            <div className="text-sm font-semibold text-foreground">{title}</div>
            {description ? (
              <p className="mt-1 text-xs font-normal leading-5 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </AccordionTrigger>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {scorePreview.map((item) => (
            <Badge
              key={item.code}
              variant="outline"
              className={`rounded-full px-3 py-1 text-xs ${ratingBadgeClassName(item.rating)}`}
            >
              {item.rating ? <span>{item.rating}</span> : null}
              {item.rating && typeof item.points === "number" ? <span className="mx-1 opacity-70">·</span> : null}
              {typeof item.points === "number" ? (
                <span>{item.points}</span>
              ) : null}
            </Badge>
          ))}
          {extraBadges}
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 text-xs ${
              answered
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-rose-600 bg-rose-600 text-white"
            }`}
          >
            <span className="sm:hidden">{answered ? "Resp." : "Pend."}</span>
            <span className="hidden sm:inline">{answered ? "Respondido" : "Pendente"}</span>
          </Badge>
          {onAnalysisChange ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-pressed={inAnalysis}
              title={inAnalysis ? "Desafixar item" : "Fixar item"}
              className={`h-8 w-8 rounded-full ${
                inAnalysis
                  ? "border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-100/90"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
              onClick={(event) => {
                event.stopPropagation();
                onAnalysisChange(!inAnalysis);
              }}
            >
              <Pin className={`h-4 w-4 ${inAnalysis ? "fill-current" : ""}`} />
              <span className="sr-only">{inAnalysis ? "Desafixar item" : "Fixar item"}</span>
            </Button>
          ) : null}
          {onClear ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleClear}
              title="Limpar respostas deste item"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Limpar respostas deste item</span>
            </Button>
          ) : null}
          {helpKey ? <ManualHelpDialog helpKey={helpKey} compact /> : null}
        </div>

        {pager && pager.count > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2">
              {Array.from({ length: pager.count }, (_, index) => {
                const isActive = index === pager.currentIndex;

                return (
                  <button
                    key={`${value}-${pager.prefix}-${index + 1}`}
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      pager.onSelect(index);
                    }}
                    className={`h-8 rounded-full border px-3 text-xs font-semibold transition ${pagerChipClassName(
                      index,
                      isActive
                    )}`}
                  >
                    {pager.prefix}
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      <AccordionContent className="pt-2 text-sm">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
};

export default AssessmentCriterionAccordion;
