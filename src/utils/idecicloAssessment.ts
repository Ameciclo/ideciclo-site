import formConfig from "../../form.json";
import { IdecicloFormData } from "@/types/idecicloForm";

export type IdecicloRating = "A" | "B" | "C" | "D";
export type RatingMode = "auto" | "manual";
export type A1DecisionStatus = "pending" | "compatible" | "incompatible";

export const CRITERION_CODES = [
  "A1",
  "A2",
  "B1",
  "B2",
  "B3",
  "B4",
  "B5",
  "B6",
  "B7",
  "C1",
  "C2",
  "C3",
  "D1",
  "D2",
  "D3",
  "E1",
  "E2",
  "E3",
  "E4",
] as const;

export type CriterionCode = (typeof CRITERION_CODES)[number];

type TypologyKey =
  | "ciclovia"
  | "ciclofaixa"
  | "calcada_partilhada"
  | "ciclorrota";

type SectionKey = "A" | "B" | "C" | "D" | "E";

type RatingMap = Partial<Record<CriterionCode, IdecicloRating | null>>;

export interface A1Decision {
  status: A1DecisionStatus;
  rating: IdecicloRating | null;
  missingFields: string[];
  headline: string;
  detail: string;
}

const A1_FIELD_LABELS: Record<string, string> = {
  infra_typology: "tipologia",
  road_hierarchy: "hierarquia viária",
  velocity_kmh: "velocidade regulamentada",
  position_on_road: "posição na via",
  lateral_spacing_width_m: "afastamento lateral",
  pedestrian_flow_per_hour_per_meter: "fluxo de pedestres",
};

interface ConfigItem {
  codigo: CriterionCode;
  nome: string;
  avaliacao: Partial<Record<IdecicloRating, number | null>>;
}

interface ConfigSection {
  nome: string;
  max: number;
  itens: ConfigItem[];
}

interface ScoreItem {
  label: string;
  rating: IdecicloRating | null | undefined;
  points: number | null;
  maxPoints: number;
}

interface ScoreSection {
  label: string;
  score: number;
  rawScore: number;
  max: number;
  items: Record<string, ScoreItem>;
}

type ScoreSections = Record<string, ScoreSection>;

const RATING_ORDER: IdecicloRating[] = ["A", "B", "C", "D"];

export const getMedianRating = (
  ratings: Array<IdecicloRating | null | undefined>
): IdecicloRating | null => {
  const validRatings = ratings.filter((rating): rating is IdecicloRating =>
    RATING_ORDER.includes(rating as IdecicloRating)
  );

  if (validRatings.length === 0) return null;

  const sortedRatings = [...validRatings].sort(
    (left, right) => RATING_ORDER.indexOf(left) - RATING_ORDER.indexOf(right)
  );

  return sortedRatings[Math.floor((sortedRatings.length - 1) / 2)] ?? null;
};

const hasTouchedField = (
  formData: Partial<IdecicloFormData>,
  keys: string[]
) => {
  const touchedFields = formData.touched_fields ?? {};
  return keys.some((key) => Boolean(touchedFields[key]));
};

const B3_MATRIX: Record<IdecicloRating, Record<IdecicloRating, IdecicloRating>> = {
  A: { A: "A", B: "B", C: "C", D: "D" },
  B: { A: "A", B: "B", C: "C", D: "D" },
  C: { A: "B", B: "C", C: "C", D: "D" },
  D: { A: "D", B: "D", C: "D", D: "D" },
};

const B4_CICLOVIA_SHARED_MATRIX: Record<
  IdecicloRating,
  Record<IdecicloRating, IdecicloRating>
> = {
  A: { A: "A", B: "A", C: "B", D: "C" },
  B: { A: "A", B: "B", C: "B", D: "C" },
  C: { A: "B", B: "B", C: "C", D: "D" },
  D: { A: "C", B: "C", C: "D", D: "D" },
};

const B4_CICLOFAIXA_MATRIX: Record<
  IdecicloRating,
  Record<IdecicloRating, IdecicloRating>
> = {
  A: { A: "A", B: "A", C: "B", D: "D" },
  B: { A: "A", B: "B", C: "B", D: "D" },
  C: { A: "B", B: "B", C: "C", D: "D" },
  D: { A: "C", B: "C", C: "D", D: "D" },
};

const E3_MATRIX: Record<IdecicloRating, Record<IdecicloRating, IdecicloRating>> = {
  A: { A: "A", B: "B", C: "C", D: "D" },
  B: { A: "B", B: "B", C: "C", D: "D" },
  C: { A: "C", B: "C", C: "C", D: "D" },
  D: { A: "D", B: "D", C: "D", D: "D" },
};

// Assumption documented in the plan: the E4 matrix is applied between
// space-identification conservation and vertical-sign conservation.
const E4_MATRIX: Record<IdecicloRating, Record<IdecicloRating, IdecicloRating>> = {
  A: { A: "A", B: "B", C: "C", D: "D" },
  B: { A: "A", B: "B", C: "C", D: "D" },
  C: { A: "B", B: "C", C: "C", D: "D" },
  D: { A: "B", B: "C", C: "D", D: "D" },
};

