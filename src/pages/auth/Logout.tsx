import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const run = async () => {
      await logout();
      navigate("/", { replace: true });
    };

    void run();
  }, [logout, navigate]);

  return (
    <div className="container py-16">
      <div className="mx-auto flex max-w-lg items-center gap-3 rounded-[28px] bg-background-grey p-8 text-gray-700 shadow-md">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Encerrando sua sessão...</span>
      </div>
    </div>
  );
};

export default Logout;
