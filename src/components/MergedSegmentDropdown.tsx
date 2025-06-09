
import { useState } from "react";
import { ChevronDown, ChevronRight, Unlink2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Segment, SegmentType } from "@/types";
import { MergedSegmentInfo } from "@/types/merging";

interface MergedSegmentDropdownProps {
  segment: Segment;
  onUnmergeSegments: (parentSegmentId: string, segmentIds: string[]) => Promise<void>;
}

const MergedSegmentDropdown = ({ 
  segment, 
  onUnmergeSegments 
}: MergedSegmentDropdownProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSegmentTypeBadge = (type: string) => {
    switch (type) {
      case SegmentType.CICLOFAIXA:
        return <Badge variant="default" className="text-xs">Ciclofaixa</Badge>;
      case SegmentType.CICLOVIA:
        return <Badge variant="secondary" className="text-xs">Ciclovia</Badge>;
      case SegmentType.CICLORROTA:
        return <Badge variant="outline" className="text-xs">Ciclorrota</Badge>;
      case SegmentType.COMPARTILHADA:
        return <Badge variant="destructive" className="text-xs">Compartilhada</Badge>;
      default:
        return <Badge className="text-xs">{type}</Badge>;
    }
  };

  const handleUnmergeSegment = async (segmentId: string) => {
    try {
      await onUnmergeSegments(segment.id, [segmentId]);
    } catch (error) {
      console.error("Error unmerging segment:", error);
    }
  };

  const handleUnmergeAll = async () => {
    try {
      const allSegmentIds = segment.merged_segments?.map(s => s.id) || [];
      await onUnmergeSegments(segment.id, allSegmentIds);
    } catch (error) {
      console.error("Error unmerging all segments:", error);
    }
  };

  if (!segment.is_merged || !segment.merged_segments?.length) {
    return null;
  }

  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-0 h-auto text-xs text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 mr-1" />
        ) : (
          <ChevronRight className="w-3 h-3 mr-1" />
        )}
        {segment.merged_segments.length} segmentos mesclados
      </Button>

      {isExpanded && (
        <div className="mt-2 ml-4 space-y-2 border-l-2 border-muted pl-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground">
              Segmentos incluídos:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnmergeAll}
              className="h-6 px-2 text-xs"
            >
              <Unlink2 className="w-3 h-3 mr-1" />
              Desmesclar todos
            </Button>
          </div>
          
          {segment.merged_segments.map((mergedInfo: MergedSegmentInfo) => (
            <div
              key={mergedInfo.id}
              className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-medium truncate">{mergedInfo.name}</span>
                {getSegmentTypeBadge(mergedInfo.type)}
                <span className="text-muted-foreground">
                  {mergedInfo.length.toFixed(4)} km
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnmergeSegment(mergedInfo.id)}
                className="h-6 px-2 ml-2 flex-shrink-0"
              >
                <Unlink2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MergedSegmentDropdown;