const CRITERION_LABELS: Record<CriterionCode, string> = {
  A1: "Adequação da tipologia à velocidade e hierarquia",
  A2: "Conectividade da rede cicloviária",
  B1: "Espaço útil da infraestrutura cicloviária",
  B2: "Tipo de pavimento",
  B3: "Delimitação da infraestrutura cicloviária",
  B4: "Identificação do espaço cicloviário",
  B5: "Acessibilidade relativa ao uso do solo lindeiro",
  B6: "Medidas de moderação de velocidade",
  B7: "Situações de risco ao longo da infraestrutura",
  C1: "Sinalização horizontal cicloviária nas interseções",
  C2: "Acessibilidade entre conexões cicloviárias",
  C3: "Tratamento dos conflitos com modos motorizados",
  D1: "Iluminação",
  D2: "Conforto térmico",
  D3: "Mobiliário cicloviário",
  E1: "Conservação da sinalização horizontal nas interseções",
  E2: "Conservação do pavimento",
  E3: "Conservação dos elementos de delimitação",
  E4: "Conservação da identificação do espaço cicloviário",
};

const isRating = (value: unknown): value is IdecicloRating =>
  typeof value === "string" && RATING_ORDER.includes(value as IdecicloRating);

const toNumber = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const normalized = value.replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const ratingIndex = (rating: IdecicloRating) => RATING_ORDER.indexOf(rating);

const worseOf = (
  first: IdecicloRating | null | undefined,
  second: IdecicloRating | null | undefined
): IdecicloRating | null => {
  if (!first) return second ?? null;
  if (!second) return first;
  return ratingIndex(first) >= ratingIndex(second) ? first : second;
};

const normalizeTypology = (value: unknown): TypologyKey | null => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("ciclovia")) return "ciclovia";
  if (normalized.includes("ciclofaixa")) return "ciclofaixa";
  if (normalized.includes("ciclorrota")) return "ciclorrota";
  if (normalized.includes("partilhada") || normalized.includes("compartilhada")) {
    return "calcada_partilhada";
  }

  return null;
};

const normalizeHierarchy = (value: unknown): "estrutural" | "alimentadora" | "local" | null => {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("estrut")) return "estrutural";
  if (normalized.includes("alimenta")) return "alimentadora";
  if (normalized.includes("local")) return "local";

  return null;
};

const getFlowType = (value: unknown): "unidirectional" | "bidirectional" => {
  const normalized = String(value ?? "").toLowerCase();
  return normalized.includes("bi") ? "bidirectional" : "unidirectional";
};

const getTypologyConfig = (typology: TypologyKey | null) =>
  typology ? formConfig.tipos?.[typology] : null;

const getCriterionDefinition = (typology: TypologyKey | null, code: CriterionCode) => {
  const config = getTypologyConfig(typology);
  if (!config) return null;

  const section = code[0] as SectionKey;
  const sectionConfig = config.secoes?.[section] as ConfigSection | undefined;
  return sectionConfig?.itens?.find((item) => item.codigo === code) ?? null;
};

export const isCriterionApplicable = (
  formData: Partial<IdecicloFormData>,
  code: CriterionCode
) => {
  const definition = getCriterionDefinition(normalizeTypology(formData.infra_typology), code);

  if (!definition?.avaliacao) return false;

  return Object.values(definition.avaliacao).some((value) => value !== null);
};

const calculateA1 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  return getA1Decision(formData).rating;
};

const hasPositiveNumber = (value: unknown) => toNumber(value) > 0;

const appendMissingField = (missingFields: string[], key: string) => {
  if (!missingFields.includes(key)) {
    missingFields.push(key);
  }
};

const buildA1Decision = (
  status: A1DecisionStatus,
  rating: IdecicloRating | null,
  missingFields: string[],
  headline: string,
  detail: string
): A1Decision => ({
  status,
  rating,
  missingFields,
  headline,
  detail,
});

