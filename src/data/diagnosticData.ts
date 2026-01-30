export type VehicleZone = 'motor' | 'suspensao_dianteira' | 'freios' | 'escapamento' | 'suspensao_traseira' | null;

export interface DiagnosticResult {
  id: string;
  zona: VehicleZone;
  falha: string;
  urgencia: 'alta' | 'media' | 'baixa';
  descricao: string;
  peca: {
    nome: string;
    imagem: string;
    funcao: string;
    sintomas: string[];
  };
  acaoRecomendada: {
    passos: string[];
    complexidade: 'simples' | 'moderada' | 'complexa';
    ferramentas: string[];
    tempoEstimado: string;
  };
  promptEstruturado: {
    sintoma: string;
    localizacao: string;
    condicao: string;
    gravidade: string;
  };
}

export const diagnosticDatabase: Record<string, DiagnosticResult> = {
  freios: {
    id: 'freios-001',
    zona: 'freios',
    falha: 'Desgaste das Pastilhas de Freio',
    urgencia: 'alta',
    descricao: 'As pastilhas de freio apresentam desgaste excessivo, reduzindo a capacidade de frenagem do veículo. Isso compromete a segurança e pode danificar os discos de freio.',
    peca: {
      nome: 'Pastilha de Freio Dianteira',
      imagem: '/placeholder.svg',
      funcao: 'Responsável por criar atrito contra o disco de freio, convertendo energia cinética em calor para desacelerar o veículo.',
      sintomas: [
        'Ruído de chiado ao frear',
        'Pedal de freio esponjoso',
        'Aumento da distância de frenagem',
        'Vibração ao frear'
      ]
    },
    acaoRecomendada: {
      passos: [
        'Suspender o veículo e remover as rodas',
        'Remover o cáliper de freio',
        'Retirar as pastilhas antigas',
        'Limpar o suporte e aplicar graxa nos pontos de contato',
        'Instalar as novas pastilhas',
        'Remontar o cáliper e rodas',
        'Testar o sistema de freios'
      ],
      complexidade: 'moderada',
      ferramentas: ['Chave de roda', 'Macaco hidráulico', 'Chave Allen', 'Graxa para freios', 'Saca-pinos'],
      tempoEstimado: '1-2 horas'
    },
    promptEstruturado: {
      sintoma: 'ruido_frenagem',
      localizacao: 'sistema_freios',
      condicao: 'ao_frear',
      gravidade: 'alta'
    }
  },
  motor: {
    id: 'motor-001',
    zona: 'motor',
    falha: 'Superaquecimento do Motor',
    urgencia: 'alta',
    descricao: 'O sistema de arrefecimento não está funcionando corretamente, causando elevação anormal da temperatura do motor. Pode indicar problema na bomba d\'água ou radiador.',
    peca: {
      nome: 'Radiador e Bomba D\'água',
      imagem: '/placeholder.svg',
      funcao: 'O radiador dissipa o calor do líquido de arrefecimento, enquanto a bomba d\'água circula o fluido pelo motor para manter a temperatura ideal de funcionamento.',
      sintomas: [
        'Ponteiro de temperatura no vermelho',
        'Vapor saindo do capô',
        'Perda de líquido de arrefecimento',
        'Luz de alerta de temperatura acesa'
      ]
    },
    acaoRecomendada: {
      passos: [
        'Desligar o motor e aguardar esfriar',
        'Verificar nível do líquido de arrefecimento',
        'Inspecionar mangueiras e conexões',
        'Testar funcionamento do ventilador',
        'Verificar estado da bomba d\'água',
        'Realizar teste de pressão do sistema',
        'Substituir componentes defeituosos'
      ],
      complexidade: 'complexa',
      ferramentas: ['Kit de teste de pressão', 'Termômetro infravermelho', 'Chaves combinadas', 'Recipiente para drenagem'],
      tempoEstimado: '2-4 horas'
    },
    promptEstruturado: {
      sintoma: 'superaquecimento',
      localizacao: 'motor',
      condicao: 'em_funcionamento',
      gravidade: 'critica'
    }
  },
  suspensao: {
    id: 'suspensao-001',
    zona: 'suspensao_dianteira',
    falha: 'Desgaste da Bieleta da Barra Estabilizadora',
    urgencia: 'media',
    descricao: 'A bieleta da barra estabilizadora está desgastada, causando ruídos de batida ao passar em irregularidades. Afeta a estabilidade do veículo em curvas.',
    peca: {
      nome: 'Bieleta da Barra Estabilizadora',
      imagem: '/placeholder.svg',
      funcao: 'Conecta a barra estabilizadora à suspensão, transmitindo forças que reduzem a inclinação da carroceria em curvas e melhoram a dirigibilidade.',
      sintomas: [
        'Ruído de batida seca ao passar em buracos',
        'Estalos ao virar o volante',
        'Instabilidade em curvas',
        'Folga perceptível na suspensão'
      ]
    },
    acaoRecomendada: {
      passos: [
        'Elevar o veículo com segurança',
        'Localizar a bieleta na barra estabilizadora',
        'Remover as porcas de fixação superior e inferior',
        'Retirar a bieleta antiga',
        'Instalar a nova bieleta com torque especificado',
        'Verificar alinhamento e folgas',
        'Testar em superfícies irregulares'
      ],
      complexidade: 'simples',
      ferramentas: ['Chaves combinadas 13mm e 15mm', 'Chave Allen', 'Torquímetro', 'WD-40'],
      tempoEstimado: '30-45 minutos'
    },
    promptEstruturado: {
      sintoma: 'ruido_impacto',
      localizacao: 'suspensao_dianteira',
      condicao: 'irregularidade_pista',
      gravidade: 'media'
    }
  },
  escapamento: {
    id: 'escapamento-001',
    zona: 'escapamento',
    falha: 'Catalisador Obstruído',
    urgencia: 'media',
    descricao: 'O catalisador apresenta obstrução ou deterioração, afetando a eficiência do motor e aumentando as emissões de poluentes.',
    peca: {
      nome: 'Catalisador',
      imagem: '/placeholder.svg',
      funcao: 'Converte gases nocivos do escapamento (CO, HC, NOx) em gases menos prejudiciais através de reações químicas com metais preciosos.',
      sintomas: [
        'Perda de potência do motor',
        'Aumento no consumo de combustível',
        'Fumaça escura no escapamento',
        'Cheiro forte de enxofre',
        'Luz de verificação do motor acesa'
      ]
    },
    acaoRecomendada: {
      passos: [
        'Realizar diagnóstico eletrônico (OBD-II)',
        'Inspecionar visualmente o catalisador',
        'Verificar sensores de oxigênio',
        'Testar contrapressão do escapamento',
        'Substituir catalisador se necessário',
        'Limpar códigos de erro',
        'Realizar teste de emissões'
      ],
      complexidade: 'complexa',
      ferramentas: ['Scanner OBD-II', 'Elevador automotivo', 'Chaves de boca', 'Manômetro de contrapressão'],
      tempoEstimado: '2-3 horas'
    },
    promptEstruturado: {
      sintoma: 'fumaca_ruido_escapamento',
      localizacao: 'sistema_escapamento',
      condicao: 'aceleracao',
      gravidade: 'media'
    }
  }
};

