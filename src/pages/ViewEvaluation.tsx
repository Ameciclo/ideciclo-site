import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Edit, ArrowLeft } from "lucide-react";
import { fetchFormWithDetails } from "@/services/supabase";
import { Form } from "@/types";

const ViewEvaluation = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!formId) {
        setError("ID do formulário não encontrado");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchFormWithDetails(formId);

        if (!data) {
          setError("Erro ao carregar dados da avaliação");
          setIsLoading(false);
          return;
        }

        setFormData(data as Form);
      } catch (err) {
        console.error("Error:", err);
        setError("Erro ao carregar dados da avaliação");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [formId]);

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erro</CardTitle>
            <CardDescription>
              {error || "Dados não encontrados"}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const responses = formData.responses;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Visualização da Avaliação</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button
            onClick={() =>
              navigate(`/edit-evaluation/${formData.segment_id}/${formId}`)
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dados Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Pesquisador(a):</h3>
              <p>
                {responses.researcher || formData.researcher || "Não informado"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Data:</h3>
              <p>{responses.date || "Não informada"}</p>
            </div>
            <div>
              <h3 className="font-medium">Nome do Segmento:</h3>
              <p>{responses.segment_name || "Não informado"}</p>
            </div>
            <div>
              <h3 className="font-medium">Extensão (m):</h3>
              <p>{responses.extension_m || "Não informada"}</p>
            </div>
            <div>
              <h3 className="font-medium">Velocidade (km/h):</h3>
              <p>{responses.velocity_kmh || "Não informada"}</p>
            </div>
            <div>
              <h3 className="font-medium">Bairro:</h3>
              <p>{responses.neighborhood || "Não informado"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Caracterização da Infraestrutura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Tipologia:</h3>
              <p>{responses.infra_typology || "Não informada"}</p>
            </div>
            <div>
              <h3 className="font-medium">Fluxo:</h3>
              <p>
                {responses.infra_flow === "unidirectional"
                  ? "Unidirecional"
                  : responses.infra_flow === "bidirectional"
                  ? "Bidirecional"
                  : "Não informado"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Posição na via:</h3>
              <p>
                {responses.position_on_road === "canteiro"
                  ? "Sobre o canteiro"
                  : responses.position_on_road === "pista_canteiro"
                  ? "Pista, junto ao canteiro"
                  : responses.position_on_road === "pista_calcada"
                  ? "Pista, junto à calçada"
                  : responses.position_on_road === "calcada"
                  ? "Sobre a calçada"
                  : responses.position_on_road === "centro_pista"
                  ? "Centro da pista"
                  : responses.position_on_road === "isolada"
                  ? "Isolada"
                  : "Não informada"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewEvaluation;