export const getA1Decision = (
  formData: Partial<IdecicloFormData>
): A1Decision => {
  const typology = normalizeTypology(formData.infra_typology);
  const hierarchy = normalizeHierarchy(formData.road_hierarchy || formData.classification);
  const velocity = toNumber(formData.velocity_kmh);
  const pedestrianFlow = toNumber(formData.pedestrian_flow_per_hour_per_meter);
  const lateralSpacing = toNumber(formData.lateral_spacing_width_m);
  const position = String(formData.position_on_road ?? "").trim();
  const missingFields: string[] = [];

  if (!typology) appendMissingField(missingFields, "infra_typology");
  if (!hierarchy) appendMissingField(missingFields, "road_hierarchy");

  if (missingFields.length > 0) {
    return buildA1Decision(
      "pending",
      null,
      missingFields,
      "A.1 pendente",
      "Defina tipologia e hierarquia para verificar a compatibilidade inicial."
    );
  }

  if (
    typology === "calcada_partilhada" &&
    pedestrianFlow > 200
  ) {
    return buildA1Decision(
      "incompatible",
      "D",
      [],
      "Estrutura incompatível para o IDECICLO",
      "Calçadas partilhadas com fluxo acima de 200 pedestres por hora por metro são incompatíveis."
    );
  }

  if (hierarchy === "estrutural") {
    if (typology === "ciclorrota") {
      return buildA1Decision(
        "incompatible",
        "D",
        [],
        "Estrutura incompatível para o IDECICLO",
        "Ciclorrotas são incompatíveis em vias estruturais."
      );
    }

    if (typology === "ciclofaixa") {
      return buildA1Decision(
        "incompatible",
        "D",
        [],
        "Estrutura incompatível para o IDECICLO",
        "Ciclofaixas são incompatíveis em vias estruturais."
      );
    }

    if (typology === "calcada_partilhada") {
      if (!hasPositiveNumber(formData.pedestrian_flow_per_hour_per_meter)) {
        appendMissingField(missingFields, "pedestrian_flow_per_hour_per_meter");
      }

      return missingFields.length > 0
        ? buildA1Decision(
            "pending",
            null,
            missingFields,
            "A.1 pendente",
            "Informe o fluxo de pedestres para decidir a compatibilidade da calçada partilhada."
          )
        : buildA1Decision(
            "compatible",
            "A",
            [],
            "Estrutura compatível para o IDECICLO",
            "A tipologia é compatível neste enquadramento, condicionado ao fluxo de pedestres informado."
          );
    }

    if (typology === "ciclovia" && velocity <= 0) {
      appendMissingField(missingFields, "velocity_kmh");
      return buildA1Decision(
        "pending",
        null,
        missingFields,
        "A.1 pendente",
        "Informe a velocidade regulamentada para confirmar a compatibilidade da ciclovia estrutural."
      );
    }

    if (velocity >= 70) {
      const bufferedCiclovia =
        typology === "ciclovia" &&
        (lateralSpacing > 0.8 || ["canteiro", "isolada"].includes(position));

      if (!bufferedCiclovia && !["canteiro", "isolada"].includes(position) && lateralSpacing <= 0) {
        appendMissingField(missingFields, "position_on_road");
        appendMissingField(missingFields, "lateral_spacing_width_m");
        return buildA1Decision(
          "pending",
          null,
          missingFields,
          "A.1 pendente",
          "Para ciclovia estrutural em via de alta velocidade, confirme a posição na via ou meça o afastamento lateral."
        );
      }

      return bufferedCiclovia
        ? buildA1Decision(
            "compatible",
            "A",
            [],
            "Estrutura compatível para o IDECICLO",
            "A ciclovia estrutural atende ao A.1 com afastamento lateral suficiente ou implantação protegida."
          )
        : buildA1Decision(
            "incompatible",
            "D",
            [],
            "Estrutura incompatível para o IDECICLO",
            "A ciclovia estrutural em via de alta velocidade exige afastamento lateral maior que 0,8 m ou implantação em canteiro/isolada."
          );
    }

    return buildA1Decision(
      "compatible",
      "A",
      [],
      "Estrutura compatível para o IDECICLO",
      "A tipologia é compatível com a hierarquia estrutural neste cenário."
    );
  }

  if (hierarchy === "alimentadora") {
    if (typology === "ciclorrota") {
      return buildA1Decision(
        "incompatible",
        "D",
        [],
        "Estrutura incompatível para o IDECICLO",
        "Ciclorrotas são incompatíveis em vias alimentadoras."
      );
    }

    if (typology === "ciclovia") {
      return buildA1Decision(
        "compatible",
        "A",
        [],
        "Estrutura compatível para o IDECICLO",
        "Ciclovias são compatíveis com a hierarquia alimentadora neste cenário."
      );
    }

    if (typology === "calcada_partilhada") {
      if (!hasPositiveNumber(formData.pedestrian_flow_per_hour_per_meter)) {
        appendMissingField(missingFields, "pedestrian_flow_per_hour_per_meter");
      }

      return missingFields.length > 0
        ? buildA1Decision(
            "pending",
            null,
            missingFields,
            "A.1 pendente",
            "Informe o fluxo de pedestres para decidir a compatibilidade da calçada partilhada."
          )
        : buildA1Decision(
            "compatible",
            "A",
            [],
            "Estrutura compatível para o IDECICLO",
            "A tipologia é compatível neste enquadramento, condicionado ao fluxo de pedestres informado."
          );
    }

    if (velocity <= 0) {
      appendMissingField(missingFields, "velocity_kmh");
      return buildA1Decision(
        "pending",
        null,
        missingFields,
        "A.1 pendente",
        "Informe a velocidade regulamentada para confirmar a compatibilidade da ciclofaixa alimentadora."
      );
    }

    if (velocity >= 50) {
      return buildA1Decision(
        "incompatible",
        "D",
        [],
        "Estrutura incompatível para o IDECICLO",
        "Ciclofaixas em vias alimentadoras com velocidade de 50 km/h ou mais são incompatíveis."
      );
    }

    return buildA1Decision(
      "compatible",
      "A",
      [],
      "Estrutura compatível para o IDECICLO",
      "A ciclofaixa é compatível com a hierarquia alimentadora nesta velocidade."
    );
  }

  if (hierarchy === "local") {
    if (typology === "calcada_partilhada") {
      return buildA1Decision(
        "incompatible",
        "D",
        [],
        "Estrutura incompatível para o IDECICLO",
        "Calçadas partilhadas são incompatíveis em vias locais."
      );
    }

    if (typology === "ciclovia" || typology === "ciclofaixa") {
      return buildA1Decision(
        "compatible",
        "A",
        [],
        "Estrutura compatível para o IDECICLO",
        "A tipologia é compatível com a hierarquia local."
      );
    }

    if (velocity <= 0) {
      appendMissingField(missingFields, "velocity_kmh");
      return buildA1Decision(
        "pending",
        null,
        missingFields,
        "A.1 pendente",
        "Informe a velocidade regulamentada para decidir a compatibilidade da ciclorrota local."
      );
    }

    if (velocity <= 30) {
      return buildA1Decision(
        "compatible",
        "A",
        [],
        "Estrutura compatível para o IDECICLO",
        "Ciclorrotas em vias locais de até 30 km/h são compatíveis."
      );
    }

    return buildA1Decision(
      "incompatible",
      "D",
      [],
      "Estrutura incompatível para o IDECICLO",
      "Ciclorrotas em vias locais acima de 30 km/h são incompatíveis."
    );
  }

  return buildA1Decision(
    "pending",
    null,
    ["road_hierarchy"],
    "A.1 pendente",
    "Revise a hierarquia da via para concluir a compatibilidade."
  );
};

