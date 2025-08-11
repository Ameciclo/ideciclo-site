import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Apoiadores = () => {
  const supporters = [
    {
      name: "AMECICLO",
      description: "Associação Metropolitana de Ciclistas do Recife",
    },
    {
      name: "Rodas da Paz",
      description: "Organização pela mobilidade urbana sustentável",
    },
  ];

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-6">Apoiadores</h2>
      
      <div className="mb-8 text-gray-700">
        <p className="mb-4">
          O IDECICLO é possível graças ao apoio e colaboração de organizações comprometidas 
          com a promoção da mobilidade urbana sustentável e segura.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {supporters.map((supporter) => (
          <Card key={supporter.name} className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Logo</span>
              </div>
              <CardTitle className="text-xl">{supporter.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{supporter.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Apoiadores;