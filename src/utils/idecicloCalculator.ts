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
  if (!form.responses) {
    console.log("Form has no responses:", form.id);
    return 0;
  }
  
  const responses = form.responses as Record<string, any>;
  let totalRating = 0;
  let criteriaCount = 0;

  console.log("Form ID:", form.id, "Segment ID:", form.segment_id);
  console.log("Form responses:", responses);

  // Para cada critério de avaliação, verifica se existe uma resposta
  // e adiciona o valor correspondente à nota total
  EVALUATION_CRITERIA.forEach(criterion => {
    console.log(`Checking criterion ${criterion}: ${responses[criterion]}`);
    if (responses[criterion] && RATING_VALUES[responses[criterion] as keyof typeof RATING_VALUES] !== undefined) {
      const value = RATING_VALUES[responses[criterion] as keyof typeof RATING_VALUES];
      console.log(`  Adding value ${value} for ${criterion}`);
      totalRating += value;
      criteriaCount++;
    } else {
      console.log(`  Criterion ${criterion} not found or invalid`);
    }
  });

  const average = criteriaCount > 0 ? totalRating / criteriaCount : 0;
  console.log(`Total rating: ${totalRating}, Criteria count: ${criteriaCount}, Average: ${average}`);

  // Retorna a média das notas ou 0 se não houver critérios avaliados
  return average;
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
  console.log(`Grouping ${segments.length} segments and ${forms.length} forms by network type`);
  
  const result: Record<string, { segments: Segment[], forms: Form[] }> = {
    Estrutural: { segments: [], forms: [] },
    Alimentadora: { segments: [], forms: [] },
    Local: { segments: [], forms: [] }
  };

  segments.forEach(segment => {
    // Encontra o formulário correspondente ao segmento
    const form = forms.find(f => f.segment_id === segment.id);
    
    console.log(`Segment ${segment.id} (${segment.name}): type=${segment.type}, classification=${segment.classification}`);
    console.log(`  Form found: ${form ? 'Yes' : 'No'}`);
    
    if (form && segment.type) {
      // Mapeia o tipo do segmento para um dos três tipos de malha
      let networkType: string;
      
      // First check the classification field
      if (segment.classification === 'estrutural') {
        networkType = 'Estrutural';
      } else if (segment.classification === 'alimentadora') {
        networkType = 'Alimentadora';
      } else if (segment.classification === 'local') {
        networkType = 'Local';
      } 
      // If no classification, fall back to type
      else if (segment.type === 'ESTRUTURAL') {
        networkType = 'Estrutural';
      } else if (segment.type === 'ALIMENTADORA') {
        networkType = 'Alimentadora';
      } else {
        networkType = 'Local';
      }

      console.log(`  Mapped to network type: ${networkType}`);

      if (result[networkType]) {
        result[networkType].segments.push(segment);
        result[networkType].forms.push(form);
      } else {
        console.log(`  WARNING: Invalid network type: ${networkType}`);
      }
    } else {
      console.log(`  Skipping segment: ${!form ? 'No form found' : 'No segment type'}`);
    }
  });

  // Log the results
  Object.keys(result).forEach(type => {
    console.log(`${type}: ${result[type].segments.length} segments, ${result[type].forms.length} forms`);
  });

  return result;
};

/**
 * Calcula o Grau de Atendimento da Malha (GAM) para um tipo de malha
 */
const calculateNetworkAttendanceRate = (segments: Segment[], forms: Form[]): number => {
  if (segments.length === 0) {
    console.log("No segments provided for network attendance calculation");
    return 0;
  }

  console.log(`Calculating GAM for ${segments.length} segments and ${forms.length} forms`);

  // Calcula a soma das contribuições dos segmentos
  let totalContribution = 0;
  let totalLength = 0;

  segments.forEach((segment, index) => {
    const form = forms[index];
    if (form) {
      const contribution = calculateSegmentContribution(segment, form);
      console.log(`Segment ${segment.id} (${segment.name}): length=${segment.length}, contribution=${contribution}`);
      totalContribution += contribution;
      totalLength += segment.length;
    } else {
      console.log(`No form found for segment ${segment.id} (${segment.name})`);
    }
  });

  const gam = totalLength > 0 ? totalContribution / totalLength : 0;
  console.log(`GAM calculation: totalContribution=${totalContribution}, totalLength=${totalLength}, GAM=${gam}`);

  // Retorna o GAM: soma das contribuições / comprimento total
  return gam;
};

/**
 * Calcula o IDECICLO para uma cidade com base nos segmentos e formulários
 */
export const calculateIdeciclo = (segments: Segment[], forms: Form[]): number => {
  console.log(`Calculating IDECICLO for ${segments.length} segments and ${forms.length} forms`);
  
  // Log the first form to see its structure
  if (forms.length > 0) {
    console.log("Sample form structure:", JSON.stringify(forms[0], null, 2));
  }
  
  // Agrupa os segmentos por tipo de malha
  const groupedSegments = groupSegmentsByNetworkType(segments, forms);
  console.log("Grouped segments:", Object.keys(groupedSegments).map(type => 
    `${type}: ${groupedSegments[type].segments.length} segments, ${groupedSegments[type].forms.length} forms`
  ));
  
  // Calcula o GAM para cada tipo de malha
  const networkRates: Record<string, number> = {};
  let ideciclo = 0;

  Object.keys(groupedSegments).forEach(networkType => {
    const { segments: networkSegments, forms: networkForms } = groupedSegments[networkType];
    console.log(`Calculating rate for network type: ${networkType}`);
    networkRates[networkType] = calculateNetworkAttendanceRate(networkSegments, networkForms);
    console.log(`Network rate for ${networkType}: ${networkRates[networkType]}`);
    
    // Aplica o peso correspondente e soma ao IDECICLO
    if (NETWORK_WEIGHTS[networkType as keyof typeof NETWORK_WEIGHTS]) {
      const weight = NETWORK_WEIGHTS[networkType as keyof typeof NETWORK_WEIGHTS];
      const contribution = networkRates[networkType] * weight;
      console.log(`${networkType} contribution: ${networkRates[networkType]} × ${weight} = ${contribution}`);
      ideciclo += contribution;
    }
  });

  console.log(`Final IDECICLO value: ${ideciclo}, Classification: ${getIdecicloClassification(ideciclo)}`);
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
 * Função auxiliar para depurar o cálculo da nota de um formulário
 */
export const debugFormRating = (form: Form): { rating: number, details: any } => {
  if (!form.responses) {
    return { rating: 0, details: { error: "No responses found" } };
  }
  
  const responses = form.responses as Record<string, any>;
  let totalRating = 0;
  let criteriaCount = 0;
  const criteriaDetails: Record<string, any> = {};

  // Para cada critério de avaliação, verifica se existe uma resposta
  EVALUATION_CRITERIA.forEach(criterion => {
    const response = responses[criterion];
    const value = response && RATING_VALUES[response as keyof typeof RATING_VALUES];
    
    criteriaDetails[criterion] = {
      response,
      value: value !== undefined ? value : "N/A",
      included: value !== undefined
    };
    
    if (value !== undefined) {
      totalRating += value;
      criteriaCount++;
    }
  });

  const average = criteriaCount > 0 ? totalRating / criteriaCount : 0;
  
  return {
    rating: average,
    details: {
      totalRating,
      criteriaCount,
      average,
      classification: getIdecicloClassification(average),
      criteria: criteriaDetails
    }
  };
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