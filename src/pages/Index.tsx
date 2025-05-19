import { migrateLocalStorageToDatabase } from "@/services/supabase";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();

  const handleMigrateData = async () => {
    try {
      setIsMigrating(true);
      const success = await migrateLocalStorageToDatabase();

      if (success) {
        toast({
          title: "Migração concluída",
          description:
            "Os dados foram migrados com sucesso para o banco de dados.",
        });
      } else {
        toast({
          title: "Erro na migração",
          description: "Ocorreu um erro durante a migração dos dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro na migração:", error);
      toast({
        title: "Erro na migração",
        description: "Ocorreu um erro durante a migração dos dados.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Sistema de Avaliação IDECiclo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Avaliar Infraestrutura Cicloviária</CardTitle>
            <CardDescription>
              Selecione uma cidade e avalie os segmentos cicloviários.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Comece a avaliar a infraestrutura cicloviária da sua cidade.</p>
            <Link to="/avaliar">
              <Button className="mt-4">Começar Avaliação</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o Projeto</CardTitle>
            <CardDescription>
              Informações sobre o projeto e como contribuir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Saiba mais sobre o projeto e como você pode contribuir.</p>
            <Button variant="secondary" asChild>
              <a
                href="https://github.com/DanielFranca/ideciclo-frontend"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver no GitHub
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Ferramentas Administrativas
        </h2>
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleMigrateData}
            disabled={isMigrating}
          >
            {isMigrating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Migrar dados para o banco de dados
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
