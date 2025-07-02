import { Form, Segment } from "@/types";

// Valores das notas para cada classificação
const RATING_VALUES = {
  A: 1.0,
  B: 0.7,
  C: 0.4,
  D: 0.0
};

// Pesos para cada tipo de malha
const NETWORK_WEIGHTS = {
  Estrutural: 0.590,
  Alimentadora: 0.262,
  Local: 0.148
};

// Critérios que serão considerados no cálculo (apenas os que têm opções A-D)
const EVALUATION_CRITERIA = [
  'pavement_type',
  'conservation_state',
  'separation_devices_ciclofaixa',
  'separation_devices_ciclovia',
  'separation_devices_calcada',
  'devices_conservation',
  'spacing_conservation',
  'space_identification',
  'identification_conservation',
  'pictograms_conservation',
  'vertical_signs_conservation',
  'intersection_signaling',
  'shading_coverage'
];

/**
 * Calcula a nota média de um formulário com base nos critérios de avaliação
 */
const calculateFormRating = (form: Form): number => {
  if (!form.responses) return 0;
  
  const responses = form.responses as Record<string, any>;
  let totalRating = 0;
  let criteriaCount = 0;

  // Para cada critério de avaliação, verifica se existe uma resposta
  // e adiciona o valor correspondente à nota total
  EVALUATION_CRITERIA.forEach(criterion => {
    if (responses[criterion] && RATING_VALUES[responses[criterion] as keyof typeof RATING_VALUES] !== undefined) {
      totalRating += RATING_VALUES[responses[criterion] as keyof typeof RATING_VALUES];
      criteriaCount++;
    }
  });

  // Retorna a média das notas ou 0 se não houver critérios avaliados
  return criteriaCount > 0 ? totalRating / criteriaCount : 0;
};

/**
 * Calcula a contribuição de um segmento: comprimento × nota
 */
const calculateSegmentContribution = (segment: Segment, form: Form): number => {
  const rating = calculateFormRating(form);
  return segment.length * rating;
};

/**
 * Agrupa os segmentos por tipo de malha (Estrutural, Alimentadora, Local)
 */
const groupSegmentsByNetworkType = (segments: Segment[], forms: Form[]): Record<string, { segments: Segment[], forms: Form[] }> => {
  const result: Record<string, { segments: Segment[], forms: Form[] }> = {
    Estrutural: { segments: [], forms: [] },
    Alimentadora: { segments: [], forms: [] },
    Local: { segments: [], forms: [] }
  };

  segments.forEach(segment => {
    // Encontra o formulário correspondente ao segmento
    const form = forms.find(f => f.segment_id === segment.id);
    if (form && segment.type) {
      // Mapeia o tipo do segmento para um dos três tipos de malha
      let networkType: string;
      
      if (segment.type === 'ESTRUTURAL') {
        networkType = 'Estrutural';
      } else if (segment.type === 'ALIMENTADORA') {
        networkType = 'Alimentadora';
      } else {
        networkType = 'Local';
      }

      if (result[networkType]) {
        result[networkType].segments.push(segment);
        result[networkType].forms.push(form);
      }
    }
  });

  return result;
};

/**
 * Calcula o Grau de Atendimento da Malha (GAM) para um tipo de malha
 */
const calculateNetworkAttendanceRate = (segments: Segment[], forms: Form[]): number => {
  if (segments.length === 0) return 0;

  // Calcula a soma das contribuições dos segmentos
  let totalContribution = 0;
  let totalLength = 0;

  segments.forEach((segment, index) => {
    const form = forms[index];
    if (form) {
      totalContribution += calculateSegmentContribution(segment, form);
      totalLength += segment.length;
    }
  });

  // Retorna o GAM: soma das contribuições / comprimento total
  return totalLength > 0 ? totalContribution / totalLength : 0;
};

/**
 * Calcula o IDECICLO para uma cidade com base nos segmentos e formulários
 */
export const calculateIdeciclo = (segments: Segment[], forms: Form[]): number => {
  // Agrupa os segmentos por tipo de malha
  const groupedSegments = groupSegmentsByNetworkType(segments, forms);
  
  // Calcula o GAM para cada tipo de malha
  const networkRates: Record<string, number> = {};
  let ideciclo = 0;

  Object.keys(groupedSegments).forEach(networkType => {
    const { segments: networkSegments, forms: networkForms } = groupedSegments[networkType];
    networkRates[networkType] = calculateNetworkAttendanceRate(networkSegments, networkForms);
    
    // Aplica o peso correspondente e soma ao IDECICLO
    if (NETWORK_WEIGHTS[networkType as keyof typeof NETWORK_WEIGHTS]) {
      ideciclo += networkRates[networkType] * NETWORK_WEIGHTS[networkType as keyof typeof NETWORK_WEIGHTS];
    }
  });

  return ideciclo;
};

/**
 * Converte o valor numérico do IDECICLO para uma classificação A, B, C ou D
 * A = 1.0
 * B = [0.7, 1.0)
 * C = [0.4, 0.7)
 * D = [0.0, 0.4)
 */
export const getIdecicloClassification = (ideciclo: number): string => {
  if (ideciclo >= 1.0) return 'A';
  if (ideciclo >= 0.7) return 'B';
  if (ideciclo >= 0.4) return 'C';
  return 'D';
};

/**
 * Retorna uma descrição textual da classificação do IDECICLO
 */
export const getIdecicloDescription = (classification: string): string => {
  switch (classification) {
    case 'A':
      return 'Excelente';
    case 'B':
      return 'Bom';
    case 'C':
      return 'Regular';
    case 'D':
      return 'Ruim';
    default:
      return 'Não avaliado';
  }
};