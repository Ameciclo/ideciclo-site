import type { Organization } from "@/types/content";

export const SupportersSection = ({ partners, consultants, sponsors }) => {
  const renderOrganizationCard = (org: Organization) => (
    <div
      key={org.name}
      className="flex flex-col rounded-[40px] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] h-full p-6 justify-center align-center bg-white text-text-grey hover:bg-ideciclo-yellow hover:text-text-grey transition-colors text-center"
    >
      <div className="mx-auto mb-6 w-40 h-32 flex items-center justify-center">
        <img
          src={org.logo}
          alt={org.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      <h3 className="text-2xl font-bold text-ideciclo-red mb-3">{org.name}</h3>
      <p className="text-text-grey">{org.description}</p>
    </div>
  );

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <div className="relative inline-flex items-center justify-center">
          {/* SVG Background */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 341 80"
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[120%] flex-shrink-0  z-[-1]"
            style={{
              fill: "#EFC345",
              filter: "drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.25))",
            }}
          >
            <path d="M9.80432 49.4967C9.04999 36.8026 8.77685 25.0274 8.03552 12.6779C7.94931 11.6804 8.02121 10.6478 8.23907 9.75347C8.45697 8.85917 8.80762 8.15768 9.23206 7.76683C10.6514 6.75694 12.1036 5.98883 13.5761 5.46925C16.9707 4.55021 20.4043 3.88966 23.8249 3.71734C50.045 2.36751 76.2522 0.845359 102.498 3.31526C124.258 5.29693 146.069 5.12462 167.828 7.04884C194.035 9.40387 220.203 13.08 246.384 15.952C265.122 18.0198 283.859 19.8387 302.597 21.4088C310.647 22.098 318.724 21.8683 326.775 22.1842C328.283 22.1842 329.792 22.615 331.535 22.9883C332.011 23.2229 332.427 23.8582 332.694 24.7593C332.961 25.6604 333.059 26.756 332.966 27.8133L331.522 59.7497C331.509 60.5938 331.376 61.4076 331.143 62.077C330.91 62.7465 330.587 63.2382 330.221 63.4833C329.538 63.838 328.841 64.0591 328.14 64.1439C299.878 64.8331 271.616 66.3553 243.367 65.9245C212.504 65.465 181.627 63.3971 150.764 61.6739C135.04 60.8123 119.328 58.802 103.604 58.0265C85.6556 57.2224 67.6813 57.8542 49.7199 56.9926C37.2601 56.4182 24.3841 54.5227 11.274 53.0867C10.878 52.9603 10.5143 52.5324 10.246 51.8769C9.97766 51.2214 9.82144 50.3795 9.80432 49.4967Z" />
          </svg>
          <h1 className="text-3xl sm:text-5xl font-bold bg-ideciclo-red text-white rounded-[2.5rem] shadow-[0px_6px_8px_rgba(0,0,0,0.25)] inline-flex items-center justify-center h-[6rem] px-[2.1875rem] py-[1rem] gap-[1rem] flex-shrink-0 relative z-10">
            Apoiadores
          </h1>
        </div>
      </div>

      <div className="mb-8 text-text-grey text-center">
        <p className="mb-4 text-lg">
          O IDECICLO é possível graças ao apoio e colaboração de organizações
          comprometidas com a promoção da mobilidade urbana sustentável e
          segura.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-ideciclo-red mb-6 text-center">
          Parceria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map(renderOrganizationCard)}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-ideciclo-red mb-6 text-center">
          Consultoria
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {consultants.map(renderOrganizationCard)}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-ideciclo-red mb-6 text-center">
          Patrocínio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sponsors.map(renderOrganizationCard)}
        </div>
      </div>
    </div>
  );
};
