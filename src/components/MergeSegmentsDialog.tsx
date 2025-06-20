import { useState, useEffect } from "react";
import { Segment, SegmentType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface MergeSegmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSegments: Segment[];
  onConfirm: (name: string, type: SegmentType, classification?: string) => Promise<void>;
}

const MergeSegmentsDialog = ({
  open,
  onOpenChange,
  selectedSegments,
  onConfirm,
}: MergeSegmentsDialogProps) => {
  const [mergedName, setMergedName] = useState<string>("");
  const [mergedType, setMergedType] = useState<SegmentType>(
    SegmentType.CICLOFAIXA
  );
  const [mergedClassification, setMergedClassification] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total length of all selected segments
  const totalLength = selectedSegments.reduce(
    (total, segment) => total + segment.length,
    0
  );

  // Generate default name based on unique segment names
  useEffect(() => {
    if (selectedSegments.length > 0) {
      // Extract unique names from selected segments
      const uniqueNames = Array.from(
        new Set(selectedSegments.map((s) => s.name))
      );
      // Join unique names with " / " separator
      setMergedName(uniqueNames.join(" / "));

      // Set default type
      const types = Array.from(new Set(selectedSegments.map((s) => s.type)));
      if (types.length === 1) {
        setMergedType(types[0]);
      } else {
        setMergedType(SegmentType.CICLOFAIXA); // Default type if multiple
      }
      
      // Set default classification
      const classifications = selectedSegments
        .map(s => s.classification)
        .filter((c): c is string => c !== undefined);
      
      if (classifications.length > 0) {
        const uniqueClassifications = Array.from(new Set(classifications));
        if (uniqueClassifications.length === 1) {
          setMergedClassification(uniqueClassifications[0]);
        } else {
          setMergedClassification(undefined); // Default to undefined if multiple
        }
      } else {
        setMergedClassification(undefined);
      }
    }
  }, [selectedSegments]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(mergedName, mergedType, mergedClassification);
      onOpenChange(false);
    } catch (error) {
      console.error("Error merging segments:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if all selected segments have the same type
  const haveSameType =
    selectedSegments.length > 0 &&
    selectedSegments.every((s) => s.type === selectedSegments[0].type);
    
  // Check if all selected segments have the same classification
  const haveSameClassification =
    selectedSegments.length > 0 &&
    selectedSegments.every((s) => s.classification === selectedSegments[0].classification);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mesclar segmentos</DialogTitle>
          <DialogDescription>
            Defina um nome e tipo para o novo segmento mesclado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={mergedName}
              onChange={(e) => setMergedName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Extensão</Label>
            <div className="col-span-3">
              <p className="text-sm font-semibold">
                {totalLength.toFixed(4)} km
              </p>
              <p className="text-xs text-muted-foreground">
                Soma da extensão dos segmentos selecionados
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Tipo</Label>
            <div className="col-span-3">
              {haveSameType ? (
                <p className="text-sm font-semibold">
                  {selectedSegments[0].type}
                </p>
              ) : (
                <RadioGroup
                  value={mergedType}
                  onValueChange={(value) => setMergedType(value as SegmentType)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={SegmentType.CICLOFAIXA}
                      id="ciclofaixa"
                    />
                    <Label htmlFor="ciclofaixa">Ciclofaixa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={SegmentType.CICLOVIA}
                      id="ciclovia"
                    />
                    <Label htmlFor="ciclovia">Ciclovia</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={SegmentType.CICLORROTA}
                      id="ciclorrota"
                    />
                    <Label htmlFor="ciclorrota">Ciclorrota</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={SegmentType.COMPARTILHADA}
                      id="compartilhada"
                    />
                    <Label htmlFor="compartilhada">Compartilhada</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Classificação</Label>
            <div className="col-span-3">
              {haveSameClassification && selectedSegments[0].classification ? (
                <p className="text-sm font-semibold capitalize">
                  {selectedSegments[0].classification}
                </p>
              ) : (
                <RadioGroup
                  value={mergedClassification || ""}
                  onValueChange={(value) => setMergedClassification(value || undefined)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="estrutural"
                      id="estrutural"
                    />
                    <Label htmlFor="estrutural">Estrutural</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="alimentadora"
                      id="alimentadora"
                    />
                    <Label htmlFor="alimentadora">Alimentadora</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="local"
                      id="local"
                    />
                    <Label htmlFor="local">Local</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value=""
                      id="nao-classificada"
                    />
                    <Label htmlFor="nao-classificada">Não classificada</Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !mergedName.trim()}
          >
            {isSubmitting ? "Processando..." : "Mesclar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MergeSegmentsDialog;