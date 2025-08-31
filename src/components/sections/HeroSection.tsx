import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";

export const HeroSection = ({ coverUrl }) => (
  <>
    <div
      className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black relative"
      style={{
        backgroundImage: `url('${coverUrl}')`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      <div className="relative z-10 container mx-auto h-full flex items-center justify-center">
        <div className="text-center text-white max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            IDECICLO
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
            Índice de Desenvolvimento Cicloviário
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-ideciclo-blue hover:bg-ideciclo-blue/90 text-white">
              <Link to="/processo-avaliacao">
                <MapPin className="mr-2 h-5 w-5" />
                Iniciar Processo Guiado
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/90 hover:bg-white text-gray-900">
              <Link to="/ranking">
                Ver Ranking das Cidades
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
    <nav className="bg-gray-400 text-white px-4 py-2">
      <span>Home</span>
    </nav>
  </>
);
