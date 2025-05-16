
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Evaluate from './Evaluate';
import Ranking from './Ranking';
import About from './About';

const Index = () => {
  const [activeTab, setActiveTab] = useState("avaliacao");
  const navigate = useNavigate();

  const handleEvaluateClick = () => {
    navigate("/avaliar");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-green-700 text-white py-4">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">IDECICLO</h1>
          <div>
            <Button variant="outline" className="text-white border-white hover:bg-green-600">
              Login
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="container py-8">
          <Tabs defaultValue="avaliacao" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="avaliacao">Avaliação</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              <TabsTrigger value="sobre">Sobre</TabsTrigger>
            </TabsList>

            <TabsContent value="avaliacao" className="space-y-6">
              <div className="text-center py-12">
                <h2 className="text-3xl font-bold mb-4">Índice de Desenvolvimento da Estrutura Cicloviária</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Avalie a infraestrutura cicloviária da sua cidade e contribua para o mapeamento das condições de mobilidade por bicicleta.
                </p>
                <Button size="lg" onClick={handleEvaluateClick}>
                  Começar Avaliação
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="ranking">
              <Ranking />
            </TabsContent>

            <TabsContent value="sobre">
              <About />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">IDECICLO</h3>
              <p className="text-gray-300">
                Índice de Desenvolvimento da Estrutura Cicloviária
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-300">© 2025 IDECICLO. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
