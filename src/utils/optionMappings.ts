// Mappings from A, B, C, D options to their full text descriptions

export const optionMappings = {
  // B.2 Pavement type
  pavement_type: {
    A: 'Pisos betuminosos (asfalto) ou cimentícios (concreto)',
    B: 'Pisos modulares (blocos de concreto e similares)',
    C: 'Pedras irregulares (portuguesas e similares), pisos com espaçamento (vãos)',
    D: 'Pisos de barro; grelhas e chapas metálicas; pisos modulares soltos; pisos derrapantes'
  },

  // E.1 Pavement conservation state
  conservation_state: {
    A: 'Piso nivelado, sem ondulações',
    B: 'Piso com leve desnivelamento, que não requeira ao ciclista frear',
    C: 'Piso com desnível transversal ou buraco raso; piso com desgaste até a metade de sua largura útil',
    D: 'Piso com degraus / buracos profundos; pou com desgaste superior à metade da largura útil'
  },

  // B.3/E.2 Infrastructure delimitation - Ciclofaixa
  separation_devices_ciclofaixa: {
    A: 'Dispositivos (tachas, tachinhas ou balizadores) distanciados até 1 m entre si.',
    B: 'Dispositivos distanciados entre 1,5 e 3 m entre si; trechos com aberturas pontuais para acessar estacionamento dentro dos lotes.',
    C: 'Dispositivos distanciados a mais de 3,5 metros entre si; trechos com muitas aberturas para acessar estacionamentos dentro dos lotes.',
    D: 'Não há dispositivos na infraestrutura cicloviária.'
  },

  // B.3/E.2 Infrastructure delimitation - Ciclovia
  separation_devices_ciclovia: {
    A: 'Segregação total dos veículos motorizados (segregadores, ilhas físicas e níveis diferentes)',
    B: 'Segregação total, com aberturas pontuais para acessar estacionamento dentro dos lotes ao longo do trecho.',
    C: 'Elementos de segregação distanciados entre si até 2 m ao longo do trecho; com aberturas pontuais para acessar estacionamento dentro dos lotes ao longo do trecho.',
    D: 'Elementos de segregação com distância superior a 2,5 m entre si ao longo do trecho; com muitas aberturas para acessar estacionamentos dentro dos lotes.'
  },

  // B.3/E.2 Infrastructure delimitation - Calçada
  separation_devices_calcada: {
    A: 'Demarcação clara no piso que diferencia os espaços de circulação dos ciclistas, separado dos pedestres, com o uso de diferentes pavimentos.',
    B: 'Demarcação dos espaços de pedestres e ciclistas em áreas separadas sobre um mesmo tipo de pavimento, por sinalização horizontal vermelha, marcas horizontais e pictogramas.',
    C: 'Demarcação apenas com marca/linha horizontal ao longo do trecho; (ou) apenas pictogramas orientando fluxos de circulação.',
    D: 'Não há delimitação ou diferenciação dos espaços de ciclistas e de pedestres.'
  },

  // E.2.1 Conservation state of separation devices
  devices_conservation: {
    A: 'Há dispositivos de separação ou segregação em todo o trecho, visível em toda a extensão.',
    B: 'Dispositivos em mais da metade do trecho em bom estado de conservação.',
    C: 'Dispositivos em menos da metade do trecho ou estão muito danificados.',
    D: 'Praticamente não há dispositivos.'
  },

  // E.2.1 Conservation state of lateral spacing
  spacing_conservation: {
    A: 'Há demarcação em ótimo estado, visível em toda a extensão.',
    B: 'Há demarcação em bom estado em mais da metade do trecho.',
    C: 'Há demarcação em menos da metade do trecho ou está muito danificada.',
    D: 'Praticamente inexiste'
  },

  // B.4/E.3 Horizontal and vertical signaling
  space_identification: {
    A: 'Pavimento ou pintura total em tom vermelho ou ao menos nas aproximações de travessias de pedestres e áreas de conflito com outros modos.',
    B: 'Faixa de contraste nos dois bordos da infraestrutura cicloviária em toda a extensão.',
    C: 'Faixa de contraste vermelha em apenas um dos bordos da infraestrutura cicloviária.',
    D: 'Não há pintura de contraste (vermelha) ou a pintura está muito danificada.'
  },

  // E.3.1 Conservation state of identification
  identification_conservation: {
    A: 'Preenchimento total da área útil em tom vermelho (pavimento pigmentado ou pintura).',
    B: 'Identificação de mais da metade da infraestrutura ou ao menos nas aproximações de travessias de pedestres e área de conflito com outros modos.',
    C: 'Há sinalização identificação em menos da metade do trecho da infraestrutura cicloviária ou está muito danificada.',
    D: 'Praticamente apagada.'
  },

  // B.4.2 Pictogram conservation
  pictograms_conservation: {
    A: 'Pictogramas visíveis em toda a extensão.',
    B: 'Pictogramas desgastados em toda a extensão.',
    C: 'Há sinalização identificação em menos da metade do trecho da infraestrutura cicloviária ou está muito danificada.',
    D: 'Praticamente apagados ou não há.'
  },

  // B.4.3 Vertical signs conservation
  vertical_signs_conservation: {
    A: 'Placas e postes em bom estado de conservação.',
    B: 'Menos da metade das placas com danos (sujeira, soltas, outras).',
    C: 'Placas bastante danificadas ao longo do trecho.',
    D: 'Não há placas no trecho.'
  },

  // C.1/E.4 Intersection signaling
  intersection_signaling: {
    A: 'Interseção apresenta pavimento vermelho na largura da infra e linhas tracejadas brancas',
    B: 'Pavimento em tom vermelho estreito ou pavimento vermelho sem linhas tracejadas',
    C: 'Só linhas tracejadadas ou só pictogramas',
    D: 'Nenhuma sinalização'
  },

  // C.1/E.4 Intersection conservation
  intersection_conservation: {
    A: 'Sinalização em bom estado',
    B: 'Sinalização danificada',
    C: 'Não há sinalização'
  },

  // C.2 Connection accessibility
  connection_accessibility: {
    A: 'A conexão entre infraestruturas possui acessbilidade universal, e é bem visível.',
    B: 'A conexão possui degraus (com ou sem canaletas).',
    C: 'Não é possível ver a conexão.'
  },

  // D.1 Lighting post type
  lighting_post_type: {
    A: 'Postes peatonais',
    B: 'Postes convencionais'
  },

  // D.1 Lighting distance to infrastructure
  lighting_distance_to_infra: {
    A: 'Postes juntos à infraestrutura',
    B: 'Postes a mais de 5 m da infraestrutura'
  },

  // D.2 Shading coverage
  shading_coverage: {
    A: 'Toda extensão',
    B: 'Mais da metade',
    C: 'Menos da metade',
    D: 'Não há'
  },

  // D.2 Vegetation size
  vegetation_size: {
    A: 'Porte alto',
    B: 'Médio porte',
    C: 'Baixo porte'
  }
};

export default optionMappings;