const calculateA2 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const total = toNumber(formData.relevant_intersections_count);
  const connected = toNumber(formData.connected_intersections_count);

  if (total <= 0) return null;

  const percentage = (connected / total) * 100;

  if (connected >= total) return "A";
  if (percentage >= 65) return "B";
  if (percentage >= 30) return "C";
  return "D";
};

const calculateB1 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  if (!typology || typology === "ciclorrota") return null;

  const width = toNumber(formData.width_meters);
  if (width <= 0) return null;

  const flow = getFlowType(formData.infra_flow);

  if (flow === "bidirectional") {
    if (width >= 3) return "A";
    if (width >= 2.5) return "B";
    if (width >= 2) return "C";
    return "D";
  }

  if (width >= 2) return "A";
  if (width >= 1.5) return "B";
  if (width >= 1) return "C";
  return "D";
};

const getTrafficCalmingCount = (formData: Partial<IdecicloFormData>) => {
  const counts = formData.traffic_calming_counts || {};
  const totalFromCounts = Object.values(counts).reduce((sum, value) => sum + toNumber(value), 0);

  if (totalFromCounts > 0) return totalFromCounts;

  const measures = Array.isArray(formData.speed_measures) ? formData.speed_measures : [];
  return measures.length;
};

const calculateB2 = (formData: Partial<IdecicloFormData>): IdecicloRating | null =>
  isRating(formData.pavement_type) ? formData.pavement_type : null;

const calculateB3Protection = (
  formData: Partial<IdecicloFormData>
): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);

  if (typology === "ciclovia" && isRating(formData.separation_devices_ciclovia)) {
    return formData.separation_devices_ciclovia;
  }

  if (typology === "ciclofaixa" && isRating(formData.separation_devices_ciclofaixa)) {
    return formData.separation_devices_ciclofaixa;
  }

  if (
    typology === "calcada_partilhada" &&
    isRating(formData.separation_devices_calcada)
  ) {
    return formData.separation_devices_calcada;
  }

  return null;
};

const calculateB3LateralSpacing = (
  formData: Partial<IdecicloFormData>
): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  if (!typology || !["ciclovia", "ciclofaixa"].includes(typology)) return null;

  const velocity = toNumber(formData.velocity_kmh);
  const width = toNumber(formData.lateral_spacing_width_m);
  const spacingType = String(formData.lateral_spacing_type ?? "");
  const hasDoubleLine = Boolean(formData.has_double_lateral_line);
  const hasDevices =
    typology === "ciclovia"
      ? true
      : typology === "ciclofaixa"
        ? ["A", "B", "C"].includes(String(formData.separation_devices_ciclofaixa ?? ""))
        : false;

  if (width <= 0) return null;

  if (velocity >= 50) {
    if (spacingType === "apagada") return "D";
    if (width > 1) return "A";
    if (width >= 0.4 && width <= 1) return "B";
    if (width >= 0.2 && width < 0.4) return "C";
    return "D";
  }

  if (spacingType === "apagada") return "D";
  if (width > 0.7) return "A";
  if (width > 0.4 && width <= 0.7 && (hasDevices || hasDoubleLine || spacingType === "dispositivos")) {
    return "B";
  }
  if (!hasDevices && !hasDoubleLine) return "C";
  return "D";
};

const calculateB3 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  const protection = calculateB3Protection(formData);

  if (typology === "calcada_partilhada") return protection;

  const lateralSpacing = calculateB3LateralSpacing(formData);
  if (!protection || !lateralSpacing) return null;

  return B3_MATRIX[lateralSpacing][protection];
};

