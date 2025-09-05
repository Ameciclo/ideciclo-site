import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import formConfig from "../../form.json";

const IdecicloForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { segmentId } = useParams();
  
  const [formData, setFormData] = useState({
    // Dados Gerais
    pesquisador: "",
    data: new Date().toISOString().split("T")[0],
    cidade: "",
    bairro: "",
    nome_trecho: "",
    extensao: 0,
    velocidade_maxima: 30,
    inicio_trecho: "",
    fim_trecho: "",
    hierarquia_viaria: "",
    tipologia: "ciclovia", // Tipo de infraestrutura
    
    // Respostas dos parâmetros (A1-E4)
    A1: "A", A2: "A",
    B1: "A", B2: "A", B3: "A", B4: "A", B5: "A", B6: "A", B7: "A",
    C1: "A", C2: "A", C3: "A",
    D1: "A", D2: "A", D3: "A",
    E1: "A", E2: "A", E3: "A", E4: "A",
    
    // Observações
    observacoes: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [previewScore, setPreviewScore] = useState(0);

  // Atualizar prévia da pontuação quando formData mudar
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const score = calculateScore();
        setPreviewScore(score.total);
      } catch (error) {
        console.error('Erro no cálculo da prévia:', error);
        setPreviewScore(0);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [formData]);

  // Buscar dados do segmento
  useEffect(() => {
    const fetchSegmentData = async () => {
      // Pegar segmentId da URL ou do sessionStorage
      const currentSegmentId = segmentId || sessionStorage.getItem("selectedSegmentId");
      if (!currentSegmentId) return;
      
      setIsLoading(true);
      try {
        const { data: segmentData, error } = await supabase
          .from('segments')
          .select('*')
          .eq('id', currentSegmentId)
          .single();

        if (error) throw error;

        if (segmentData) {
          // Buscar dados da cidade
          const { data: cityData } = await supabase
            .from('cities')
            .select('*')
            .eq('id', segmentData.id_cidade)
            .single();

          setFormData(prev => ({
            ...prev,
            nome_trecho: segmentData.name || "",
            extensao: segmentData.length || 0,
            cidade: cityData?.name || "",
            bairro: segmentData.neighborhood || "",
            hierarquia_viaria: segmentData.classification || "",
            tipologia: segmentData.type || "ciclovia"
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar dados do segmento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do segmento.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSegmentData();
  }, [segmentId, toast]);

  // Função para calcular pontuação
  const calculateScore = () => {
    try {
      const tipo = formData.tipologia?.toLowerCase();
      const config = formConfig.tipos?.[tipo];
      if (!config) return { total: 0, detalhes: {} };

      let pontuacaoTotal = 0;
      const detalhes = {};

      // Verificar regra de eliminação A1
      if (formData.A1 === "D") {
        return { total: 0, detalhes: { eliminado: true, motivo: "A1 = D" } };
      }

      // Calcular pontuação por seção
      Object.entries(config.secoes || {}).forEach(([secaoKey, secao]) => {
        let pontuacaoSecao = 0;
        const detalhesSecao = {};

        (secao.itens || []).forEach(item => {
          const resposta = formData[item.codigo];
          const pontos = item.avaliacao?.[resposta];
          
          if (pontos !== null && pontos !== undefined) {
            pontuacaoSecao += pontos;
            detalhesSecao[item.codigo] = { resposta, pontos, nome: item.nome };
          }
        });

        // Aplicar limite mínimo para seção B
        if (secaoKey === "B" && pontuacaoSecao < 0) {
          pontuacaoSecao = 0;
        }

        pontuacaoTotal += Math.min(pontuacaoSecao, secao.max || 0);
        detalhes[secaoKey] = { pontuacao: pontuacaoSecao, max: secao.max || 0, itens: detalhesSecao };
      });

      return { total: Math.max(0, pontuacaoTotal), detalhes };
    } catch (error) {
      console.error('Erro no cálculo da pontuação:', error);
      return { total: 0, detalhes: {} };
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const { total, detalhes } = calculateScore();
      
      // Salvar formulário
      const currentSegmentId = segmentId || sessionStorage.getItem("selectedSegmentId");
      const { data: formResult, error: formError } = await supabase
        .from('avaliacoes_ideciclo')
        .insert([{
          ...formData,
          created_at: new Date().toISOString(),
          segment_id: currentSegmentId
        }])
        .select()
        .single();

      if (formError) {
        console.error('Erro detalhado ao salvar formulário:', formError);
        throw formError;
      }

      // Salvar pontuações detalhadas
      const pontuacoes = [];
      Object.entries(detalhes).forEach(([secao, dados]) => {
        if (dados.itens) {
          Object.entries(dados.itens).forEach(([codigo, item]) => {
            pontuacoes.push({
              avaliacao_id: formResult.id,
              parametro: codigo,
              resposta: item.resposta,
              pontos: item.pontos,
              nome_parametro: item.nome
            });
          });
        }
      });

      if (pontuacoes.length > 0) {
        const { error: scoreError } = await supabase
          .from('pontuacoes_ideciclo')
          .insert(pontuacoes);
        
        if (scoreError) {
          console.error('Erro detalhado ao salvar pontuações:', scoreError);
        }
      }

      // Salvar nota total
      const { error: totalError } = await supabase
        .from('resultados_ideciclo')
        .insert([{
          avaliacao_id: formResult.id,
          segment_id: currentSegmentId,
          nota_total: total,
          tipologia: formData.tipologia,
          detalhes_calculo: detalhes
        }]);

      if (totalError) {
        console.error('Erro detalhado ao salvar resultado:', totalError);
      }

      toast({
        title: "Avaliação salva",
        description: `Avaliação IDECICLO salva com nota ${total.toFixed(1)}.`,
      });
      navigate("/avaliacao/resultados");
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
      toast({
        title: "Erro",
        description: `Erro ao salvar a avaliação: ${error?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const renderRatingSelect = (paramName: string, label: string, description?: string) => {
    // Buscar configuração do item no form.json (normalizar para minúsculo)
    const tipologia = formData.tipologia?.toLowerCase();
    const config = formConfig.tipos?.[tipologia];
    let itemConfig = null;
    
    if (config) {
      Object.values(config.secoes || {}).forEach((secao: any) => {
        const item = secao.itens?.find((i: any) => i.codigo === paramName);
        if (item) {
          itemConfig = item;
        }
      });
    }
    
    // Se não encontrou o item, não renderizar
    if (!itemConfig) {
      return null;
    }
    
    const hasValidRating = Object.values(itemConfig.avaliacao || {}).some((val: any) => val !== null);
    if (!hasValidRating) return null;
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        <div className="flex gap-2">
          {(itemConfig.avaliacao.A !== null && itemConfig.avaliacao.A !== undefined) && (
            <Button
              type="button"
              variant={formData[paramName] === "A" ? "default" : "outline"}
              onClick={() => handleChange(paramName, "A")}
              className="flex-1"
            >
              A - Melhor
            </Button>
          )}
          {(itemConfig.avaliacao.B !== null && itemConfig.avaliacao.B !== undefined) && (
            <Button
              type="button"
              variant={formData[paramName] === "B" ? "default" : "outline"}
              onClick={() => handleChange(paramName, "B")}
              className="flex-1"
            >
              B - Razoável
            </Button>
          )}
          {(itemConfig.avaliacao.C !== null && itemConfig.avaliacao.C !== undefined) && (
            <Button
              type="button"
              variant={formData[paramName] === "C" ? "default" : "outline"}
              onClick={() => handleChange(paramName, "C")}
              className="flex-1"
            >
              C - Regular
            </Button>
          )}
          {(itemConfig.avaliacao.D !== null && itemConfig.avaliacao.D !== undefined) && (
            <Button
              type="button"
              variant={formData[paramName] === "D" ? "default" : "outline"}
              onClick={() => handleChange(paramName, "D")}
              className="flex-1"
            >
              D - Inadequado
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Header com Imagem de Capa */}
      <div
        className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
        style={{
          backgroundImage: "url('/pages_covers/ideciclo-navcover.png')",
        }}
      ></div>

      {/* Breadcrumb */}
      <nav className="bg-gray-400 text-white px-4 py-2">
        <a href="/" className="hover:underline">Home</a>{" "}
        &gt;{" "}
        <a href="/avaliacao" className="hover:underline">Avaliação</a>{" "}
        &gt; <span>Formulário IDECICLO</span>
      </nav>

      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Formulário de Avaliação IDECICLO</h1>
            <p className="text-gray-600">Avaliação completa da infraestrutura cicloviária</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/avaliacao")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar às Etapas
          </Button>
        </div>

        {isLoading && (
          <Card className="mb-6 p-6 flex justify-center items-center">
            <p>Carregando dados do segmento...</p>
          </Card>
        )}

        <div className="space-y-8">
          {/* Dados Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pesquisador">Pesquisador(a)</Label>
                  <Input
                    id="pesquisador"
                    value={formData.pesquisador}
                    onChange={(e) => handleChange("pesquisador", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleChange("data", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="nome_trecho">Nome do Trecho</Label>
                  <Input
                    id="nome_trecho"
                    value={formData.nome_trecho}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="extensao">Extensão (m)</Label>
                  <Input
                    id="extensao"
                    type="number"
                    value={formData.extensao}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="velocidade_maxima">Velocidade Máxima (km/h)</Label>
                  <Input
                    id="velocidade_maxima"
                    type="number"
                    value={formData.velocidade_maxima}
                    onChange={(e) => handleChange("velocidade_maxima", parseFloat(e.target.value) || 30)}
                  />
                </div>
                <div>
                  <Label htmlFor="hierarquia_viaria">Hierarquia Viária</Label>
                  <Input
                    id="hierarquia_viaria"
                    value={formData.hierarquia_viaria}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="tipologia">Tipologia da Infraestrutura</Label>
                  <Input
                    id="tipologia"
                    value={formData.tipologia}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* A. PLANEJAMENTO CICLOVIÁRIO */}
          <Card>
            <CardHeader>
              <CardTitle>A. PLANEJAMENTO CICLOVIÁRIO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRatingSelect("A1", "A1. Adequação da tipologia à velocidade/hierarquia")}
              {renderRatingSelect("A2", "A2. Conectividade da Rede Cicloviária")}
            </CardContent>
          </Card>

          {/* B. PROJETO AO LONGO DA ESTRUTURA */}
          <Card>
            <CardHeader>
              <CardTitle>B. PROJETO AO LONGO DA ESTRUTURA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRatingSelect("B1", "B1. Espaço útil da Infraestrutura Cicloviária")}
              {renderRatingSelect("B2", "B2. Tipo de pavimento")}
              {renderRatingSelect("B3", "B3. Delimitação da Infraestrutura")}
              {renderRatingSelect("B4", "B4. Identificação do espaço cicloviário")}
              {renderRatingSelect("B5", "B5. Acessibilidade relativa ao uso do solo lindeiro")}
              {renderRatingSelect("B6", "B6. Moderação de velocidade no compartilhamento viário")}
              {renderRatingSelect("B7", "B7. Situações de risco ao longo da infraestrutura")}
            </CardContent>
          </Card>

          {/* C. PROJETO NAS INTERSEÇÕES */}
          <Card>
            <CardHeader>
              <CardTitle>C. PROJETO NAS INTERSEÇÕES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRatingSelect("C1", "C1. Sinalização horizontal cicloviária nas interseções")}
              {renderRatingSelect("C2", "C2. Acessibilidade entre conexões cicloviárias")}
              {renderRatingSelect("C3", "C3. Tratamento dos conflitos com modos motorizados")}
            </CardContent>
          </Card>

          {/* D. URBANIDADE */}
          <Card>
            <CardHeader>
              <CardTitle>D. URBANIDADE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRatingSelect("D1", "D1. Iluminação")}
              {renderRatingSelect("D2", "D2. Conforto térmico")}
              {renderRatingSelect("D3", "D3. Mobiliário cicloviário")}
            </CardContent>
          </Card>

          {/* E. MANUTENÇÃO DA INFRAESTRUTURA */}
          <Card>
            <CardHeader>
              <CardTitle>E. MANUTENÇÃO DA INFRAESTRUTURA CICLOVIÁRIA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRatingSelect("E1", "E1. Conservação da sinalização horizontal na interseção")}
              {renderRatingSelect("E2", "E2. Conservação do pavimento")}
              {renderRatingSelect("E3", "E3. Conservação dos elementos de delimitação")}
              {renderRatingSelect("E4", "E4. Conservação da identificação do espaço")}
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="observacoes">Observações Adicionais</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Descreva observações relevantes sobre o trecho avaliado..."
                  value={formData.observacoes}
                  onChange={(e) => handleChange("observacoes", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Prévia da Pontuação */}
          <Card>
            <CardHeader>
              <CardTitle>Prévia da Pontuação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-center">
                Nota: {previewScore.toFixed(1)}/100
              </div>
            </CardContent>
          </Card>

          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} className="bg-ideciclo-blue hover:bg-blue-600">
              <Save className="h-4 w-4 mr-2" />
              Salvar Avaliação
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default IdecicloForm;