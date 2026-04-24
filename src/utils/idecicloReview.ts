import { IdecicloFormData } from "@/types/idecicloForm";
import { CriterionCode } from "@/utils/idecicloAssessment";

const SPEED_MEASURE_LABELS: Record<string, string> = {
  lombada: "Lombada, quebra-molas ou ondulação transversal",
  valas: "Valas transversais",
  faixa_elevada: "Faixa de travessia elevada",
  elevacao_intersecao: "Elevação da interseção viária",
  reducao_largura: "Redução das larguras das faixas",
};

const CONFLICT_LABELS: Record<string, string> = {
  no_conversion: "Não há conversão de modos motorizados sobre a infraestrutura",
  conversion: "Há conversão de modos motorizados sobre a infraestrutura",
  exclusive_signal: "Há estágio semafórico com tempo exclusivo para ciclistas",
  protection: "Há medidas de proteção para ciclistas nas esquinas",
  pedestrian_signal: "Há estágio semafórico de pedestres com circulação conjunta",
  traffic_calming: "Há acalmamento de tráfego sem tratamento específico para ciclistas",
};

const FURNITURE_LABELS: Record<string, string> = {
  bicicletarios: "Bicicletários de uso público",
  estacoes: "Estações de autoatendimento",
  paraciclos: "Paraciclos",
  bebedouros: "Bebedouros públicos",
  compartilhadas: "Sistemas de bicicletas compartilhadas",
};

const PAVEMENT_TYPE_LABELS: Record<string, string> = {
  A: "Piso betuminoso ou cimentício",
  B: "Piso modular",
  C: "Pedra irregular ou piso com vãos",
  D: "Barro, metálico, modular solto ou derrapante",
};

const PAVEMENT_CONSERVATION_LABELS: Record<string, string> = {
  A: "Piso nivelado, sem ondulações",
  B: "Leve desnivelamento, sem exigir frenagem",
  C: "Desnível transversal, buraco raso ou desgaste em até metade da largura útil",
  D: "Degraus, buracos profundos ou desgaste superior à metade da largura útil",
};

const DEVICES_CONSERVATION_LABELS: Record<string, string> = {
  A: "Dispositivos visíveis e íntegros em todo o trecho",
  B: "Dispositivos em bom estado em mais da metade do trecho",
  C: "Dispositivos em menos da metade do trecho ou muito danificados",
  D: "Praticamente não há dispositivos",
};

const SPACING_CONSERVATION_LABELS: Record<string, string> = {
  A: "Demarcação em ótimo estado, visível em toda a extensão",
  B: "Demarcação em bom estado em mais da metade do trecho",
  C: "Demarcação em menos da metade do trecho ou muito danificada",
  D: "Afastamento praticamente inexistente",
};

const SPACE_IDENTIFICATION_LABELS: Record<string, string> = {
  A: "Pavimento ou pintura total em vermelho, ou ao menos nas áreas críticas",
  B: "Faixa de contraste nos dois bordos ao longo da extensão",
  C: "Faixa de contraste em apenas um dos bordos",
  D: "Sem contraste vermelho ou com pintura muito danificada",
};

const IDENTIFICATION_CONSERVATION_LABELS: Record<string, string> = {
  A: "Área útil totalmente identificada em vermelho",
  B: "Mais da metade identificada ou áreas críticas bem marcadas",
  C: "Menos da metade identificada ou muito danificada",
  D: "Identificação praticamente apagada",
};

const PICTOGRAM_CONSERVATION_LABELS: Record<string, string> = {
  A: "Pictogramas visíveis em toda a extensão",
  B: "Pictogramas desgastados, mas presentes ao longo do trecho",
  C: "Sinalização em menos da metade do trecho ou muito danificada",
  D: "Pictogramas praticamente apagados ou inexistentes",
};

const VERTICAL_SIGNS_CONSERVATION_LABELS: Record<string, string> = {
  A: "Placas e postes em bom estado de conservação",
  B: "Menos da metade das placas com danos",
  C: "Placas bastante danificadas ao longo do trecho",
  D: "Não há placas no trecho",
};

const INTERSECTION_SIGNALING_LABELS: Record<string, string> = {
  A: "Pavimento vermelho na largura da infraestrutura e linhas tracejadas brancas",
  B: "Vermelho estreito ou vermelho sem linhas tracejadas",
  C: "Somente linhas tracejadas ou somente pictogramas",
  D: "Nenhuma sinalização cicloviária",
};

