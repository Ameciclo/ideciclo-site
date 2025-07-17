import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "Início" },
    { path: "/avaliar", label: "Refinar" },
    { path: "/avaliacao", label: "Avaliação" },
    { path: "/ranking", label: "Ranking" },
    { path: "/sobre", label: "Sobre" },
  ];

  const renderNavLinks = (mobile = false) => {
    return navLinks.map((link) => (
      <Link
        key={link.path}
        to={link.path}
        className={
          mobile
            ? `block py-2 px-4 text-base ${
                isActive(link.path)
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            : `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                isActive(link.path)
                  ? "border-blue-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`
        }
      >
        {link.label}
      </Link>
    ));
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-bold text-xl text-blue-600">
                IDECICLO
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
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-expanded="false"
                  >
                    <span className="sr-only">Abrir menu</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                  <div className="py-4 space-y-1">
                    {renderNavLinks(true)}
                  </div>
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
