import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import Index from "./pages/Index";
import Avaliacao from "./pages/Avaliacao";
import About from "./pages/About";
import Ranking from "./pages/Ranking";
import DetalhesCidades from "./pages/DetalhesCidades";
import DetalhesEstrutura from "./pages/DetalhesEstrutura";
import Apoiadores from "./pages/Apoiadores";
import NotFound from "./pages/NotFound";
import RefinarDados from "./pages/avaliacao/RefinarDados";
import EscolherEstrutura from "./pages/avaliacao/EscolherEstrutura";
import AvaliarEstrutura from "./pages/avaliacao/AvaliarEstrutura";
import Resultados from "./pages/avaliacao/Resultados";
import IdecicloFormPage from "./pages/avaliacao/form/IdecicloFormPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const LegacyCityDetailsRedirect = () => {
  const { cityId } = useParams<{ cityId: string }>();

  return cityId ? (
    <Navigate replace to={`/detalhes-cidades/${cityId}`} />
  ) : (
    <Navigate replace to="/ranking" />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow pt-20">
            <ErrorBoundary>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/avaliacao" element={<Avaliacao />} />
              <Route path="/avaliacao/refinar-dados" element={<RefinarDados />} />
              <Route path="/avaliacao/escolher-estrutura" element={<EscolherEstrutura />} />
              <Route path="/avaliacao/avaliar-estrutura" element={<AvaliarEstrutura />} />
              <Route path="/avaliacao/formulario-ideciclo/:segmentId" element={<IdecicloFormPage />} />
              <Route path="/avaliacao/resultados" element={<Resultados />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/detalhes-cidades/:cityId" element={<DetalhesCidades />} />
              <Route path="/detalhes-cidades/:cityId/estruturas/:segmentId" element={<DetalhesEstrutura />} />
              <Route path="/city-details/:cityId" element={<LegacyCityDetailsRedirect />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/apoiadores" element={<Apoiadores />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </ErrorBoundary>
          </div>
          <Footer />
          <ScrollToTop />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