const calculateB4VerticalSigns = (
  formData: Partial<IdecicloFormData>
): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  if (!typology) return null;

  if (
    Array.isArray(formData.regulation_signs_per_block_by_block) &&
    formData.regulation_signs_per_block_by_block.length > 0
  ) {
    const flowType = getFlowType(formData.infra_flow);
    const blockRatings = formData.regulation_signs_per_block_by_block.map((signsValue, index) => {
      const signsPerBlock = toNumber(signsValue);
      const bothDirections = formData.signs_both_directions_by_block?.[index] ?? null;

      if (["ciclovia", "ciclofaixa"].includes(typology)) {
        const requiredPerBlock = flowType === "bidirectional" ? 2 : 1;

        if (signsPerBlock === 0) return "D" as IdecicloRating;
        if (signsPerBlock >= requiredPerBlock && bothDirections === true) return "A" as IdecicloRating;
        return "C" as IdecicloRating;
      }

      if (signsPerBlock === 0) return "D" as IdecicloRating;
      if (signsPerBlock >= 2 && bothDirections === true) return "A" as IdecicloRating;
      if (signsPerBlock >= 1 && bothDirections === true) return "B" as IdecicloRating;
      return "C" as IdecicloRating;
    });

    return getMedianRating(blockRatings);
  }

  const signsPerBlock = toNumber(formData.regulation_signs_per_block);
  const bothDirections = Boolean(formData.signs_both_directions);

  if (["ciclovia", "ciclofaixa"].includes(typology)) {
    const requiredPerBlock = getFlowType(formData.infra_flow) === "bidirectional" ? 2 : 1;

    if (signsPerBlock === 0) return "D";
    if (signsPerBlock >= requiredPerBlock && bothDirections) return "A";
    return "C";
  }

  if (signsPerBlock === 0) return "D";
  if (signsPerBlock >= 2 && bothDirections) return "A";
  if (signsPerBlock >= 1 && bothDirections) return "B";
  return "C";
};

const calculateB4SpaceIdentification = (
  formData: Partial<IdecicloFormData>
): IdecicloRating | null =>
  isRating(formData.space_identification) ? formData.space_identification : null;

const calculateB4Pictograms = (
  formData: Partial<IdecicloFormData>
): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  if (typology !== "ciclorrota") return null;

  const pictogramsPerBlock = toNumber(formData.pictograms_per_block);
  const allBlocks = Boolean(formData.pictograms_cover_all_blocks);

  if (pictogramsPerBlock >= 2 && allBlocks) return "A";
  if (pictogramsPerBlock >= 1 && allBlocks) return "B";
  if (pictogramsPerBlock >= 1) return "C";
  return "D";
};

const calculateB4 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  if (!typology) return null;

  if (typology === "ciclorrota") {
    return calculateB4Pictograms(formData);
  }

  const verticalSigns = calculateB4VerticalSigns(formData);
  if (!verticalSigns) return null;

  const spaceIdentification = calculateB4SpaceIdentification(formData);
  if (!spaceIdentification) return null;

  if (typology === "ciclofaixa") {
    return B4_CICLOFAIXA_MATRIX[verticalSigns][spaceIdentification];
  }

  return B4_CICLOVIA_SHARED_MATRIX[verticalSigns][spaceIdentification];
};

const calculateB5 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  if (!typology) return null;

  const crossings = Array.isArray(formData.signalized_crossings_count_by_block) &&
    formData.signalized_crossings_count_by_block.length > 0
      ? formData.signalized_crossings_count_by_block.reduce(
          (sum, value) => sum + toNumber(value),
          0
        )
      : toNumber(formData.signalized_crossings_count);
  const blocks = toNumber(formData.blocks_count);

  if (blocks <= 0) return null;
  if (crossings === 0) return "D";

  const density = crossings / blocks;

  if (density >= 2) return "A";
  if (density >= 1) return "B";
  return "C";
};

const calculateB6 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  if (normalizeTypology(formData.infra_typology) !== "ciclorrota") return null;

  const totalMeasures = getTrafficCalmingCount(formData);
  const extensionMeters = toNumber(formData.extension_m) * 1000;
  const averageDistance =
    totalMeasures > 0 && extensionMeters > 0
      ? extensionMeters / totalMeasures
      : toNumber(formData.avg_distance_measures_m);
  const velocity = toNumber(formData.velocity_kmh);

  if (totalMeasures === 0) return "D";
  if (averageDistance <= 0) return null;

  const recommended = velocity <= 20 ? 20 : 50;
  const maximum = velocity <= 20 ? 50 : 75;

  if (averageDistance <= recommended) return "A";
  if (averageDistance <= maximum) return "B";
  if (averageDistance > maximum) return "C";
  return null;
};

const calculateB7 = (formData: Partial<IdecicloFormData>): IdecicloRating => {
  const riskCount = [
    formData.bus_stop_conflict,
    formData.school_conflict,
    formData.horizontal_obstacles,
    formData.vertical_obstacles,
    formData.side_change_mid_block,
    formData.opposite_flow_direction,
  ].filter(Boolean).length;

  if (riskCount === 0) return "A";
  if (riskCount === 1) return "B";
  if (riskCount === 2) return "C";
  return "D";
};

