import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import IdecicloForm from "@/pages/IdecicloForm";

const AvaliarEstrutura = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const selectedSegmentId = sessionStorage.getItem("selectedSegmentId");

    if (!selectedSegmentId) {
      navigate("/avaliacao/escolher-estrutura", { replace: true });
    }
  }, [navigate]);

  return <IdecicloForm />;
};

export default AvaliarEstrutura;
