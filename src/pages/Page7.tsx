import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface Page7Props {
  data: any;
  onDataChange: (data: any) => void;
}

const Page7: React.FC<Page7Props> = ({ data, onDataChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    onDataChange({ [name]: processedValue });
  };

  const handleRadioChange = (name: string, value: string | boolean) => {
    onDataChange({ [name]: value });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    onDataChange({ [name]: checked });
  };

  const handleConflictCheckboxChange = (conflict: string, checked: boolean) => {
    const currentConflicts = [...(data.motorized_conflicts || [])];
    if (checked) {
      if (!currentConflicts.includes(conflict)) {
        currentConflicts.push(conflict);
      }
    } else {
      const index = currentConflicts.indexOf(conflict);
      if (index !== -1) {
        currentConflicts.splice(index, 1);
      }
    }
    onDataChange({ motorized_conflicts: currentConflicts });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">B.5. Acessibilidade relativa ao uso do solo lindeiro</h3>
          <div className="space-y-4">
            <div>
              <Label className="block mb-2">N° de faixas de rolamento:</Label>
              <RadioGroup
                value={data.traffic_lanes_count?.toString() || "2"}
                onValueChange={(value) => handleRadioChange("traffic_lanes_count", parseInt(value))}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="lanes_1" />
                  <Label htmlFor="lanes_1">1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="lanes_2" />
                  <Label htmlFor="lanes_2">2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="lanes_3" />
                  <Label htmlFor="lanes_3">3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4" id="lanes_4" />
                  <Label htmlFor="lanes_4">4</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="lanes_5" />
                  <Label htmlFor="lanes_5">5</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6" id="lanes_6" />
                  <Label htmlFor="lanes_6">6 ou mais</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="block mb-2">N° de travessias sinalizadas na quadra:</Label>
              <RadioGroup
                value={data.signalized_crossings_per_block?.toString() || "0"}
                onValueChange={(value) => handleRadioChange("signalized_crossings_per_block", parseInt(value))}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="crossings_0" />
                  <Label htmlFor="crossings_0">Não há</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="crossings_1" />
                  <Label htmlFor="crossings_1">1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="crossings_2" />
                  <Label htmlFor="crossings_2">2 ou mais</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">B.6. Situações de Risco ao longo da Infraestrutura</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bus_school_conflict"
                checked={data.bus_school_conflict || false}
                onCheckedChange={(checked) => handleCheckboxChange("bus_school_conflict", !!checked)}
              />
              <Label htmlFor="bus_school_conflict">Conflito com paire ônibus ou paire escola</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="horizontal_obstacles"
                checked={data.horizontal_obstacles || false}
                onCheckedChange={(checked) => handleCheckboxChange("horizontal_obstacles", !!checked)}
              />
              <Label htmlFor="horizontal_obstacles">Obstáculos horizontais no trecho</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vertical_obstacles"
                checked={data.vertical_obstacles || false}
                onCheckedChange={(checked) => handleCheckboxChange("vertical_obstacles", !!checked)}
              />
              <Label htmlFor="vertical_obstacles">Obstáculos verticais no trecho</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="side_change_mid_block"
                checked={data.side_change_mid_block || false}
                onCheckedChange={(checked) => handleCheckboxChange("side_change_mid_block", !!checked)}
              />
              <Label htmlFor="side_change_mid_block">Mudança de lado da infraestrutura no meio da quadra</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="opposite_flow_direction"
                checked={data.opposite_flow_direction || false}
                onCheckedChange={(checked) => handleCheckboxChange("opposite_flow_direction", !!checked)}
              />
              <Label htmlFor="opposite_flow_direction">Sentido de circulação da infraestrutura contrário ao fluxo veicular</Label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">C.1/E.4. Sinalização Horizontal Cicloviária nas Interseções</h3>
          <div className="space-y-4">
            <div>
              <Label className="block mb-2">Sinalização:</Label>
              <RadioGroup
                value={data.intersection_signaling || "A"}
                onValueChange={(value) => handleRadioChange("intersection_signaling", value)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A" id="int_A" />
                  <Label htmlFor="int_A">Interseção apresenta pavimento vermelho na largura da infra e linhas tracejadas brancas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B" id="int_B" />
                  <Label htmlFor="int_B">Pavimento em tom vermelho estreito ou pavimento vermelho sem linhas tracejadas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="C" id="int_C" />
                  <Label htmlFor="int_C">Só linhas tracejadadas ou só pictogramas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="D" id="int_D" />
                  <Label htmlFor="int_D">Nenhuma sinalização</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="block mb-2">Estado de conservação da sinalização horizontal:</Label>
              <RadioGroup
                value={data.intersection_conservation || "A"}
                onValueChange={(value) => handleRadioChange("intersection_conservation", value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A" id="int_cons_A" />
                  <Label htmlFor="int_cons_A">Sinalização em bom estado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B" id="int_cons_B" />
                  <Label htmlFor="int_cons_B">Sinalização danificada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="C" id="int_cons_C" />
                  <Label htmlFor="int_cons_C">Não há sinalização</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">C.2. Acessibilidade entre Conexões Cicloviárias</h3>
          <RadioGroup
            value={data.connection_accessibility || "A"}
            onValueChange={(value) => handleRadioChange("connection_accessibility", value)}
            className="grid grid-cols-1 gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="A" id="conn_A" />
              <Label htmlFor="conn_A">A conexão entre infraestruturas possui acessbilidade universal, e é bem visível.</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="B" id="conn_B" />
              <Label htmlFor="conn_B">A conexão possui degraus (com ou sem canaletas).</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="C" id="conn_C" />
              <Label htmlFor="conn_C">Não é possível ver a conexão.</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">C.3. Conflitos com Circulação de Modos Motorizados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="conflict_no_conversion"
                checked={(data.motorized_conflicts || []).includes("no_conversion")}
                onCheckedChange={(checked) => handleConflictCheckboxChange("no_conversion", !!checked)}
              />
              <Label htmlFor="conflict_no_conversion">Não há conversão de modos motorizados sobre a infraestrutura cicloviária.</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="conflict_conversion"
                checked={(data.motorized_conflicts || []).includes("conversion")}
                onCheckedChange={(checked) => handleConflictCheckboxChange("conversion", !!checked)}
              />
              <Label htmlFor="conflict_conversion">Há conversão de modos motorizados sobre a infraestrutura cicloviária.</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="conflict_exclusive_signal"
                checked={(data.motorized_conflicts || []).includes("exclusive_signal")}
                onCheckedChange={(checked) => handleConflictCheckboxChange("exclusive_signal", !!checked)}
              />
              <Label htmlFor="conflict_exclusive_signal">Há estágio semafórico com tempo exclusivo para ciclistas.</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="conflict_protection"
                checked={(data.motorized_conflicts || []).includes("protection")}
                onCheckedChange={(checked) => handleConflictCheckboxChange("protection", !!checked)}
              />
              <Label htmlFor="conflict_protection">Há medidas de proteção para os ciclistas nas esquinas.</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="conflict_pedestrian_signal"
                checked={(data.motorized_conflicts || []).includes("pedestrian_signal")}
                onCheckedChange={(checked) => handleConflictCheckboxChange("pedestrian_signal", !!checked)}
              />
              <Label htmlFor="conflict_pedestrian_signal">Há estágio semafórico de pedestres, que possibilita a circulação conjunta.</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="conflict_traffic_calming"
                checked={(data.motorized_conflicts || []).includes("traffic_calming")}
                onCheckedChange={(checked) => handleConflictCheckboxChange("traffic_calming", !!checked)}
              />
              <Label htmlFor="conflict_traffic_calming">Há medidas de acalmamento de tráfego na via, mas não orientadas para a condição de travessia de ciclistas.</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Page7;