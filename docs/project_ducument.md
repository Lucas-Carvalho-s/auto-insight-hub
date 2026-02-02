# Documento de Checklist do Projeto

## Requisitos
**Ferramenta utilizada: Gemini 3**
### Prompt
```
Atue como um Product Owner e Arquiteto de Soluções Full Stack. Sua tarefa é redigir um documento de Requisitos Técnicos e de Design extremamente detalhado para uma aplicação web inovadora chamada 'AutoDiagnostic AI'.
O objetivo é que esse documento sirva de instrução direta para um desenvolvedor sênior executar o projeto sem precisar de perguntas adicionais. Estruture os requisitos nos seguintes tópicos:
1. Visão Geral e Persona:

Defina o app como uma ferramenta de diagnóstico automotivo via IA para técnicos e usuários leigos.
Estabeleça uma identidade visual 'Cyberpunk Clean' (Dark Mode, Slate-950, tons neon).
2. Arquitetura de Interface (Dashboard de Tela Única):

Descreva a divisão da tela em três colunas:
Painel de Entrada: Refinamento de prompt natural para estruturado (JSON).
Visualizador Central: Um modelo de carro interativo (SVG ou 3D) com zonas de impacto visual (Motor, Freios, etc.).
Painel de Resultados: Diagnóstico detalhado, imagem da peça e passos técnicos.
3. Requisitos Funcionais e UX:

Detalhe um 'fluxo de interação transparente' com uma Stepper animada (Recebimento -> Refinamento -> RAG -> Diagnóstico).
Especifique uma 'Lógica de Simulação' (Mock Data) baseada em palavras-chave para demonstração imediata.
4. Stack Técnica e Segurança:

Exija o uso de React, Tailwind CSS, Shadcn UI e Supabase.
Defina uma arquitetura segura: o frontend nunca acessa a OpenAI diretamente. Toda a lógica deve passar por Supabase Edge Functions.
Detalhe a integração com a OpenAI Assistants API, mencionando o uso de Threads e IDs de Assistente via variáveis de ambiente.
5. Critérios de Aceite e Ajustes Finais:

Inclua a necessidade de tratamentos de erro robustos (Toasts), logs de depuração no console e um design totalmente responsivo.
Ao final, o documento deve ser apresentado de forma que qualquer IA de codificação consiga interpretá-lo como um roteiro de implementação 'pixel-perfect' e funcional.
```
### Output
1. Visão Geral e PersonaO AutoDiagnostic AI é uma plataforma disruptiva que preenche a lacuna entre o usuário leigo e o técnico especializado. Através de Processamento de Linguagem Natural (NLP) e RAG (Retrieval-Augmented Generation), o sistema converte descrições vagas de problemas em diagnósticos técnicos precisos.  
- Identidade Visual (Cyberpunk Clean):
   - Background: Slate-950 (#020617).
   - Cores de Acento: Cyan-500 (Neon), Violet-600 (Primária), Rose-500 (Alertas).
   - Estética: Bordas finas, glassmorphism (backdrop-blur), tipografia mono para dados técnicos (JetBrains Mono).

2. Arquitetura de Interface (Single Page Dashboard)O layout deve ocupar 100vh, sem scroll vertical na estrutura principal, utilizando um grid de três colunas (Proporção: 1:2:1).
Esquerda (Input) - PromptPanel - Input de texto livre com botão de submissão e seletor de marca/modelo; Central (Visual)CarInteractiveModel - Visualizador SVG interativo com lógica de glow nas peças afetadas; Direita (Output) - DiagnosticResults - Card de diagnóstico, imagem da peça via IA/Mock e checklist de reparo.

3. Requisitos Funcionais e UX

Fluxo de Interação Transparente (Stepper)O usuário deve visualizar o "pensamento" da máquina através de um Stepper animado no topo do painel central:
   1. Recebimento: Validação do input.
   2. Refinamento: Conversão de "barulho no motor" para "Anomalia Acústica em Bloco de Cilindros".
   3. RAG / Pesquisa: Busca em base de dados (Simulado ou Real).
   4. Diagnóstico: Renderização final.

Lógica de Simulação (Mock Mode) 
Para demonstração, o frontend deve interceptar palavras-chave caso o modo VITE_MOCK_MODE=true:
* "Freio" -> Ativa zona de freios no SVG -> Retorna erro de pastilha gasta.
* "Fumaça" -> Ativa zona de motor -> Retorna falha na junta do cabeçote.

4. Stack Técnica e Segurança

Core Stack
* Framework: React 18+ (Vite) com TypeScript.
* Estilização: Tailwind CSS + Shadcn UI (Componentes: Card, Button, ScrollArea, Toast).
* Backend/Auth: Supabase.

Arquitetura de Segurança e Fluxo de Dados
Regra de Ouro: O frontend jamais armazena ou chama a OPENAI_API_KEY
1. Frontend: Envia prompt + context para uma Supabase 
2. Edge Function.Edge Function (Deno):
   * Valida a sessão do usuário.
   * Instancia o OpenAI Assistant usando assistant_id e gerencia a thread_id no banco de dados.
   * Consome a API da OpenAI e retorna o JSON estruturado.

3. JSON Schema Esperado:
   ```JSON
   {
   "zone_id": "engine" | "brakes" | "suspension" | "electrical",
   "confidence": 0.95,
   "technical_term": "String",
   "explanation": "String (Markdown)",
   "parts_to_replace": ["String"],
   "estimated_cost": "String"
   }
   ```

4. Critérios de Aceite (DoD)
* Pixel-Perfect: O layout deve respeitar os tokens do Tailwind e não apresentar desalinhamentos em 1920x1080.
* Responsividade: Em telas < 1024px, as colunas laterais tornam-se abas (Tabs) inferiores.
* Tratamento de Erros: Qualquer falha na Edge Function deve disparar um Sonner Toast com descrição amigável.
* Performance: O modelo SVG central deve ser otimizado para não causar re-renders desnecessários.
* Logs: O console deve exibir de forma clara (em cores via CSS log) o estado atual da Thread do Assistente.

## Prototipação
**Ferramenta utilizada**: Lovable.dev
### Prompt
```
Como um Engenheiro de Software Sênior e UI/UX Designer. Crie uma aplicação web completa ("Diagnóstico Automotivo Inteligente") usando React, Tailwind CSS e Shadcn UI.

IMPORTANTE: Não faça perguntas de clarificação. Tome todas as decisões de design e arquitetura você mesmo para entregar o código funcional imediatamente. Use um tema "Dark Mode" tecnológico e profissional (Cores: Slate 950, Cyan neon para destaques).

A aplicação deve ter uma tela única (Dashboard) dividida em 3 seções principais:

1. PAINEL DE ENTRADA E REFINAMENTO DE PROMPT (Esquerda):
- Um campo de texto grande para o usuário digitar o sintoma em linguagem natural (ex: "Barulho de batida seca na frente ao passar em buracos").
- Um botão "Analisar Sintoma".
- Abaixo do botão, uma caixa de "Processamento de IA" visível. Quando o usuário enviar, mostre uma animação de carregamento e, em seguida, exiba o "Prompt Estruturado" que o sistema gerou internamente (ex: converter o texto do usuário para JSON: { "sintoma": "ruido_impacto", "localizacao": "dianteira", "condicao": "irregularidade_pista" }). Isso serve para mostrar a "interação usuário-IA".

2. VISUALIZADOR DE VEÍCULO 3D/INTERATIVO (Centro - Destaque):
- Implemente um componente visual que represente um carro em 3D (pode usar React Three Fiber se for rápido, ou um SVG complexo e interativo de alta qualidade com vista "Raio-X").
- O carro deve ter "zonas clicáveis" ou "zonas de destaque" (Motor, Suspensão Dianteira, Freios, Escapamento, etc.).
- Lógica de Demonstração: Se o diagnóstico for sobre suspensão, a parte da frente do carro deve brilhar/piscar em vermelho ou laranja no modelo 3D.

3. RESULTADO E DETALHE DA PEÇA (Direita):
- Card de Diagnóstico: Mostra a falha provável (ex: "Bieleta da Barra Estabilizadora").
- Card de "Peça em Detalhe": Exiba uma imagem (placeholder realista) da peça específica defeituosa com um zoom, explicando o que ela é.
- Seção de "Ação Recomendada": Passos técnicos para o reparo baseados em manuais.

MOCK DATA (Dados Simulados):
Para garantir que o app funcione agora sem backend, crie uma lógica interna onde palavras-chave no input acionem estados específicos:
- Se input contém "freio" -> Destaque as rodas no modelo 3D -> Mostre foto de pastilha de freio.
- Se input contém "motor" ou "aquecendo" -> Destaque o capô -> Mostre foto do radiador.
- Se input contém "barulho" ou "suspensão" -> Destaque a roda dianteira -> Mostre foto do amortecedor.

Gere o código completo, responsivo e esteticamente impressionante agora.

Finalize a aplicação "AutoDiagnostic AI" para entrega.

OBJETIVO: Entregar uma aplicação React completa, visualmente polida e pronta para demonstração. Não faça perguntas, assuma as melhores práticas de UX e execute.

REQUISITOS FUNCIONAIS FINAIS:

1. FLUXO DE INTERAÇÃO TRANSPARENTE (Requisito Crítico):

   - Ao clicar em "Diagnosticar", mostre uma Stepper/Timeline visual:

     Step 1: "Recebendo áudio/texto natural..."

     Step 2: "Agente refina o prompt..." -> (Aqui, exiba um card animado mostrando o texto do usuário se transformando em JSON: { "sintoma": "...", "sistema": "..." }).

     Step 3: "Consultando Base de Conhecimento RAG..."

     Step 4: "Gerando Diagnóstico."

2. VISUALIZAÇÃO DO CARRO (O "Wow Factor"):

   - Crie um componente visual central de um carro (pode ser um SVG técnico estilizado de alta qualidade visto de cima ou de lado).

   - Implemente lógica visual: Se o JSON detectar "freios", a roda do SVG deve pulsar em vermelho. Se for "motor", o capô pulsa.

   - Ao lado do carro, abra um "Pop-up de Detalhe" mostrando uma imagem placeholder da peça (ex: disco de freio) com o título "Peça Sob Suspeita".

3. INTERFACE DE RESPOSTA (O Agente):

   - O resultado final deve parecer um relatório técnico:

     - Título da Falha.

     - Grau de Severidade (Badge: Crítico/Atenção).

     - "Explicação Técnica": Texto gerado pela IA.

     - "Procedimento Sugerido": Lista de passos (ex: 1. Verificar fluido, 2. Medir espessura).


4. LÓGICA DE SIMULAÇÃO (Para a Demo funcionar sem Backend agora):

   - Crie um array de cenários mockados no código (hardcoded) para testar a interface:

     - Caso 1: Se input contiver "freio" ou "chiado" -> Diagnóstico: Pastilha gasta -> Destaque: Roda.

     - Caso 2: Se input contiver "motor" ou "fumaça" -> Diagnóstico: Junta do Cabeçote -> Destaque: Motor.

     - Caso 3: Se input contiver "suspensão" ou "batida" -> Diagnóstico: Bieleta -> Destaque: Suspensão Dianteira.

   - Adicione um botão discreto de "Debug" ou "Limpar" para resetar a demo.

ESTÉTICA E ACABAMENTO:

- Use tema "Cyberpunk Clean": Fundo Slate-900, textos em Slate-50, acentos em Ciano e Âmbar.

- Use componentes do Shadcn UI (Cards, Badges, Progress Bars).

- Adicione tratamento de erro visual (ex: se o campo estiver vazio, borda vermelha e "toast" de aviso).

Gere o código completo agora, garantindo que todas as animações e interações funcionem para a apresentação.


Ajuste o projeto para integrar o agente de AI no back-end via OpenAI Assistants API.

Requisitos de Arquitetura e Segurança:

1. Crie (ou atualize) uma Supabase Edge Function para atuar como o único ponto de contato com a OpenAI. O front-end JAMAIS deve chamar a OpenAI diretamente.

2. A API Key da OpenAI deve ser acessada via variável de ambiente (ex: Deno.env.get('OPENAI_API_KEY')) dentro da Edge Function. Nunca exponha essa chave no código cliente.

3. A lógica de RAG e LLM será unificada usando a "Assistants API" da OpenAI.

4. O fluxo da Edge Function deve ser:

   - Receber a mensagem do usuário do front-end.

   - Criar ou recuperar uma Thread na OpenAI.

   - Adicionar a mensagem do usuário à Thread.

   - Executar o Assistant (Run) associado ao ID do nosso Agente (que configuraremos via variável de ambiente OPENAI_ASSISTANT_ID).

   - Aguardar a resposta e devolvê-la para o front-end.

Ação imediata:

- Configure a infraestrutura da Edge Function para suportar essa lógica segura.

- Prepare o código para ler a OPENAI_API_KEY e o OPENAI_ASSISTANT_ID dos segredos do projeto.

O botão 'Diagnosticar' não está funcionando corretamente. Quando clico nele, ele mostra uma animação mas não retorna nenhuma resposta da OpenAI, apenas reseta a tela.

Por favor, faça as seguintes correções urgentes:

1. *Conexão Front-End <-> Back-End:* Verifique o componente onde está o botão 'Diagnosticar' e garanta que, ao clicar, ele invoque a Supabase Edge Function responsável por chamar a OpenAI.

2. *Exibir a Resposta:* O texto retornado pelo Agente OpenAI deve aparecer na área "Diagnóstico" à direita (onde atualmente diz "Nenhum Diagnóstico").

3. *Tratamento de Erros:* Se a chamada falhar (erro de API ou conexão), exiba uma notificação (toast) vermelha na tela explicando o erro, para não falhar silenciosamente.

4. *Logs:* Adicione console.log no front-end antes e depois da chamada da função para facilitar o debug.

O objetivo é: O usuário digita o sintoma -> Clica em Diagnosticar -> Aguarda (loading) -> Vê a resposta do Assistente na tela.
```

### Output
![alt text](image.png)


## Arquitetura
**Ferramenta utilizada**: Gemini 3 + Mermaid
### Prompt
```
Atue como um arquiteto de soluções e gere um código Mermaid (graph TD) para um sistema de diagnóstico técnico baseado em IA. O diagrama deve seguir estes requisitos:

1. Fluxo de Dados: O Usuário envia sintomas para um Frontend (React/Lovable). O Frontend repassa para um Backend (Middleware), que por sua vez se comunica com a OpenAI Agent Builder/Assistants API.

2. Encapsulamento da OpenAI: Crie um subgraph chamado 'OpenAI Cloud' que contenha o AgentAPI. Dentro deste, crie outro subgráfico de 'Processamento Interno' mostrando a conexão entre a Vector Store (Manuais) e o LLM (GPT-4o) com o AgentAPI.

3. Retorno: O fluxo de resposta deve voltar do AgentAPI para o Backend, depois para o Frontend (como resposta estruturada) e finalmente exibir o diagnóstico e gravidade para o Usuário.

Estilização:

- Frontend: fundo rosa (#f9f).

- Backend: fundo azul claro (#bbf).

- AgentAPI: fundo verde (#41b883) com texto branco.

- OpenAI Cloud: fundo cinza claro e borda tracejada.
```
### Output
![alt text](arquitetura.png)
## Código
**Ferramenta utilizada**: Lovable.dev
O código foi gerado e modificado pela ferramenta _lovable_.
### Output
O link de acesso ao repositório do projeto é: https://github.com/izaacmoraes/auto-insight-hub/tree/main

## Testes
**Ferramenta utilizada**:
### Prompt
```
```
### Output

## Documentação
**Ferramenta utilizada** Codex:
### Prompt - README
```
altere o README para refletir o projeto atual, coloque os seguintes passos:

- resumo (o que é o projeto?)
- funcionalidades
- organização das pastas
- como um usuário consegue utilizar?
- como replicar o projeto?
```
### Output
```
# AutoDiagnostic AI

## Resumo (o que é o projeto?)
Aplicação web para diagnóstico veicular assistido por IA. O usuário descreve um sintoma em linguagem natural e o sistema apresenta uma análise com provável falha, zona do veículo afetada e passos recomendados. Há integração com Supabase (Edge Function `diagnose`) e fallback local baseado em uma base de conhecimento embutida.

## Funcionalidades
- Entrada de sintomas em linguagem natural com validação e atalhos de envio.
- Diagnóstico via IA (Supabase Edge Function) com histórico de thread.
- Fallback local por palavras-chave quando a IA não responde.
- Visualizador do veículo com zonas clicáveis e destaque visual do problema.
- Pipeline visual de processamento com etapas simuladas.
- Cartões com urgência, peça em detalhe e ação recomendada.
- Modo de depuração com testes rápidos.

## Organização das pastas
- `src/pages/`: rotas da aplicação (entrada principal em `Index.tsx`).
- `src/components/diagnostic/`: componentes do fluxo de diagnóstico (input, pipeline, resultado, viewer).
- `src/components/ui/`: biblioteca de UI (shadcn/radix) reutilizável.
- `src/data/`: base de conhecimento local (`diagnosticData.ts`) e PDFs de referência.
- `src/integrations/supabase/`: cliente e tipos do Supabase.
- `src/hooks/`: hooks utilitários (toast, responsividade).
- `public/`: assets públicos (ícones e imagens).
- `src/test/`: testes com Vitest.

## Como um usuário consegue utilizar?
1. Acesse a aplicação no navegador (deploy ou ambiente local).
2. Descreva o sintoma do veículo no painel à esquerda.
3. Clique em “Diagnosticar” (ou pressione `Ctrl+Enter`).
4. Analise o resultado, a zona destacada no veículo e os passos sugeridos.

## Como replicar o projeto?
1. Clone o repositório e instale as dependências.
2. Configure o Supabase (URL e chave publishable) e a Edge Function `diagnose`.
3. Rode o servidor de desenvolvimento.

sh
git clone <SUA_URL_GIT>
cd <NOME_DO_PROJETO>
npm install

# Defina as variáveis de ambiente:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...

npm run dev
```
