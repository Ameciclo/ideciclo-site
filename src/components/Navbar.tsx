import { manualDownloadUrl } from "@/constants/siteLinks";
import { Link, useLocation } from "react-router-dom";
import { Download, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isAuthenticated, user, canManageAdminPanel, openLoginModal } = useAuth();
  const isAvaliarEstruturaPage = location.pathname === "/avaliacao/avaliar-estrutura";

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "Início" },
    //{ path: "/processo-avaliacao", label: "Avalição" },
    { path: "/avaliacao", label: "Avaliação" },
    { path: "/ranking", label: "Ranking" },
    // { path: "/sobre", label: "Sobre" },
    //{ path: "/apoiadores", label: "Apoiadores" },
  ];

  const renderNavLinks = (mobile = false) => {
    return navLinks.map((link) => (
      <Link
        key={link.path}
        to={link.path}
        className={
          mobile
            ? `block py-2 px-4 text-xl ${
                isActive(link.path)
                  ? "bg-ideciclo-yellow bg-opacity-20 text-ideciclo-red font-medium rounded-lg"
                  : "text-text-grey hover:bg-ideciclo-teal hover:bg-opacity-10 rounded-lg"
              }`
            : `inline-flex items-center px-3 py-2 rounded-full text-base font-medium transition-colors ${
                isActive(link.path)
                  ? "bg-ideciclo-red text-white shadow-md"
                  : "text-text-grey hover:bg-ideciclo-yellow hover:text-text-grey"
              }`
        }
      >
        {link.label}
      </Link>
    ));
  };

  const renderAuthActions = (mobile = false) => {
    if (!isAuthenticated) {
      return (
        <Button
          variant={mobile ? "default" : "outline"}
          onClick={() =>
            openLoginModal({
              redirectTo: "/admin",
              title: "Entrar no IDECICLO",
            })
          }
          className={mobile ? "w-full bg-ideciclo-red text-white hover:bg-ideciclo-red/90" : ""}
        >
          Entrar
        </Button>
      );
    }

    return (
      <div className={mobile ? "space-y-3" : "flex items-center gap-2"}>
        {canManageAdminPanel ? (
          <Button asChild variant="outline" className={mobile ? "w-full" : ""}>
            <Link to="/admin">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </Button>
        ) : null}
        <Button asChild variant={mobile ? "secondary" : "ghost"} className={mobile ? "w-full" : ""}>
          <Link to="/auth/logout">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Link>
        </Button>
      </div>
    );
  };

  return (
    <nav
      className={`bg-white shadow-lg border-b-2 border-ideciclo-teal ${
        isAvaliarEstruturaPage ? "static md:fixed md:top-0 md:left-0 md:right-0 md:z-50" : "fixed top-0 left-0 right-0 z-50"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-20">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-xl">
                <img
                  src="/ideciclo_logo.png"
                  alt="IDECICLO"
                  className="h-16 drop-shadow-sm"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-3 sm:ml-6 sm:flex sm:space-x-4">
              {renderNavLinks()}
              {isAuthenticated ? (
                <span className="text-sm text-gray-500">{user?.name || user?.email}</span>
              ) : null}
              {renderAuthActions()}
            </div>

            {/* Mobile Hamburger Menu */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center p-2 rounded-md text-text-grey hover:text-ideciclo-red hover:bg-ideciclo-yellow hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ideciclo-teal"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Abrir menu</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="py-4 space-y-1">{renderNavLinks(true)}</div>
                  <div className="mt-6 rounded-2xl border border-ideciclo-teal/30 bg-ideciclo-yellow/15 p-4">
                    <h3 className="text-base font-semibold text-text-grey">
                      Manual do IDECICLO
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-grey">
                      Antes de começar, conheça a metodologia e baixe a versão
                      mais atual do manual.
                    </p>
                    <Button asChild className="mt-4 w-full bg-ideciclo-red hover:bg-ideciclo-red/90 text-white">
                      <a href={manualDownloadUrl} target="_blank" rel="noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar manual
                      </a>
                    </Button>
                  </div>
                  <div className="mt-4">{renderAuthActions(true)}</div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
