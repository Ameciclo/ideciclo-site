# Debug da Página Refinar

## Problema
A página refinar fica em branco após selecionar um estado e cidade quando a cidade já foi baixada anteriormente.

## Mudanças Implementadas para Debug

1. **ErrorBoundary**: Adicionado para capturar erros React que causam tela branca
2. **Logs de Debug**: Adicionados em pontos críticos:
   - `loadStoredCityData()` - carregamento de dados armazenados
   - `handleCitySelected()` - seleção de cidade
   - Renderização da página Refine
   - Componentes CityInfrastructureCard, RefinementTableSortableWrapper e CityMap

3. **Verificações de Segurança**: Adicionadas para evitar erros com dados undefined/null

## Como Testar

1. Abra o navegador e vá para `http://localhost:8081/refinar`
2. Abra o DevTools (F12) e vá para a aba Console
3. Selecione um estado e cidade que já foi baixada anteriormente
4. Observe os logs no console que começam com `[DEBUG]`

## Logs Esperados

Quando funciona corretamente:
```
[DEBUG] handleCitySelected - Found city data in database with X segments
[DEBUG] handleCitySelected - City data: {...}
[DEBUG] handleCitySelected - Segments sample: [...]
[DEBUG] handleCitySelected - State updated, moving to refinement
[DEBUG] handleCitySelected - Setting step to refinement
[DEBUG] handleCitySelected - Step set to refinement
[DEBUG] Refine render - Current state: {...}
[DEBUG] Rendering refinement section with: {...}
[DEBUG] CityInfrastructureCard render: {...}
[DEBUG] RefinementTableSortableWrapper render: {...}
```

## Possíveis Causas do Problema

1. **Erro no componente**: Um dos componentes está lançando uma exceção
2. **Dados corrompidos**: Os dados armazenados estão em formato inválido
3. **Estado inconsistente**: O estado React não está sendo atualizado corretamente
4. **Problema de renderização**: Algum componente filho está causando erro

## Próximos Passos

Após executar o teste, verifique:
1. Se há erros no console
2. Onde os logs param de aparecer (indica onde está o problema)
3. Se o ErrorBoundary captura algum erro