export const keywordMapping: Record<string, keyof typeof diagnosticDatabase> = {
  // Freios
  'freio': 'freios',
  'frear': 'freios',
  'pedal': 'freios',
  'frenagem': 'freios',
  'disco': 'freios',
  'pastilha': 'freios',
  'chiado': 'freios',
  
  // Motor
  'motor': 'motor',
  'aquecendo': 'motor',
  'temperatura': 'motor',
  'superaquecendo': 'motor',
  'vapor': 'motor',
  'radiador': 'motor',
  'arrefecimento': 'motor',
  'quente': 'motor',
  
  // Suspensão
  'barulho': 'suspensao',
  'suspensão': 'suspensao',
  'suspensao': 'suspensao',
  'buraco': 'suspensao',
  'batida': 'suspensao',
  'amortecedor': 'suspensao',
  'bieleta': 'suspensao',
  'estalo': 'suspensao',
  'irregularidade': 'suspensao',
  
  // Escapamento
  'escapamento': 'escapamento',
  'fumaça': 'escapamento',
  'fumaca': 'escapamento',
  'ronco': 'escapamento',
  'catalisador': 'escapamento',
  'exaustão': 'escapamento',
  'enxofre': 'escapamento'
};

export function analyzeSymptopm(input: string): DiagnosticResult | null {
  const normalizedInput = input.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [keyword, diagnosticKey] of Object.entries(keywordMapping)) {
    const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalizedInput.includes(normalizedKeyword)) {
      return diagnosticDatabase[diagnosticKey];
    }
  }
  
  return null;
}
