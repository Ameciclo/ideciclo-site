import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "Início" },
    //{ path: "/avaliar", label: "Aprimoramento" },
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

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50 border-b-2 border-ideciclo-teal">
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
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {renderNavLinks()}
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
