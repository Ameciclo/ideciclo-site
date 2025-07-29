const Footer = () => {
  return (
    <footer className="bg-[#5050aa] text-white py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">IDECICLO</h3>
            <p className="text-gray-300 text-sm">
              Índice de Desenvolvimento Cicloviário
            </p>
          </div>
          <div className="text-center md:text-right">
            <h4 className="font-semibold mb-2">Contato</h4>
            <p className="text-gray-300 text-sm">📧 contato@ideciclo.com.br</p>
            <p className="text-gray-300 text-sm">📞 (11) 3456-7890</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