const INTERSECTION_CONSERVATION_LABELS: Record<string, string> = {
  A: "Sinalização visível em todas as interseções do trecho",
  B: "Sinalização em mais da metade das interseções, em bom estado",
  C: "Sinalização em menos da metade das interseções ou muito danificada",
  D: "Sinalização praticamente apagada",
};

const CONNECTION_ACCESSIBILITY_LABELS: Record<string, string> = {
  A: "Conexão visível e com acessibilidade física pedalável",
  D: "Conexão inexistente, invisível ou sem acesso adequado",
  NA: "Não se aplica, pois o trecho não possui conexão",
};

const LIGHTING_POST_TYPE_LABELS: Record<string, string> = {
  A: "Postes peatonais",
  B: "Postes convencionais",
};

const LIGHTING_RATING_LABELS: Record<string, string> = {
  A: "Postes peatonais/exclusivos próximos, direcionados e com espaçamento máximo de 30 m",
  B: "Postes ao lado da infraestrutura, direcionados à via, entre 30 m e 50 m",
  C: "Postes distantes, espaçados acima de 50 m ou com barreiras à iluminação direta",
  D: "Não há postes de iluminação no trecho analisado",
};

const LIGHTING_DISTANCE_TO_INFRA_LABELS: Record<string, string> = {
  A: "Postes junto à infraestrutura",
  B: "Postes a mais de 5 m da infraestrutura",
};

const SHADING_COVERAGE_LABELS: Record<string, string> = {
  A: "Sombra em toda a extensão",
  B: "Sombra em mais da metade do trecho",
  C: "Sombra em menos da metade do trecho",
  D: "Sem sombreamento",
};

const VEGETATION_SIZE_LABELS: Record<string, string> = {
  A: "Porte alto",
  B: "Médio porte",
  C: "Baixo porte",
};

const LATERAL_SPACING_TYPE_LABELS: Record<string, string> = {
  linha: "Somente linha de delimitação",
  dispositivos: "Com dispositivos de separação ou segregação",
  apagada: "Pintura apagada ou impossível de avaliar",
};

const CYCLE_TRACK_SEPARATION_LABELS: Record<string, string> = {
  A: "Segregação total dos veículos motorizados",
  B: "Segregação total com aberturas pontuais para acessos aos lotes",
  C: "Elementos de segregação até 2 m entre si, com aberturas pontuais",
  D: "Elementos de segregação acima de 2,5 m entre si ou com muitas aberturas",
};

const BIKE_LANE_SEPARATION_LABELS: Record<string, string> = {
  A: "Dispositivos até 1 m entre si",
  B: "Dispositivos entre 1,5 m e 3 m entre si",
  C: "Dispositivos acima de 3,5 m entre si ou com muitas aberturas",
  D: "Sem dispositivos na infraestrutura",
};

const SHARED_SIDEWALK_SEPARATION_LABELS: Record<string, string> = {
  A: "Espaços diferenciados por tipos de pavimento",
  B: "Espaços diferenciados por sinalização vermelha, marcas e pictogramas",
  C: "Apenas linha/marca horizontal ou pictogramas",
  D: "Sem delimitação entre ciclistas e pedestres",
};

const asLabel = (value: unknown, fallback = "Nao informado") => {
  const raw = String(value ?? "").trim();
  return raw ? raw : fallback;
};

const asBoolLabel = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "Nao informado";
  return value ? "Sim" : "Nao";
};

const labelFromMap = (value: unknown, labels: Record<string, string>) => {
  const key = String(value ?? "").trim();
  if (!key) return "Nao informado";
  return labels[key] || key;
};

const formatMeters = (value: number) => value.toFixed(2).replace(".", ",");

const listFromMap = (values: string[] | undefined, labels: Record<string, string>) => {
  if (!values || values.length === 0) return "Nenhum";
  return values.map((value) => labels[value] || value).join(", ");
};

const getTypologyKey = (typology: string) => {
  const normalized = typology.toLowerCase();
  if (normalized.includes("ciclovia")) return "ciclovia";
  if (normalized.includes("ciclofaixa")) return "ciclofaixa";
  if (normalized.includes("compart") || normalized.includes("calcada")) return "calcada";
  if (normalized.includes("ciclorrota")) return "ciclorrota";
  return "ciclofaixa";
};

