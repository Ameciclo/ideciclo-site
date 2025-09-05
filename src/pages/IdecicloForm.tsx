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
import { supabase } from "@/services/database";

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
    
    // 1. PLANEJAMENTO CICLOVIÁRIO (2 parâmetros)
    p1_integracao_rede: "A", // A-D
    p2_continuidade_fisica: "A", // A-D
    
    // 2. PROJETO CICLOVIÁRIO AO LONGO DA QUADRA (11 parâmetros)
    p3_tipologia_infraestrutura: "A", // A-D
    p4_largura_util: "A", // A-D
    p5_declividade: "A", // A-D
    p6_qualidade_pavimento: "A", // A-D
    p7_conservacao_pavimento: "A", // A-D
    p8_protecao_trafego: "A", // A-D
    p9_protecao_estacionamento: "A", // A-D
    p10_sinalizacao_horizontal: "A", // A-D
    p11_sinalizacao_vertical: "A", // A-D
    p12_drenagem: "A", // A-D
    p13_obstaculos: "A", // A-D
    
    // 3. PROJETO CICLOVIÁRIO NAS INTERSEÇÕES (3 parâmetros)
    p14_continuidade_intersecoes: "A", // A-D
    p15_sinalizacao_intersecoes: "A", // A-D
    p16_conflitos_conversoes: "A", // A-D
    
    // 4. URBANIDADE (3 parâmetros)
    p17_atratividade_uso_solo: "A", // A-D
    p18_seguranca_publica: "A", // A-D
    p19_conforto_ambiental: "A", // A-D
    
    // 5. MANUTENÇÃO DA INFRAESTRUTURA (4 parâmetros)
    p20_limpeza: "A", // A-D
    p21_conservacao_sinalizacao: "A", // A-D
    p22_conservacao_pavimento_manutencao: "A", // A-D
    p23_poda_vegetacao: "A", // A-D
    
    // Observações
    observacoes: ""
  });

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('avaliacoes_ideciclo')
        .insert([
          {
            ...formData,
            created_at: new Date().toISOString(),
            segment_id: segmentId
          }
        ]);

      if (error) throw error;

      toast({
        title: "Avaliação salva",
        description: "A avaliação IDECICLO foi salva com sucesso.",
      });
      navigate("/avaliacao/resultados");
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a avaliação.",
        variant: "destructive",
      });
    }
  };

  const renderRatingSelect = (paramName: string, label: string, description?: string) => (
    <div className="space-y-2">
      <Label htmlFor={paramName}>{label}</Label>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      <Select value={formData[paramName]} onValueChange={(value) => handleChange(paramName, value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="A">A - Melhor</SelectItem>
          <SelectItem value="B">B - Razoável</SelectItem>
          <SelectItem value="C">C - Regular</SelectItem>
          <SelectItem value="D">D - Inadequado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

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
                    onChange={(e) => handleChange("cidade", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro}
                    onChange={(e) => handleChange("bairro", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nome_trecho">Nome do Trecho</Label>
                  <Input
                    id="nome_trecho"
                    value={formData.nome_trecho}
                    onChange={(e) => handleChange("nome_trecho", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="extensao">Extensão (m)</Label>
                  <Input
                    id="extensao"
                    type="number"
                    value={formData.extensao}
                    onChange={(e) => handleChange("extensao", parseFloat(e.target.value) || 0)}
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
                  <Select value={formData.hierarquia_viaria} onValueChange={(value) => handleChange("hierarquia_viaria", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="coletora">Coletora</SelectItem>
                      <SelectItem value="arterial">Arterial</SelectItem>
                      <SelectItem value="expressa">Expressa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="inicio_trecho">Início do Trecho</Label>
                  <Input
                    id="inicio_trecho"
                    value={formData.inicio_trecho}
                    onChange={(e) => handleChange("inicio_trecho", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fim_trecho">Fim do Trecho</Label>
                  <Input
                    id="fim_trecho"
                    value={formData.fim_trecho}
                    onChange={(e) => handleChange("fim_trecho", e.target.value)}
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
              {renderRatingSelect("p1_integracao_rede", "A.1. Adequação da tipologia de tratamento em relação à velocidade da via e sua respectiva hierarquia")}
              {renderRatingSelect("p2_continuidade_fisica", "A.2. Conectividade da Rede Cicloviária")}
            </CardContent>
          </Card>

          {/* B. PROJETO CICLOVIÁRIO AO LONGO DA QUADRA */}
          <Card>
            <CardHeader>
              <CardTitle>B. PROJETO CICLOVIÁRIO AO LONGO DA QUADRA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRatingSelect("p3_tipologia_infraestrutura", "B.1. Espaço útil da Infraestrutura Cicloviária")}
              {renderRatingSelect("p4_largura_util", "B.2. Tipo de Pavimento")}
              {renderRatingSelect("p5_declividade", "B.3. Delimitação da Infraestrutura Cicloviária")}
              {renderRatingSelect("p6_qualidade_pavimento", "B.4. Identificação do espaço cicloviário")}
              {renderRatingSelect("p7_conservacao_pavimento", "B.5. Acessibilidade relativa ao uso do solo lindeiro")}
              {renderRatingSelect("p8_protecao_trafego", "B.6. Medidas de moderação de velocidade no compartilhamento viário")}
              {renderRatingSelect("p9_protecao_estacionamento", "B.7. Existência de situações de risco ao longo da infraestrutura")}
            </CardContent>
          </Card>

          {/* C. PROJETO CICLOVIÁRIO NAS INTERSEÇÕES */}
          <Card>
            <CardHeader>
              <CardTitle>C. PROJETO CICLOVIÁRIO NAS INTERSEÇÕES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRatingSelect("p14_continuidade_intersecoes", "C.1. Sinalização horizontal cicloviária nas interseções")}
              {renderRatingSelect("p15_sinalizacao_intersecoes", "C.2. Acessibilidade entre conexões cicloviárias")}
              {renderRatingSelect("p16_conflitos_conversoes", "C.3. Tratamento dos conflitos com a circulação de modos motorizados")}
            </CardContent>
          </Card>

          {/* D. URBANIDADE */}
          <Card>
            <CardHeader>
              <CardTitle>D. URBANIDADE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRatingSelect("p17_atratividade_uso_solo", "D.1. Iluminação da infraestrutura cicloviária")}
              {renderRatingSelect("p18_seguranca_publica", "D.2. Conforto térmico")}
              {renderRatingSelect("p19_conforto_ambiental", "D.3. Existência de mobiliário cicloviário")}
            </CardContent>
          </Card>

          {/* E. MANUTENÇÃO DA INFRAESTRUTURA CICLOVIÁRIA */}
          <Card>
            <CardHeader>
              <CardTitle>E. MANUTENÇÃO DA INFRAESTRUTURA CICLOVIÁRIA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRatingSelect("p20_limpeza", "E.1. Estado de conservação da sinalização horizontal nas interseções")}
              {renderRatingSelect("p21_conservacao_sinalizacao", "E.2. Estado de conservação do pavimento")}
              {renderRatingSelect("p22_conservacao_pavimento_manutencao", "E.3. Estado de conservação dos elementos de delimitação da infraestrutura")}
              {renderRatingSelect("p23_poda_vegetacao", "E.4. Estado de conservação da identificação do espaço cicloviária")}
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