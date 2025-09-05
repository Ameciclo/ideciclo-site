-- Criar tabela para avaliações IDECICLO
CREATE TABLE IF NOT EXISTS public.avaliacoes_ideciclo (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    segment_id text,
    pesquisador text,
    data date,
    cidade text,
    bairro text,
    nome_trecho text,
    extensao numeric,
    velocidade_maxima integer,
    inicio_trecho text,
    fim_trecho text,
    hierarquia_viaria text,
    tipologia text,
    -- Respostas dos parâmetros
    A1 text, A2 text,
    B1 text, B2 text, B3 text, B4 text, B5 text, B6 text, B7 text,
    C1 text, C2 text, C3 text,
    D1 text, D2 text, D3 text,
    E1 text, E2 text, E3 text, E4 text,
    observacoes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para pontuações detalhadas
CREATE TABLE IF NOT EXISTS public.pontuacoes_ideciclo (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    avaliacao_id uuid REFERENCES public.avaliacoes_ideciclo(id) ON DELETE CASCADE,
    parametro text NOT NULL,
    resposta text NOT NULL,
    pontos numeric NOT NULL,
    nome_parametro text,
    created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para resultados finais
CREATE TABLE IF NOT EXISTS public.resultados_ideciclo (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    avaliacao_id uuid REFERENCES public.avaliacoes_ideciclo(id) ON DELETE CASCADE,
    segment_id text,
    nota_total numeric NOT NULL,
    tipologia text NOT NULL,
    detalhes_calculo jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_segment_id ON public.avaliacoes_ideciclo(segment_id);
CREATE INDEX IF NOT EXISTS idx_pontuacoes_avaliacao_id ON public.pontuacoes_ideciclo(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_resultados_avaliacao_id ON public.resultados_ideciclo(avaliacao_id);
CREATE INDEX IF NOT EXISTS idx_resultados_segment_id ON public.resultados_ideciclo(segment_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.avaliacoes_ideciclo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontuacoes_ideciclo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_ideciclo ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (permitir acesso público por enquanto)
CREATE POLICY "Enable read access for all users" ON public.avaliacoes_ideciclo FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.avaliacoes_ideciclo FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.avaliacoes_ideciclo FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.pontuacoes_ideciclo FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.pontuacoes_ideciclo FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.resultados_ideciclo FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.resultados_ideciclo FOR INSERT WITH CHECK (true);