const getB3SelectionLabel = (data: IdecicloFormData) => {
  const typologyKey = getTypologyKey(data.infra_typology || "");

  if (typologyKey === "ciclovia") {
    return labelFromMap(data.separation_devices_ciclovia, CYCLE_TRACK_SEPARATION_LABELS);
  }

  if (typologyKey === "calcada") {
    return labelFromMap(data.separation_devices_calcada, SHARED_SIDEWALK_SEPARATION_LABELS);
  }

  return labelFromMap(data.separation_devices_ciclofaixa, BIKE_LANE_SEPARATION_LABELS);
};

export const getCriterionEvidence = (
  criterion: CriterionCode,
  data: IdecicloFormData
): string[] => {
  switch (criterion) {
    case "A1":
      return [
        `Tipologia considerada: ${asLabel(data.infra_typology)}`,
        `Hierarquia viaria: ${asLabel(data.road_hierarchy || data.classification)}`,
        `Velocidade regulamentada: ${data.velocity_kmh || 0} km/h`,
        `Largura da zona de amortecimento: ${data.buffer_width_m || 0} m`,
      ];
    case "A2":
      return [
        `Intersecoes com arteriais/coletoras: ${data.relevant_intersections_count || 0}`,
        `Intersecoes conectadas a outra infraestrutura: ${data.connected_intersections_count || 0}`,
      ];
    case "B1":
      return [
        `Fluxo considerado: ${asLabel(data.infra_flow)}`,
        `Largura media registrada: ${formatMeters(data.width_meters || 0)} m`,
        `Medicoes de largura: ${Array.isArray(data.width_measurements_m) ? data.width_measurements_m.length : 0}`,
        `Inclui sarjeta: ${asBoolLabel(data.includes_gutter)}`,
        `Largura do buffer lateral: ${data.buffer_width_m || 0} m`,
        `Medicoes de buffer: ${Array.isArray(data.buffer_measurements_m) ? data.buffer_measurements_m.length : 0}`,
      ];
    case "B2":
      return [`Tipo de pavimento marcado: ${labelFromMap(data.pavement_type, PAVEMENT_TYPE_LABELS)}`];
    case "B3":
      return [
        `Tipologia da infraestrutura: ${asLabel(data.infra_typology)}`,
        `Delimitacao ou segregacao marcada: ${getB3SelectionLabel(data)}`,
        `Afastamento lateral: ${labelFromMap(data.lateral_spacing_type, LATERAL_SPACING_TYPE_LABELS)}`,
        `Largura do afastamento lateral: ${data.lateral_spacing_width_m || 0} m`,
      ];
    case "B4":
      return [
        `Identificacao do espaco: ${labelFromMap(data.space_identification, SPACE_IDENTIFICATION_LABELS)}`,
        `Pictogramas por quadra: ${data.pictograms_per_block || 0}`,
        `Pictogramas em todas as quadras: ${asBoolLabel(data.pictograms_cover_all_blocks)}`,
        `Placas por quadra: ${data.regulation_signs_per_block || 0}`,
        `Placas nos dois sentidos: ${asBoolLabel(data.signs_both_directions)}`,
      ];
    case "B5":
      const totalCrossings = Array.isArray(data.signalized_crossings_count_by_block) &&
        data.signalized_crossings_count_by_block.length > 0
          ? data.signalized_crossings_count_by_block.reduce(
              (sum, value) => sum + Number(value || 0),
              0
            )
          : Number(data.signalized_crossings_count || 0);
      return [
        `Quadras consideradas: ${data.blocks_count || 0}`,
        `Travessias sinalizadas ao longo do trecho: ${totalCrossings}`,
        `Faixas de rolamento por quadra: ${
          Array.isArray(data.traffic_lanes_count_by_block) && data.traffic_lanes_count_by_block.length > 0
            ? data.traffic_lanes_count_by_block.join(", ")
            : data.traffic_lanes_count || 0
        }`,
        `Densidade de travessias: ${
          data.blocks_count > 0
            ? (totalCrossings / Number(data.blocks_count)).toFixed(2)
            : "0.00"
        } por quadra`,
      ];
    case "B6": {
      const calmingCounts = data.traffic_calming_counts || {};
      return [
        `Elementos contabilizados: ${
          Object.entries(calmingCounts)
            .filter(([, value]) => Number(value) > 0)
            .map(([key, value]) => `${SPEED_MEASURE_LABELS[key] || key}: ${value}`)
            .join(", ") || listFromMap(data.speed_measures, SPEED_MEASURE_LABELS)
        }`,
        `Distancia media entre medidas: ${data.avg_distance_measures_m || 0} m`,
        `Extensao considerada: ${data.extension_m || 0} km`,
      ];
    }
    case "B7":
      return [
        `Ocorrencias marcadas: ${
          [
            data.bus_school_conflict && "Conflito com ponto de onibus ou escola",
            data.horizontal_obstacles && "Obstaculos horizontais",
            data.vertical_obstacles && "Obstaculos verticais",
            data.side_change_mid_block && "Mudanca de lado no meio da quadra",
            data.opposite_flow_direction && "Sentido contrario sem protecao",
          ]
            .filter(Boolean)
            .join(", ") || "Nenhuma"
        }`,
      ];
    case "C1":
      return [
        `Sinalizacao horizontal nas intersecoes: ${labelFromMap(
          data.intersection_signaling,
          INTERSECTION_SIGNALING_LABELS
        )}`,
      ];
    case "C2":
      return [
        `Conexao entre infraestruturas: ${labelFromMap(
          data.connection_accessibility,
          CONNECTION_ACCESSIBILITY_LABELS
        )}`,
      ];
    case "C3":
      return [
        `Elementos de conflito marcados: ${listFromMap(data.motorized_conflicts, CONFLICT_LABELS)}`,
        `Faixas mistas por sentido: ${data.traffic_lanes_per_direction || 0}`,
        `Largura da faixa mista: ${data.mixed_lane_width_m || 0} m`,
        `Ha moderacao no cruzamento: ${asBoolLabel(data.has_intersection_traffic_calming)}`,
      ];
    case "D1":
      if (data.lighting_rating) {
        return [
          `Iluminacao marcada: ${labelFromMap(data.lighting_rating, LIGHTING_RATING_LABELS)}`,
        ];
      }

      return [
        `Existem postes: ${asBoolLabel(data.has_lighting_posts)}`,
        `Tipo de poste: ${labelFromMap(data.lighting_post_type, LIGHTING_POST_TYPE_LABELS)}`,
        `Distancia entre postes: ${data.lighting_distance_m || 0} m`,
        `Direcionados a infraestrutura: ${asBoolLabel(data.lighting_directed)}`,
        `Barreiras abaixo do poste: ${asBoolLabel(data.lighting_barriers)}`,
        `Distancia dos postes a infraestrutura: ${labelFromMap(
          data.lighting_distance_to_infra,
          LIGHTING_DISTANCE_TO_INFRA_LABELS
        )}`,
      ];
    case "D2":
      return [
        `Sombreamento: ${labelFromMap(data.shading_coverage, SHADING_COVERAGE_LABELS)}`,
      ];
    case "D3":
      return [
        `Quadras com mobiliario cicloviario: ${data.blocks_with_cycling_furniture || 0}`,
        `Itens marcados: ${listFromMap(data.cycling_furniture, FURNITURE_LABELS)}`,
      ];
    case "E1":
      return [
        `Conservacao da sinalizacao nas intersecoes: ${labelFromMap(
          data.intersection_conservation,
          INTERSECTION_CONSERVATION_LABELS
        )}`,
      ];
    case "E2":
      return [
        `Conservacao do pavimento: ${labelFromMap(
          data.conservation_state,
          PAVEMENT_CONSERVATION_LABELS
        )}`,
      ];
    case "E3":
      return [
        `Conservacao dos dispositivos: ${labelFromMap(
          data.devices_conservation,
          DEVICES_CONSERVATION_LABELS
        )}`,
        `Conservacao do afastamento lateral: ${labelFromMap(
          data.spacing_conservation,
          SPACING_CONSERVATION_LABELS
        )}`,
      ];
    case "E4":
      if ((data.infra_typology || "").toLowerCase().includes("ciclorrota")) {
        return [
          `Conservacao das inscricoes no pavimento: ${labelFromMap(
            data.pictograms_conservation,
            PICTOGRAM_CONSERVATION_LABELS
          )}`,
        ];
      }

      return [
        `Conservacao da identificacao: ${labelFromMap(
          data.identification_conservation,
          IDENTIFICATION_CONSERVATION_LABELS
        )}`,
        `Conservacao da sinalizacao vertical: ${labelFromMap(
          data.vertical_signs_conservation,
          VERTICAL_SIGNS_CONSERVATION_LABELS
        )}`,
      ];
    default:
      return ["Nenhum parametro resumido para este criterio."];
  }
};