const calculateC1 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  if (normalizeTypology(formData.infra_typology) === "ciclorrota") return null;

  const perIntersectionRatings = Array.isArray(formData.intersection_signaling_by_intersection)
    ? formData.intersection_signaling_by_intersection.map((value) =>
        isRating(value) ? value : null
      )
    : [];

  if (perIntersectionRatings.length > 0) {
    return getMedianRating(perIntersectionRatings);
  }

  return isRating(formData.intersection_signaling) ? formData.intersection_signaling : null;
};

const calculateC2 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const normalizeConnectionAccessibility = (rawValue: string) => {
    if (rawValue === "NA") return null;
    if (rawValue === "A") return "A";
    if (rawValue === "D") return "D";

    if (rawValue === "B" || rawValue === "C") return "D";

    return null;
  };

  const perIntersectionRatings = Array.isArray(formData.connection_accessibility_by_intersection)
    ? formData.connection_accessibility_by_intersection.map((value) =>
        normalizeConnectionAccessibility(String(value ?? ""))
      )
    : [];

  if (perIntersectionRatings.length > 0) {
    return getMedianRating(perIntersectionRatings);
  }

  const rawValue = String(formData.connection_accessibility ?? "");

  return normalizeConnectionAccessibility(rawValue);
};

const calculateC3 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  if (!typology) return null;
  const touchedFields = formData.touched_fields ?? {};

  if (typology === "ciclorrota") {
    const calculateCiclorrotaIntersectionRating = (
      lanesPerDirection: number,
      laneWidth: number,
      hasModeration: boolean
    ): IdecicloRating => {
      if (lanesPerDirection <= 1 && laneWidth > 0 && laneWidth <= 2.7) return "A";
      if (lanesPerDirection <= 1 && laneWidth > 2.7) return "B";
      if (lanesPerDirection > 1 && hasModeration) return "C";
      return "D";
    };

    const maxLength = Math.max(
      formData.traffic_lanes_per_direction_by_intersection?.length || 0,
      formData.mixed_lane_width_m_by_intersection?.length || 0,
      formData.has_intersection_traffic_calming_by_intersection?.length || 0
    );
    if (maxLength > 0) {
      const perIntersectionRatings = Array.from({ length: maxLength }, (_, index) => {
        const hasIntersectionAnswer =
          Boolean(touchedFields[`intersection_c3_lanes_${index}`]) &&
          Boolean(touchedFields[`intersection_c3_width_${index}`]) &&
          Boolean(touchedFields[`intersection_c3_calming_${index}`]);

        if (!hasIntersectionAnswer) return null;

        return calculateCiclorrotaIntersectionRating(
          toNumber(formData.traffic_lanes_per_direction_by_intersection?.[index]),
          toNumber(formData.mixed_lane_width_m_by_intersection?.[index]),
          Boolean(formData.has_intersection_traffic_calming_by_intersection?.[index])
        );
      });

      const resolvedRating = getMedianRating(perIntersectionRatings);
      if (resolvedRating) return resolvedRating;
    }

    if (
      !hasTouchedField(formData, [
        "traffic_lanes_per_direction",
        "mixed_lane_width_m",
        "has_intersection_traffic_calming",
      ])
    ) {
      return null;
    }

    return calculateCiclorrotaIntersectionRating(
      toNumber(formData.traffic_lanes_per_direction),
      toNumber(formData.mixed_lane_width_m),
      Boolean(formData.has_intersection_traffic_calming)
    );
  }

  const calculateConflictRating = (conflictValues: string[]): IdecicloRating => {
    const conflicts = new Set(conflictValues);
    const flow = getFlowType(formData.infra_flow);

    if (conflicts.has("no_conversion") || conflicts.has("exclusive_signal")) return "A";
    if (flow === "unidirectional" && conflicts.has("conversion") && conflicts.has("protection")) {
      return "B";
    }
    if (conflicts.has("pedestrian_signal") || conflicts.has("traffic_calming")) return "C";
    return "D";
  };

  if (Array.isArray(formData.motorized_conflicts_by_intersection)) {
    const perIntersectionRatings = formData.motorized_conflicts_by_intersection.map(
      (conflicts, index) =>
        touchedFields[`intersection_c3_${index}`]
          ? calculateConflictRating(Array.isArray(conflicts) ? conflicts : [])
          : null
    );

    const resolvedRating = getMedianRating(perIntersectionRatings);
    if (resolvedRating) return resolvedRating;
  }

  if (!hasTouchedField(formData, ["motorized_conflicts"])) return null;

  const conflicts = Array.isArray(formData.motorized_conflicts) ? formData.motorized_conflicts : [];
  const flow = getFlowType(formData.infra_flow);
  const conflictSet = new Set(conflicts);

  if (conflictSet.has("no_conversion") || conflictSet.has("exclusive_signal")) return "A";
  if (
    flow === "unidirectional" &&
    conflictSet.has("conversion") &&
    conflictSet.has("protection")
  ) {
    return "B";
  }
  if (conflictSet.has("pedestrian_signal") || conflictSet.has("traffic_calming")) return "C";
  return "D";
};

