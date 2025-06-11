import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface SegmentsFiltersProps {
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  selectedRating: string;
  onRatingChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  minLength: string;
  onMinLengthChange: (value: string) => void;
  maxLength: string;
  onMaxLengthChange: (value: string) => void;
  onResetFilters: () => void;
  showRatingFilter?: boolean;
}

export const SegmentsFilters = ({
  nameFilter,
  onNameFilterChange,
  selectedRating,
  onRatingChange,
  selectedType,
  onTypeChange,
  minLength,
  onMinLengthChange,
  maxLength,
  onMaxLengthChange,
  onResetFilters,
  showRatingFilter = true,
}: SegmentsFiltersProps) => {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="filter-name">Procurar por nome:</Label>
          <Input
            id="filter-name"
            type="text"
            className="w-[200px]"
            value={nameFilter}
            onChange={(e) => onNameFilterChange(e.target.value)}
            placeholder="Digite um nome..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="filter-type">Filtrar por tipo:</Label>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ciclovia">Ciclovia</SelectItem>
              <SelectItem value="ciclofaixa">Ciclofaixa</SelectItem>
              <SelectItem value="ciclorrota">Ciclorrota</SelectItem>
              <SelectItem value="compartilhada">Compartilhada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showRatingFilter && (
          <div className="flex items-center gap-2">
            <Label htmlFor="filter-rating">Filtrar por nota:</Label>
            <Select value={selectedRating} onValueChange={onRatingChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Label htmlFor="min-length">Extensão mínima (km):</Label>
          <Input
            id="min-length"
            type="number"
            className="w-[100px]"
            value={minLength}
            onChange={(e) => onMinLengthChange(e.target.value)}
            step="0.001"
            min="0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="max-length">Extensão máxima (km):</Label>
          <Input
            id="max-length"
            type="number"
            className="w-[100px]"
            value={maxLength}
            onChange={(e) => onMaxLengthChange(e.target.value)}
            step="0.001"
            min={minLength || "0"}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="flex items-center gap-2"
        >
          <Filter size={16} /> Limpar Filtros
        </Button>
      </div>
    </div>
  );
};
