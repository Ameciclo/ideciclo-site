import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";

import EtapaEscolherEstrutura from "@/components/processo/EtapaEscolherEstrutura";
import { Button } from "@/components/ui/button";
import { getPersistedCityData } from "@/utils/persistedCityData";

interface PersistedCityData {
  cityId: string;
  cityName: string;
  stateName: string;
}

const EscolherEstrutura = () => {
  const navigate = useNavigate();
  const [cityData, setCityData] = useState<PersistedCityData | null>(null);

  useEffect(() => {
    const storedData = getPersistedCityData();
    if (!storedData) {
      return;
    }

    try {
      setCityData(JSON.parse(storedData));
    } catch (error) {
      console.error("Erro ao recuperar a cidade selecionada:", error);
    }
  }, []);

  return (
    <>
      <div
        className="bg-cover bg-center bg-no-repeat object-fill h-cover w-full px-10 py-24 text-black"
        style={{ backgroundImage: "url('/pages_covers/ideciclo-navcover.png')" }}
      />

      <nav className="bg-gray-400 px-4 py-2 text-white">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        {">"}{" "}
        <Link to="/avaliacao" className="hover:underline">
          Avaliação
        </Link>{" "}
        {">"} <span>Escolher Estrutura</span>
      </nav>

      <div className="container py-8">
        <div className="mx-auto my-12 text-center md:my-6">
          <div className="relative mb-8 inline-flex items-center justify-center">
            <h1
              className="relative inline-flex items-center justify-center gap-4 rounded-full bg-ideciclo-blue px-4 py-2 text-center font-lato text-xl font-black leading-normal text-white shadow-lg md:px-8 md:py-4 md:text-3xl z-[0]"
            >
              Escolher Estrutura
            </h1>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 341 80"
              className="absolute bottom-0 left-1/2 w-[120%] flex-shrink-0 -translate-x-1/2 translate-y-1/2 z-[-1]"
              style={{
                fill: "#EFC345",
                filter: "drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.25))",
              }}
            >
              <path d="M9.80432 49.4967C9.04999 36.8026 8.77685 25.0274 8.03552 12.6779C7.94931 11.6804 8.02121 10.6478 8.23907 9.75347C8.45697 8.85917 8.80762 8.15768 9.23206 7.76683C10.6514 6.75694 12.1036 5.98883 13.5761 5.46925C16.9707 4.55021 20.4043 3.88966 23.8249 3.71734C50.045 2.36751 76.2522 0.845359 102.498 3.31526C124.258 5.29693 146.069 5.12462 167.828 7.04884C194.035 9.40387 220.203 13.08 246.384 15.952C265.122 18.0198 283.859 19.8387 302.597 21.4088C310.647 22.098 318.724 21.8683 326.775 22.1842C328.283 22.1842 329.792 22.615 331.535 22.9883C332.011 23.2229 332.427 23.8582 332.694 24.7593C332.961 25.6604 333.059 26.756 332.966 27.8133L331.522 59.7497C331.509 60.5938 331.376 61.4076 331.143 62.077C330.91 62.7465 330.587 63.2382 330.221 63.4833C329.538 63.838 328.841 64.0591 328.14 64.1439C299.878 64.8331 271.616 66.3553 243.367 65.9245C212.504 65.465 181.627 63.3971 150.764 61.6739C135.04 60.8123 119.328 58.802 103.604 58.0265C85.6556 57.2224 67.6813 57.8542 49.7199 56.9926C37.2601 56.4182 24.3841 54.5227 11.274 53.0867C10.878 52.9603 10.5143 52.5324 10.246 51.8769C9.97766 51.2214 9.82144 50.3795 9.80432 49.4967Z" />
            </svg>
          </div>

          <p className="mb-8 text-lg text-text-grey">
            {cityData
              ? `Selecione o trecho que será avaliado em ${cityData.cityName}/${cityData.stateName}.`
              : "Selecione a cidade e refine os dados antes de escolher um trecho para avaliação."}
          </p>

          {cityData ? (
            <div className="mx-auto mb-8 flex max-w-fit items-center gap-3 rounded-full border border-ideciclo-teal/20 bg-ideciclo-teal/5 px-5 py-3 text-sm font-medium text-ideciclo-teal shadow-sm">
              <MapPin className="h-4 w-4" />
              <span>
                Cidade ativa: {cityData.cityName}, {cityData.stateName}
              </span>
            </div>
          ) : null}

          <Button
            variant="outline"
            onClick={() => navigate("/avaliacao")}
            className="rounded-full border-ideciclo-teal bg-white px-6 py-2 text-ideciclo-teal shadow-md hover:bg-ideciclo-yellow hover:bg-opacity-20 hover:text-ideciclo-red"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar às Etapas
          </Button>
        </div>

        <EtapaEscolherEstrutura cityData={cityData} />
      </div>
    </>
  );
};

export default EscolherEstrutura;
