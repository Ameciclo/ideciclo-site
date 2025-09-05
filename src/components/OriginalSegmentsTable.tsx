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
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={
                          segment.evaluated && segment.id_form
                            ? `/view-evaluation/${segment.id_form}`
                            : `/refinar/formulario/${segment.id}`
                        }
                      >
                        {segment.evaluated && segment.id_form
                          ? "Ver Avaliação"
                          : "Avaliar"}
                      </a>
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