const calculateD1 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  if (isRating(formData.lighting_rating)) return formData.lighting_rating;

  if (
    !hasTouchedField(formData, [
      "lighting_rating",
      "has_lighting_posts",
      "lighting_post_type",
      "lighting_distance_m",
      "lighting_directed",
      "lighting_barriers",
      "lighting_distance_to_infra",
    ])
  ) {
    return null;
  }

  if (formData.has_lighting_posts === false) return "D";
  if (formData.has_lighting_posts !== true) return null;

  const distanceBetweenPosts = toNumber(formData.lighting_distance_m);
  const directed = Boolean(formData.lighting_directed);
  const hasBarriers = Boolean(formData.lighting_barriers);
  const closeToInfrastructure = String(formData.lighting_distance_to_infra ?? "B") === "A";
  const pedestrianPost = String(formData.lighting_post_type ?? "B") === "A";

  if (
    pedestrianPost &&
    directed &&
    closeToInfrastructure &&
    !hasBarriers &&
    distanceBetweenPosts > 0 &&
    distanceBetweenPosts <= 30
  ) {
    return "A";
  }

  if (
    directed &&
    closeToInfrastructure &&
    !hasBarriers &&
    distanceBetweenPosts > 30 &&
    distanceBetweenPosts <= 50
  ) {
    return "B";
  }

  return "C";
};

const calculateD2 = (formData: Partial<IdecicloFormData>): IdecicloRating | null =>
  isRating(formData.shading_coverage) ? formData.shading_coverage : null;

const calculateD3 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const totalBlocks = toNumber(formData.blocks_count);
  const hasBlockTouches = Array.from({ length: Math.max(0, totalBlocks) }, (_, index) =>
    Boolean(formData.touched_fields?.[`block_d3_${index}`])
  ).some(Boolean);

  if (
    !hasTouchedField(formData, [
      "blocks_with_cycling_furniture",
      "cycling_furniture",
      "cycling_furniture_by_block",
      "cycling_furniture_counts_by_block",
      "no_cycling_furniture_by_block",
    ]) &&
    !hasBlockTouches
  ) {
    return null;
  }

  const blocksWithFurniture = toNumber(formData.blocks_with_cycling_furniture);

  if (totalBlocks <= 0) return null;

  const coverage = (blocksWithFurniture / totalBlocks) * 100;

  if (coverage > 40) return "A";
  if (coverage >= 25) return "B";
  if (coverage >= 10) return "C";
  return "D";
};

const calculateE1 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  if (normalizeTypology(formData.infra_typology) === "ciclorrota") return null;
  if (Array.isArray(formData.intersection_conservation_by_intersection)) {
    const values = formData.intersection_conservation_by_intersection;
    const totalIntersections = Math.max(
      toNumber(formData.intersections_count),
      formData.intersection_conservation_by_intersection.length
    );

    if (totalIntersections <= 0 || values.every((value) => value === "")) return null;

    const goodCount = values.filter((value) => value === "good").length;
    const damagedCount = values.filter((value) => value === "damage").length;

    if (goodCount === totalIntersections) return "A";
    if (goodCount > totalIntersections / 2) return "B";
    if (goodCount + damagedCount > 0) return "C";
    return "D";
  }
  return isRating(formData.intersection_conservation)
    ? formData.intersection_conservation
    : null;
};

const calculateE2 = (formData: Partial<IdecicloFormData>): IdecicloRating | null =>
  isRating(formData.conservation_state) ? formData.conservation_state : null;

const calculateE3 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  if (!typology || !["ciclovia", "ciclofaixa"].includes(typology)) return null;

  const deviceConservation = isRating(formData.devices_conservation)
    ? formData.devices_conservation
    : null;
  const spacingConservation = isRating(formData.spacing_conservation)
    ? formData.spacing_conservation
    : null;

  if (!deviceConservation || !spacingConservation) return null;

  return E3_MATRIX[spacingConservation][deviceConservation];
};

const calculateE4 = (formData: Partial<IdecicloFormData>): IdecicloRating | null => {
  const typology = normalizeTypology(formData.infra_typology);
  if (!typology) return null;

  if (typology === "ciclorrota") {
    const pictogramsConservation = isRating(formData.pictograms_conservation)
      ? formData.pictograms_conservation
      : null;
    if (!pictogramsConservation) return null;
    return pictogramsConservation;
  }

  const identificationConservation = isRating(formData.identification_conservation)
    ? formData.identification_conservation
    : null;
  const derivedVerticalSignsConservationFromBlocks = Array.isArray(
    formData.vertical_signs_conservation_by_block
  )
    ? (() => {
        const answeredConditions = formData.vertical_signs_conservation_by_block.filter(
          (value): value is "good" | "damage" => value === "good" || value === "damage"
        );
        const damagedConditions = answeredConditions.filter((value) => value === "damage").length;
        const hasAnySigns = toNumber(formData.regulation_signs_per_block) > 0;

        if (!hasAnySigns) return "D" as IdecicloRating;
        if (answeredConditions.length === 0) return null;
        if (damagedConditions === 0) return "A" as IdecicloRating;
        if (damagedConditions < answeredConditions.length / 2) return "B" as IdecicloRating;
        return "C" as IdecicloRating;
      })()
    : null;
  const verticalSignsConservation =
    derivedVerticalSignsConservationFromBlocks ??
    (isRating(formData.vertical_signs_conservation) ? formData.vertical_signs_conservation : null);

  if (!identificationConservation || !verticalSignsConservation) return null;

  return E4_MATRIX[verticalSignsConservation][identificationConservation];
};

