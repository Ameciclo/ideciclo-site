const Footer = () => {
  return (
    <footer className="relative mt-12 overflow-hidden border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ideciclo-teal/50 to-transparent" />
      <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-ideciclo-teal/10 blur-3xl" />

      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <img src="/ideciclo-marca.png" alt="IDECICLO" className="mt-1 h-14 w-14 shrink-0 object-contain" />

            <div className="space-y-2">
              <div>
                <h3 className="text-lg font-black tracking-wide text-slate-900">IDECICLO</h3>
                <p className="text-sm text-slate-600">Índice de Desenvolvimento Cicloviário</p>
              </div>
              <p className="max-w-xl text-sm leading-6 text-slate-600">
                Ferramenta aberta e replicável para promover cidades mais seguras para todas as pessoas, inclusive as que pedalam.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:gap-8">
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Ameciclo</p>
              <p>Associação Metropolitana de Ciclistas do Recife</p>
              <p>
                <a href="mailto:contato@ameciclo.org" className="transition hover:text-ideciclo-red">
                  contato@ameciclo.org
                </a>
              </p>
              <p>
                <a
                  href="https://www.ameciclo.org"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-ideciclo-red"
                >
                  www.ameciclo.org
                </a>
              </p>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Acompanhe</p>
              <p>
                <a
                  href="https://github.com/Ameciclo/ideciclo-site"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-ideciclo-red"
                >
                  github.com/Ameciclo/
                </a>
              </p>
              <p>
                <a
                  href="https://instagram.com/ameciclo"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-ideciclo-red"
                >
                  instagram.com/ameciclo
                </a>
              </p>
              <p>
                <a
                  href="/manual_de_marca_ideciclo.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-ideciclo-red"
                >
                  Manual de marca
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p>© 2026 IDECICLO</p>
          <p>GNU Affero General Public License</p>
          <p>Desenvolvido pela Ameciclo</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
