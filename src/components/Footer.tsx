const Footer = () => {
  return (
    <footer className="bg-ideciclo text-white py-12 mt-12 relative overflow-hidden">
      {/* SVG de fundo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" 
             viewBox="0 0 1200 300" preserveAspectRatio="none" fill="none">
          <path d="M0 150C200 100 400 200 600 150C800 100 1000 200 1200 150V300H0V150Z" 
                fill="currentColor"/>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <img src="/ideciclo/ideciclo-logo.png" alt="IDECICLO" className="h-12 mr-4" />
              <div>
                <h3 className="text-2xl font-bold">IDECICLO</h3>
                <p className="text-gray-200 text-sm">
                  Índice de Desenvolvimento Cicloviário
                </p>
              </div>
            </div>
            <p className="text-gray-200 text-sm max-w-md">
              Metodologia de avaliação qualitativa da infraestrutura cicloviária urbana
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <h4 className="font-bold mb-4 text-lg">Desenvolvido por</h4>
            <div className="bg-white bg-opacity-10 rounded-lg p-4">
              <p className="font-semibold text-ideciclo-yellow">Ameciclo</p>
              <p className="text-gray-200 text-sm">
                Associação Metropolitana de Ciclistas do Recife
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-gray-200 text-sm">🌐 www.ameciclo.org</p>
                <p className="text-gray-200 text-sm">📧 contato@ameciclo.org</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-20 mt-8 pt-6 text-center">
          <p className="text-gray-200 text-sm">
            © 2024 IDECICLO. Ferramenta aberta e replicável para promover cidades mais seguras para ciclistas.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
