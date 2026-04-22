import React from "react";

interface ConceptCriteriaOption {
  value: string;
  label?: string;
  description: React.ReactNode;
}

interface ConceptCriteriaTableProps {
  value?: string | null;
  options: ConceptCriteriaOption[];
  onValueChange: (value: string) => void;
}

const getSelectedTone = (value: string) => {
  if (value === "A") {
    return {
      wrapper: "border-[#8fd1c0]",
      left: "bg-[#b8e5db] text-[#163b38]",
      right: "bg-[#ddf3ee] text-[#163b38]",
    };
  }

  if (value === "B") {
    return {
      wrapper: "border-[#86c5bc]",
      left: "bg-[#9fd3cb] text-[#163b38]",
      right: "bg-[#d6ece8] text-[#163b38]",
    };
  }

  if (value === "C") {
    return {
      wrapper: "border-[#7e9f9d]",
      left: "bg-[#8fafad] text-[#163b38]",
      right: "bg-[#d7e1e1] text-[#163b38]",
    };
  }

  if (value === "D") {
    return {
      wrapper: "border-[#6c8080]",
      left: "bg-[#748987] text-white",
      right: "bg-[#d2dcdb] text-[#163b38]",
    };
  }

  return {
    wrapper: "border-slate-300",
    left: "bg-slate-300 text-slate-700",
    right: "bg-slate-100 text-slate-700",
  };
};

const ConceptCriteriaTable: React.FC<ConceptCriteriaTableProps> = ({
  value,
  options,
  onValueChange,
}) => {
  return (
    <div className="space-y-2" role="radiogroup">
      {options.map((option) => {
        const isSelected = value === option.value;
        const tone = getSelectedTone(option.value);

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onValueChange(option.value)}
            className={`flex w-full overflow-hidden rounded-xl border text-left transition-all ${
              isSelected
                ? `${tone.wrapper} shadow-sm`
                : "border-slate-200 opacity-65 hover:opacity-90"
            }`}
          >
            <div
              className={`flex min-h-[72px] w-[76px] shrink-0 items-center justify-center px-4 text-2xl font-bold ${
                isSelected ? tone.left : "bg-slate-200 text-slate-500"
              }`}
            >
              {option.label || option.value}
            </div>
            <div
              className={`flex min-h-[72px] flex-1 items-center px-5 py-4 text-sm leading-6 md:text-base ${
                isSelected ? tone.right : "bg-slate-50 text-slate-600"
              }`}
            >
              {option.description}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConceptCriteriaTable;