export const getAutoRatings = (formData: Partial<IdecicloFormData>): RatingMap => ({
  A1: calculateA1(formData),
  A2: calculateA2(formData),
  B1: calculateB1(formData),
  B2: calculateB2(formData),
  B3: calculateB3(formData),
  B4: calculateB4(formData),
  B5: calculateB5(formData),
  B6: calculateB6(formData),
  B7: calculateB7(formData),
  C1: calculateC1(formData),
  C2: calculateC2(formData),
  C3: calculateC3(formData),
  D1: calculateD1(formData),
  D2: calculateD2(formData),
  D3: calculateD3(formData),
  E1: calculateE1(formData),
  E2: calculateE2(formData),
  E3: calculateE3(formData),
  E4: calculateE4(formData),
});

export const getResolvedRatings = (formData: Partial<IdecicloFormData>) => {
  const autoRatings = getAutoRatings(formData);
  const ratingModes = formData.rating_modes ?? {};
  const manualRatings = formData.manual_ratings ?? {};
  const resolvedRatings: RatingMap = {};

  CRITERION_CODES.forEach((code) => {
    const mode = ratingModes[code] === "manual" ? "manual" : "auto";
    const manualRating = manualRatings[code];

    resolvedRatings[code] =
      mode === "manual" && isRating(manualRating) ? manualRating : autoRatings[code] ?? null;
  });

  return { autoRatings, resolvedRatings };
};

const buildScoreDetails = (
  typology: TypologyKey,
  resolvedRatings: RatingMap
) => {
  const config = getTypologyConfig(typology);
  if (!config) {
    return { total: 0, eliminated: false, sections: {} as ScoreSections };
  }

  if (resolvedRatings.A1 === "D") {
    return {
      total: 0,
      eliminated: true,
      sections: {
        A: {
          score: 0,
          max: config.secoes?.A?.max ?? 0,
        },
      },
    };
  }

  let total = 0;
  const sections: ScoreSections = {};

  Object.entries(config.secoes ?? {}).forEach(([sectionKey, rawSectionConfig]) => {
    const sectionConfig = rawSectionConfig as ConfigSection;
    let sectionScore = 0;
    const items: Record<string, ScoreItem> = {};

    (sectionConfig.itens ?? []).forEach((item) => {
      const rating = resolvedRatings[item.codigo as CriterionCode];
      const points = rating ? item.avaliacao?.[rating] : null;
      const maxPoints = Math.max(
        0,
        ...Object.values(item.avaliacao || {}).filter(
          (value): value is number => typeof value === "number"
        )
      );

      items[item.codigo] = {
        label: item.nome,
        rating,
        points,
        maxPoints,
      };

      if (typeof points === "number") {
        sectionScore += points;
      }
    });

    if (sectionKey === "B" && sectionScore < 0) {
      sectionScore = 0;
    }

    const cappedScore = Math.min(sectionScore, sectionConfig.max ?? sectionScore);

    sections[sectionKey] = {
      label: sectionConfig.nome,
      score: cappedScore,
      rawScore: sectionScore,
      max: sectionConfig.max ?? 0,
      items,
    };

    total += cappedScore;
  });

  return {
    total: Math.max(0, total),
    eliminated: false,
    sections,
  };
};

export const getScoreBreakdown = (formData: Partial<IdecicloFormData>) => {
  const typology = normalizeTypology(formData.infra_typology);
  const { autoRatings, resolvedRatings } = getResolvedRatings(formData);

  if (!typology) {
    return {
      typology: null,
      autoRatings,
      resolvedRatings,
      total: 0,
      eliminated: false,
      sections: {},
    };
  }

  const details = buildScoreDetails(typology, resolvedRatings);

  return {
    typology,
    autoRatings,
    resolvedRatings,
    total: details.total,
    eliminated: details.eliminated,
    sections: details.sections,
  };
};

export const getCriterionLabel = (code: CriterionCode) => CRITERION_LABELS[code];

export const getA1FieldLabel = (fieldKey: string) =>
  A1_FIELD_LABELS[fieldKey] || fieldKey;

export const getInitialRatingModes = (): Partial<Record<CriterionCode, RatingMode>> =>
  CRITERION_CODES.reduce((acc, code) => {
    acc[code] = "auto";
    return acc;
  }, {} as Partial<Record<CriterionCode, RatingMode>>);
