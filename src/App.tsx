import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Refine from "./pages/Refine";
import Avaliacao from "./pages/Avaliacao";
import SegmentForm from "./pages/SegmentForm";
import ViewEvaluation from "./pages/ViewEvaluation";
import About from "./pages/About";
import Ranking from "./pages/Ranking";
import CityDetails from "./pages/CityDetails";
import Apoiadores from "./pages/Apoiadores";
import NotFound from "./pages/NotFound";
import ProcessoAvaliacao from "./pages/ProcessoAvaliacao";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

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
              <Route path="/processo-avaliacao" element={<ProcessoAvaliacao />} />
              <Route path="/refinar" element={<Refine />} />
              <Route path="/avaliacao" element={<Avaliacao />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/city-details/:cityId" element={<CityDetails />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/apoiadores" element={<Apoiadores />} />
              <Route
                path="/refinar/formulario/:segmentId"
                element={<SegmentForm />}
              />
              <Route
                path="/view-evaluation/:formId"
                element={<ViewEvaluation />}
              />
              <Route
                path="/edit-evaluation/:segmentId/:formId"
                element={<SegmentForm />}
              />
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
