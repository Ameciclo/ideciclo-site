Perfeito — agora ajustei a tabela corrigindo os pontos que você indicou (especialmente **B1**, **B5**, **B6** e **B7**) e eliminando as inconsistências anteriores.

---

## **Tabela de Revisão – Formulário IDECICLO (versão corrigida)**

### **UI geral**

| Item                | Revisado? | Problemas Identificados           | Sugestões                                   |
| ------------------- | --------- | --------------------------------- | ------------------------------------------- |
| Badges              | ✔         | Muito grandes; perderam pontuação | Retomar tamanho anterior + exibir pontuação |
| Clique              | ✔         | Retrai conteúdo indevidamente     | Remover retração                            |
| Botão limpar        | ✔         | Grande e mal posicionado          | Reduzir e alinhar com “em análise”          |
| Revisão final       | ✔         | Erro (“faca”); caixas aninhadas   | Corrigir texto + simplificar layout         |
| Estrutura de blocos | ✔         | Container grande reduz área útil  | Remover/desaninhar                          |

---

## **Bloco A**

| Item              | Revisado? | Problemas             | Sugestões                                                                                            |
| ----------------- | --------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| Estrutura geral A | ✔         | Ordem confusa         | Reorganizar fluxo: **hierarquia viária → tipologia → fluxo → velocidade → A2 (quadras/interseções)** |
| A1                | ✔         | Falta variável buffer | Incluir **largura da zona de amortecimento** no cálculo                                              |
| A2                | ✔         | Sem estrutura clara   | Criar bloco **conectividade da rede cicloviária**                                                    |

---

## **Bloco B**

### **B1 – Espaço útil / largura**

| Item    | Revisado? | Problemas                   | Sugestões                                                                                             |
| ------- | --------- | --------------------------- | ----------------------------------------------------------------------------------------------------- |
| B1      | ✔         | Interface incompleta        | Manter cálculo atual + incluir: <br>• **campo de largura** <br>• **campo de buffer (B3.2 integrado)** |
| Sarjeta | ✔         | Tipo de controle inadequado | Manter no B1 e transformar em **toggle (liga/desliga)**                                               |

---

### **B2 / E2**

| Item | Revisado? | Situação |
| ---- | --------- | -------- |
| B2   | ✔         | Correto  |
| E2   | ✔         | Correto  |

---

### **B3 – Proteção e afastamento**

| Item | Revisado? | Problemas              | Sugestões                                       |
| ---- | --------- | ---------------------- | ----------------------------------------------- |
| B3.1 | ✔         | —                      | Correto                                         |
| B3.2 | ✔         | Não existe             | Criar e integrar ao B1                          |
| B3   | ✔         | Está como campo manual | Remover input e manter como **cálculo interno** |

**Regra:**

* Ciclovia/ciclofaixa → matriz bidimensional
* Calçada compartilhada → **B3 = B3.1**

---

### **B4 – Sinalização**

(sem alteração estrutural em relação à versão anterior — mantidas as definições de matriz, B4.1, B4.2 e B4.3 conforme já consolidadas)

---

## **B5 – Travessias**

| Item          | Revisado? | Problemas                      | Sugestões                                                                                                   |
| ------------- | --------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| B5            | ✔         | Interface pouco adequada       | Substituir botões por padrão visual coerente (evitar radio tradicional)                                     |
| Lógica        | ✔         | Não baseada em contagem direta | Implementar: <br>• contar travessias sinalizadas <br>• dividir pelo nº de quadras                           |
| Classificação | ✔         | —                              | Resultado: <br>• **≥2 por quadra → A** <br>• **1 por quadra → B** <br>• **<1 (existe) → C** <br>• **0 → D** |

---

## **B6 – Moderação de tráfego (traffic calming)**

| Item      | Revisado? | Problemas              | Sugestões                                                                                                           |
| --------- | --------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| B6        | ✔         | Lógica não estruturada | Implementar **contagem de elementos físicos**                                                                       |
| Elementos | ✔         | —                      | Contar: <br>• lombadas <br>• valas <br>• faixas elevadas <br>• elevações de interseção <br>• estreitamento de faixa |
| Interface | ✔         | —                      | Botões incrementais (contador por tipo)                                                                             |
| Cálculo   | ✔         | —                      | **distância média = extensão / nº de elementos**                                                                    |

### **Parâmetros por velocidade**

| Velocidade | Recomendada | Máxima |
| ---------- | ----------- | ------ |
| 30 km/h    | 50 m        | 75 m   |
| 10–20 km/h | 20 m        | 50 m   |

### **Classificação**

* **A:** distância ≤ recomendada
* **B:** entre recomendada e máxima
* **C:** > máxima
* **D:** sem elementos

---

## **B7 – Situações de risco**

| Item   | Revisado? | Problemas               | Sugestões                                               |
| ------ | --------- | ----------------------- | ------------------------------------------------------- |
| B7     | ✔         | Interface pode melhorar | Usar **checkbox (marcar/desmarcar)** ou toggle por item |
| Lógica | ✔         | —                       | Baseado em **existência de tipos de risco**             |

### **Itens**

* Conflito com ponto de ônibus / escola
* Obstáculos horizontais
* Obstáculos verticais
* Mudança de lado da infraestrutura
* Sentido contrário ao fluxo

### **Classificação**

* **A:** nenhum
* **B:** 1 tipo
* **C:** 2 tipos
* **D:** 3 ou mais tipos

---

## **Síntese das correções mais importantes desta rodada**

1. **Correção estrutural do B1**

   * Largura + buffer integrados corretamente
   * Controle de sarjeta corrigido (toggle)

2. **Ajuste fino do B5**

   * Passa a ser baseado em **densidade de travessias**

3. **Modelagem robusta do B6**

   * Introduz lógica espacial (distância entre elementos)
   * Diferencia por velocidade

4. **Clareza metodológica no B7**

   * Avaliação por **quantidade de tipos de risco**
   * Interface simplificada (checkbox/toggle)

---

Se quiser, no próximo passo já posso transformar tudo isso em um **documento de requisitos estruturado (com regras de negócio formalizadas + pseudológica pronta para implementação)**.
