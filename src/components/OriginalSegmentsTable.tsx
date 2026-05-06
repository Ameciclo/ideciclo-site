import { Segment, SegmentType } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getPersistedCityData } from "@/utils/persistedCityData";
import { useToast } from "@/hooks/use-toast";

interface SegmentsTableProps {
  segments: Segment[];
  sortDirection?: "asc" | "desc";
  onToggleSortDirection?: () => void;
}

const OriginalSegmentsTable = ({
  segments,
  sortDirection,
  onToggleSortDirection,
}: SegmentsTableProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, openLoginModal, canAccess } = useAuth();
  const { toast } = useToast();

  const handleOpenAssessment = (segmentId: string) => {
    const cityDataRaw = getPersistedCityData();

    let cityName: string | null = null;
    let stateName: string | null = null;

    if (cityDataRaw) {
      try {
        const parsed = JSON.parse(cityDataRaw) as { cityName?: string; stateName?: string };
        cityName = parsed.cityName || null;
        stateName = parsed.stateName || null;
      } catch (error) {
        console.error("Erro ao recuperar escopo da cidade ativa:", error);
      }
    }

    const route = `/avaliacao/formulario-ideciclo/${segmentId}`;

    if (!isAuthenticated) {
      openLoginModal({
        redirectTo: route,
        title: "Entrar para abrir a avaliação",
      });
      return;
    }

    const allowed = canAccess({
      module: "avaliacao_estrutura_cicloviaria",
      state: stateName,
      city: cityName,
    });

    if (!allowed) {
      toast({
        title: "Acesso não autorizado",
        description: "Sua conta não tem permissão para avaliar a cidade ativa.",
        variant: "destructive",
      });
      return;
    }

    navigate(route);
  };

  const getSegmentTypeBadge = (type: SegmentType) => {
    switch (type) {
      case SegmentType.CICLOFAIXA:
        return <Badge variant="default">Ciclofaixa</Badge>;
      case SegmentType.CICLOVIA:
        return <Badge variant="secondary">Ciclovia</Badge>;
      case SegmentType.CICLORROTA:
        return <Badge variant="outline">Ciclorrota</Badge>;
      case SegmentType.COMPARTILHADA:
        return <Badge variant="destructive">Compartilhada</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableCaption>Lista de trechos cicloviários</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="flex items-center gap-2">
                Nome
                {sortDirection !== undefined && onToggleSortDirection && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-6 w-6"
                    onClick={onToggleSortDirection}
                  >
                    {sortDirection === "asc" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                  </Button>
                )}
              </TableHead>

              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Extensão (km)</TableHead>
              <TableHead className="text-right">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Nenhum segmento encontrado
                </TableCell>
              </TableRow>
            ) : (
              segments.map((segment) => (
                <TableRow
                  key={segment.id}
                  className={segment.evaluated ? "bg-muted/30" : undefined}
                >
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{segment.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>{getSegmentTypeBadge(segment.type)}</TableCell>

                  <TableCell className="text-right">
                    {segment.length.toFixed(4)}
                  </TableCell>

                  <TableCell className="text-right">
                    <>{segment.evaluated ? "Avaliado" : "Não avaliado"}</>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAssessment(segment.id)}
                    >
                        {segment.evaluated && segment.id_form ? "Ver Avaliação" : "Avaliar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default OriginalSegmentsTable;
