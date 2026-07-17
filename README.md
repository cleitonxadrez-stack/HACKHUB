# HACK HUB® — Site Institucional + Aplicação (módulo por módulo)

Site institucional (landing page + páginas de módulo) da plataforma **HACK HUB**, parte do **Ecossistema HACK BRASIL** (junto com HACK Academy e HACK School). Além da "vitrine" pública, o projeto já inclui o primeiro **módulo funcional real** da área logada: o **Painel do Clube**.

Layout, paleta de cores (preto + amarelo + branco), tipografia (Poppins) e componentes (badges, botões, cards) seguem o mesmo padrão visual do site de referência HACK ACADEMY, adaptado para a identidade e mensagem do HACK HUB. A marca **HACK HUB®** é exibida apenas em **wordmark de texto** (sem ícone/emblema) no header, footer, topbar do app e página de login de todas as páginas — o arquivo `images/logo-hackhub.png` (ícone + wordmark) permanece em uso **apenas como favicon** (ícone da aba do navegador).

## ✅ Navegação principal (menu)

O menu foi reorganizado para refletir diretamente as etapas da Jornada HACK:

**Início | Criando o Clube | Jornada Discovery | Jornada Builder | Banco HACK | HACK Challenges | HACK Festival | Índice IIH | Ranking | Acessar o HACK HUB**

> 🆕 **Novidades desta rodada**: foram construídos e testados (via Playwright, com dados de QA criados e depois removidos) **quatro novos módulos funcionais completos**, dando sequência à área logada:
> 1. **Jornada HACK Builder** (`app/builder.html` + `js/app-builder.js`) — 5 trilhas de competências (Inovação & Criatividade, Tecnologia, Inteligência Artificial, Empreendedorismo, Gestão de Projetos), cada uma com 4 competências de desbloqueio **sequencial** (só libera a próxima depois de concluir a anterior), com formulário de entrega por competência e nova gamificação **"Pontos Builder"** (20 ou 30 pontos por competência, conforme a competência).
> 2. **Dashboard da Equipe** (`app/dashboard.html` + `js/app-dashboard.js`) — visão agregada por equipe: pontos de Discovery + Banco HACK + Builder (e total), posição no ranking geral do Ecossistema HACK BRASIL, progresso/missão em andamento e IIH real (quando avaliado) da Jornada Discovery, e resumo de desafios do Banco HACK e competências do Builder.
> 3. **HACK Challenges** (`app/challenges.html` + `js/app-challenges.js` para as equipes; `app/empresa.html` + `js/app-empresa.js` para as empresas parceiras) — mural de desafios reais publicados por empresas (categoria, valor de premiação, prazo, descrição). As equipes aceitam um desafio, desenvolvem a solução e enviam a proposta; a empresa avalia (nota + feedback), aprova ou rejeita e registra o pagamento da premiação. Ciclo de status da proposta: `Aceito → Proposta enviada → Aprovada/Rejeitada → Paga`.
> 4. **HACK Festival** (`app/festival.html` + `js/app-festival.js`) — a equipe só pode se inscrever depois de concluir as 10 missões da Jornada Discovery; inscreve o projeto com o link do pitch final (pré-preenchido a partir da Missão 10, se existir) e acompanha o status: `Inscrito → Avaliado → Finalista/Vencedor`, com tela de resultado festiva (cores/emoji diferentes por status).
>
> Também: **navegação cruzada** entre todos os módulos da área logada foi atualizada (barras superiores de `clube.html`, `discovery.html`, `banco-hack.html`, `builder.html`, `challenges.html` passaram a linkar entre si e para o novo Dashboard/Festival/Challenges/Empresa).
>
> Novidades de rodadas anteriores: o **Banco HACK** tem **níveis de dificuldade com pontuação própria** — cada desafio é Fácil (+10 pontos), Médio (+20) ou Difícil (+30), com filtro visual por nível (chips + selo colorido `.nivel-tag`) na lista de desafios; os pontos ("Pontos HACK") são concedidos **uma única vez por equipe+desafio** (refazer um desafio não duplica pontos); sistema de **Ranking** em dois lugares: um **ranking interno** dentro do Painel do Clube (aba "Ranking", comparando só as equipes do próprio clube) e uma **página pública `ranking.html`** — sem necessidade de login, mostrando o **Ranking de Equipes** e o **Ranking de Escolas** de todo o Ecossistema HACK BRASIL. Em ambos os rankings, a pontuação de cada equipe é a soma de **Pontos de Impacto** (Jornada Discovery) + **Pontos HACK** (Banco HACK); Painel do Clube tem ferramenta de **exportar dados** (.txt/.json) e **link público compartilhável** (`app/clube-publico.html`); a **Jornada HACK Discovery** é um módulo 100% funcional (`app/discovery.html`) com as 10 missões nomeadas e Pontos de Impacto; o **Banco HACK** (`app/banco-hack.html`) tem **cálculo automático real do IIH** (0-100) com selo Bronze/Prata/Ouro/Diamante.

Cada item do menu tem sua própria página dedicada, já com conteúdo estruturado (Hero, Objetivo, Ações da etapa, Resultado e CTA para a próxima etapa). As abas **Índice IIH** e **🆕 Ranking** foram adicionadas ao menu principal (header e footer) — a primeira dá acesso direto à explicação completa da metodologia de avaliação, a segunda mostra o ranking público de equipes e escolas.

## ✅ Funcionalidades implementadas

### Site institucional

- **Header e Footer reutilizáveis** (`includes/header.html`, `includes/footer.html`), injetados via `js/common.js` em todas as páginas, com menu mobile funcional e indicação do link ativo (`data-nav`).
- **Página inicial (`index.html`)**: Hero, Jornada visual (timeline clicável), "Conheça a Jornada HACK" (6 cards), seção do IIH (resumo + botão "Entenda o IIH"), "Do treinamento ao impacto real", CTA final.
- **Páginas de cada etapa da Jornada HACK** (Hero temático, Objetivo, Ações detalhadas, Resultado esperado, CTA):
  - `clube.html` — Criando o Clube
  - `discovery.html` — Jornada HACK Discovery (as 10 missões)
  - `builder.html` — Jornada HACK Builder
  - `banco-hack.html` — Banco HACK
  - `challenges.html` — HACK Challenges
  - `festival.html` — HACK Festival
- **`iih.html`** — página completa da **Metodologia de Avaliação do IIH vinculada aos ODS**, contendo:
  1. **O que é o IIH?** — as 4 dimensões avaliadas com pesos (Compreensão do Problema 10%, Impacto ODS 40%, Planejamento Estratégico 25%, Ferramentas Adequadas 25%), com barras visuais.
  2. **A âncora dos ODS** — ODS diretos = 3 pts, indiretos = 1 pt; 3 níveis de profundidade (Paliativa x1, Sistêmica x2, Transformadora x3); fórmula: `Pontuação ODS = (ODS Diretos × 3 + ODS Indiretos × 1) × Multiplicador de Profundidade`.
  3. **Exemplo prático "Desafio da Dona Joana"** — 3 alternativas com ODS mapeados, profundidade e cálculo (4, 24, 16 pontos).
  4. **Mockup da tela de resultado do aluno** — IIH 82/100, breakdown por dimensão, ODS impactados, selo obtido.
  5. **Escala de selos** — 🥉 Bronze, 🥈 Prata, 🥇 Ouro, 💎 Diamante.
  6. **Texto de apresentação para escolas/empresas.**
  7. **Matriz de Correlação (Planejamento e Ferramentas)** — regra oficial salva para o motor de cálculo futuro do Banco HACK: o professor classifica as 10 etapas de planejamento e as 10 ferramentas como *Essencial* (5 pts) / *Recomendada* (3 pts) / *Irrelevante* (0 pts) para cada alternativa de solução; nota do aluno = `(soma dos pontos das escolhas ÷ soma das melhores pontuações possíveis) × 25`, para cada uma das dimensões Planejamento e Ferramentas. Inclui exemplo de feedback automático ao aluno.
  - ⚠️ Esta página é **apenas explicativa**: descreve a metodologia, mas ainda não calcula o IIH real de uma submissão — isso será construído junto com o Banco HACK.
- **Páginas complementares**: `ecossistema.html`, `contato.html` (formulário client-side), `privacidade.html`, `termos.html`.
- **`app/login.html`** — portal de acesso à área logada; atualmente leva direto ao primeiro módulo funcional (Painel do Clube).

### 🆕 Aplicação (área logada) — Módulo 1: Painel do Clube

**`app/clube.html`** (lógica em `js/app-clube.js`) é a primeira ferramenta **funcional de verdade** da plataforma, com persistência via Table API (não é mais apenas institucional). Funcionalidades:

- **Criar um HACK CLUB** — formulário (nome, escola, cidade, estado, logo via URL, descrição). O clube criado fica marcado como "ativo" no navegador (`localStorage`).
- **Editar informações do clube** — modal de edição a qualquer momento.
- **Cadastrar professor(es) mentor(es)** — nome, e-mail, telefone, área de atuação, **foto (URL)** e bio; exibidos em cards com avatar (foto real ou iniciais).
- **Convidar estudantes** — nome, e-mail, turma/série, **foto (URL)**; status "Convidado" → "Confirmado" (confirmado automaticamente ao entrar numa equipe).
- **Criar equipes** — nome, lema, cor/identidade visual, **brasão (URL)**.
- **Definir nome e identidade da equipe** — edição da identidade (nome, lema, cor, brasão) a qualquer momento.
- **Adicionar/remover integrantes da equipe** — a partir da lista de estudantes convidados que ainda não estão em nenhuma equipe.
- **Distribuir funções na equipe** — Líder, Criativo, Pesquisador, Comunicador, Executor — por integrante, via seletor inline no card da equipe.
- **Aprovar equipes** — muda o status de "Em formação" para "Aprovada" (com opção de reabrir).
- **Acompanhar equipes criadas** — cards com fotos/avatares dos integrantes, contagem de membros, status e identidade visual.
- **Painel com estatísticas** (nº de professores mentores, estudantes, equipes, equipes aprovadas) e bloco de **Resultado da etapa** com CTA para a próxima etapa (Discovery).
- **🆕 Aba "Ranking"** — nova aba no painel (junto com Professor Mentor / Estudantes / Equipes) que mostra o **ranking interno das equipes do próprio clube**, ordenado do maior para o menor total de pontos. Cada linha mostra posição (🏆 1º, 🥈 2º, 🥉 3º, depois nº), brasão/cor da equipe, e o detalhamento **Pontos de Impacto (Discovery) + Pontos HACK (Banco HACK) = Total**. Inclui um botão "Ver ranking público de todas as escolas", que abre `ranking.html` em nova aba.
- **🆕 Exportar informações do clube** — botão "Exportar / Compartilhar" no cabeçalho do painel, com duas opções de download: resumo em `.txt` (legível, pronto para colar em e-mail/formulário) e dados completos em `.json` (estruturado, para uso em outras ferramentas). Ambos reúnem clube, professores mentores (com LinkedIn), equipes (com integrantes) e estudantes (com Instagram e Perfil HACK).
- **🆕 Link público para compartilhar** — o mesmo botão gera um link (`app/clube-publico.html?id=...`) que pode ser copiado (com fallback automático caso o navegador bloqueie a Clipboard API) e enviado para qualquer pessoa fora da plataforma — por exemplo, para inscrever o clube em um **HACK Festival** ou apresentá-lo a um parceiro. A página pública é **somente leitura, sem necessidade de login**, e mostra a ficha do clube, professores mentores (com LinkedIn) e equipes com seus integrantes (com Instagram e Perfil HACK).
- Acesso: `app/login.html` → "Entrar no Painel do Clube", ou pela página institucional `clube.html` → "Criar meu HACK CLUB agora".

**Perfis do participante (fotos e informações) já contemplados**: professor mentor (foto, nome, área, contato, **LinkedIn**, bio), estudante (foto, nome, turma, status do convite, **Instagram**, perfil HACK, equipe) e equipe (brasão, nome, lema, cor, integrantes com foto e função). O próprio clube também pode ter um Instagram oficial cadastrado.

**Perfil HACK — integração com a HACK School**: o teste dos 5 Perfis HACK já existe em outra plataforma, **app.hackschool.app**, e não será refeito aqui. Os 5 perfis oficiais são:

| Perfil | Descrição |
|---|---|
| 💡 **Creator** | Transforma ideias em oportunidades |
| 🚀 **Builder** | Faz as ideias acontecerem |
| 🎤 **Connector** | Conecta pessoas, ideias e oportunidades |
| 🤖 **Tech Maker** | Usa a tecnologia para criar soluções |
| 🌍 **Leader** | Inspira pessoas e conduz a equipe ao resultado |

A decisão de produto foi: o campo "Perfil HACK" no cadastro/edição do estudante é **opcional**, com um link direto "Fazer o teste em app.hackschool.app" — o estudante faz o teste lá, e o professor apenas **seleciona o resultado manualmente** aqui no HACK HUB (select com as 5 opções, cada uma com emoji + descrição, + "Ainda não realizado"). Enquanto não for preenchido, o card do estudante mostra um selo "Perfil HACK pendente" (clicável, abre o mesmo formulário de edição). O perfil, quando preenchido, aparece com seu emoji junto ao nome do estudante também dentro do card da equipe.

### 🆕 Aplicação (área logada) — Módulo 2: Jornada HACK Discovery

**`app/discovery.html`** (lógica em `js/app-discovery.js`) é a segunda ferramenta **funcional** da plataforma — o fluxo completo das **10 missões** da metodologia Discovery, com gamificação em **Pontos de Impacto** e um projeto que **se monta automaticamente** conforme a equipe avança (a equipe nunca "cria um projeto": ela só responde às missões, uma a uma).

As 10 missões foram batizadas com nomes de etapas (mais memoráveis do que "Missão 1, 2, 3..."), contando uma pequena história de evolução do estudante como inovador:

| # | Etapa | O que a equipe faz | Pontos de Impacto |
|---|---|---|---|
| 1 | **Explorar** | Confirma que entendeu a metodologia da Jornada HACK | +10 |
| 2 | **Observar** (Escola) | Registra 3 problemas da escola (título, descrição, quem é afetado, foto) | +40 |
| 3 | **Observar** (Comunidade) | Registra 3 problemas da comunidade/bairro | +40 |
| 4 | **Observar** (Município) | Registra 3 problemas do município | +40 |
| 5 | **Observar** (Empresas) | Registra 3 desafios de empresas locais | +40 |
| 6 | **Escolher** | Seleciona, entre todos os problemas registrados, qual será trabalhado; justifica a escolha; marca os ODS relacionados (as 17 opções oficiais) | +30 |
| 7 | **Investigar** | Registra quem sofre com o problema, se houve entrevistas, quantas pessoas e o que foi descoberto | +30 |
| 8 | **Imaginar & Construir** | Dá nome ao projeto, descreve a solução, anexa desenho/arquivo e o link do MVP (foto, vídeo, protótipo, maquete ou site) | +50 |
| 9 | **Validar** | Registra quem testou a solução, o que disseram e o que mudou | +30 |
| 10 | **Comunicar & Apresentar** | Envia o pitch final (PDF, slides, vídeo ou link) — conclui a Jornada Discovery | +50 |

Funcionalidades da tela:

- **Seleção automática de clube/equipe** — usa o clube ativo salvo em `localStorage` e a(s) equipe(s) **aprovada(s)** no Painel do Clube; se houver mais de uma equipe aprovada, pede para escolher qual vai jogar (também salva em `localStorage`, com botão "Trocar equipe").
- **Painel com barra de progresso, % concluído e Pontos de Impacto acumulados**, card de "Próxima Missão" com botão "Iniciar Missão", e checklist visual das 10 missões (concluída / atual / bloqueada — missões são sequenciais).
- **Formulário próprio para cada missão**, sem provas — ao salvar, a missão fica marcada como concluída (✅) e os Pontos de Impacto correspondentes são somados, com toast de celebração ("🎉 Parabéns! Sua equipe ganhou +40 Pontos de Impacto").
- **Projeto montado automaticamente** — seção "Seu projeto" no dashboard exibe, em tempo real, Nome do Projeto, Equipe, ODS Relacionados, Problema Escolhido, Pesquisa/Entrevistas, Solução, MVP, Validação e Pitch — tudo preenchido sozinho a partir das respostas das missões.
- **Tela de conclusão da jornada** ao terminar a Missão 10, com CTA para a próxima etapa (`builder.html`).
- Acesso: `app/clube.html` (botão "Próxima etapa: Discovery") ou pela página institucional `discovery.html` ("Iniciar a Jornada Discovery").
- ⚠️ O **IIH ainda não é calculado automaticamente** ao final da Missão 10 — isso depende do motor de cálculo do Banco HACK (matriz de correlação), ainda não implementado. Por ora, a jornada registra tudo o que é necessário para esse cálculo futuro (ODS selecionados, problema, planejamento e ferramentas quando o Banco HACK existir).

#### 🛡️ Rodada de robustez (preparação para avaliação prática com turmas reais)

Antes de uma avaliação prática com professores/alunos de verdade, o módulo Discovery passou por um reforço de estabilidade:

- **Estado de carregamento** (`#view-loading`) — spinner exibido imediatamente ao abrir a página, evitando tela em branco enquanto os dados do clube/equipe/projeto são buscados.
- **Estado de erro com nova tentativa** (`#view-erro`) — se a API falhar (queda de conexão, instabilidade), a tela mostra uma mensagem clara e um botão "Tentar novamente", em vez de travar ou quebrar silenciosamente. `init()` e `selecionarEquipe()` estão protegidas com `try/catch`.
- **Clube inativo/excluído tratado como "sem clube"** — se o `id` salvo no navegador não existir mais (404), a tela redireciona para o fluxo normal de "nenhum clube ativo" em vez de cair no estado de erro genérico.
- **Proteção contra envio duplicado** — ao salvar uma missão, o botão é desabilitado e mostra "Salvando..." com spinner até a resposta da API chegar; se der erro, o botão volta ao normal para permitir tentar de novo (evita pontos duplicados por clique duplo ou conexão lenta).
- **Validação mínima de ODS na Missão 6** — não é mais possível salvar a escolha do problema sem marcar pelo menos 1 ODS (isso é essencial para o cálculo futuro do IIH, que depende dos ODS selecionados); mostra um toast explicativo e não perde os dados já preenchidos no formulário.
- **Campos de link menos restritivos** — os campos de Foto/Anexo/MVP/Pitch (Missões 2–5, 8 e 10) aceitam texto livre (`type="text"`) em vez de exigir uma URL estritamente válida (`type="url"`), evitando que o navegador bloqueie o envio quando o aluno cola um texto informal (ex.: "pasta do Drive", "vídeo no WhatsApp") em vez de um link `https://` completo.
- **Apenas o Problema 1 é obrigatório nas Missões 2–5** — os Problemas 2 e 3 (de um total de 3 por missão) passaram a ser opcionais/bônus, para não bloquear uma equipe que só conseguiu levantar 1 problema dentro do tempo da aula.
- **Sanitização de todo texto exibido em tela** (`escapeHtml()`) — nomes de equipe, títulos/descrições de problemas, motivo da escolha, descobertas da investigação, nome do projeto, feedbacks de validação etc. são escapados antes de ir para o HTML, evitando que caracteres como `<`, `>`, `&`, `"` digitados por alunos quebrem o layout ou insiram HTML/script indevido na tela de outra pessoa (checklist de missões, resumo automático do projeto, tela de escolha de equipe).
- **Links do resumo do projeto validados** (`urlSegura()`) — links de MVP e Pitch exibidos como `<a href>` no resumo automático do projeto passam por uma validação simples de esquema (só permite `https://`/`http://` ou texto sem `:` — nesse caso adiciona `https://` automaticamente), bloqueando esquemas potencialmente perigosos como `javascript:`.
- **Limite de caracteres (`maxlength`)** em todos os campos de texto livre das missões, evitando textos excessivamente longos que quebrariam o layout do checklist/resumo.
- **Quantidade de entrevistados (Missão 7) sempre um número inteiro ≥ 0**, mesmo se o navegador enviar um valor inesperado.

### 🆕 Aplicação (área logada) — Módulo 3: Banco HACK

**`app/banco-hack.html`** (lógica em `js/app-banco-hack.js`) é a terceira ferramenta **funcional** da plataforma — o banco de desafios reais com **cálculo automático do Índice de Impacto HACK (IIH)**, implementado fielmente a partir da metodologia documentada em `iih.html`.

**Fluxo do aluno (5 etapas por desafio):**

| Etapa | O que o aluno faz | Dimensão do IIH avaliada |
|---|---|---|
| 1. Compreender | Lê a história do desafio e marca quais opções são causas **reais** do problema (misturadas com causas distratoras/armadilha) | Compreensão do Problema (10%) |
| 2. Escolher | Escolhe 1 entre as alternativas de solução cadastradas pelo professor (A, B, C...) | — (define a base do cálculo ODS/Planejamento/Ferramentas) |
| 3. Planejar | Escolhe **exatamente 5** das 10 Etapas de Planejamento fixas, as que considera mais importantes para a alternativa escolhida | Planejamento Estratégico (25%) |
| 4. Ferramentas | Escolhe **até 5** das 10 Ferramentas fixas mais adequadas | Ferramentas Adequadas (25%) |
| 5. Resultado | Vê o IIH final (0-100), o breakdown por dimensão, os ODS impactados e o selo conquistado | Impacto ODS (40%, calculado a partir da alternativa escolhida) |

**Motor de cálculo (fiel a `iih.html`):**

- `Pontuação ODS = (ODS Diretos × 3 + ODS Indiretos × 1) × Multiplicador de Profundidade` (Paliativa ×1, Sistêmica ×2, Transformadora ×3), limitado a 40 pontos.
- Selo: Transformadora → 💎 Diamante; Sistêmica com pontos ODS > 25 → 🥇 Ouro; Sistêmica com 10-25 → 🥈 Prata; demais casos → 🥉 Bronze.
- Planejamento/Ferramentas: o professor pré-classifica os 10 itens fixos de cada matriz como Essencial (5 pts) / Recomendada (3 pts) / Irrelevante (0 pts) **por alternativa**; nota = `(soma dos pontos escolhidos ÷ soma das 5 melhores pontuações possíveis) × 25`.
- Compreensão do Problema: cada causa real marcada soma +1, cada causa distratora marcada soma -1, normalizado pelo total de causas reais e escalado para 0-10 (mínimo 0).
- Todas as 4 notas são somadas para o IIH total (0-100) e persistidas em `hack_submissoes`.

**Funcionalidades da tela:**

- Reaproveita a mesma seleção de clube/equipe do Discovery (mesma chave `hh_equipe_discovery_id` no `localStorage` — a equipe escolhida vale para os dois módulos).
- **Lista de desafios** com filtro por categoria (chips) **e filtro por nível de dificuldade** (chips "Todos / Fácil / Médio / Difícil", nessa ordem, com ícone próprio por nível — 🌱 Fácil, 🔥 Médio, ⚡ Difícil), combináveis entre si. Cada card mostra um selo colorido de nível (verde/amarelo/vermelho, classe `.nivel-tag`) além da categoria, tempo estimado, e marcação "Resolvido" com o IIH já obtido para desafios já respondidos pela equipe.
- **🆕 Pontos HACK (gamificação/ranking) por nível de dificuldade** — ao concluir um desafio, a equipe ganha pontos **fixos** conforme o nível: **Fácil = 10, Médio = 20, Difícil = 30**. Os pontos são **independentes da nota do IIH** (não é IIH × multiplicador — decisão de produto para manter a pontuação do ranking simples e previsível para os alunos) e são concedidos **uma única vez por equipe+desafio**: reabrir/refazer um desafio já resolvido **não duplica pontos** nem cria uma segunda submissão (a submissão existente é atualizada via `PATCH`, preservando o valor original de `pontos_ganhos`). A tela de Resultado mostra um banner "+X Pontos HACK conquistados por esta equipe", e esses pontos alimentam o Ranking (interno e público) descrito abaixo.
- **Reabrir um desafio já resolvido** pula direto para a tela de Resultado (não deixa refazer e sobrescrever a nota sem querer — a submissão é buscada e exibida a partir do banco).
- Estados de carregamento, erro com nova tentativa, sem clube/sem equipe aprovada e escolha de equipe (mesmo padrão de robustez usado no Discovery), sanitização de texto exibido (`escapeHtml()`) e proteção contra envio duplicado no botão final "Calcular meu IIH".
- Acesso: `app/clube.html` ou `app/discovery.html` (links no topo/CTA de conclusão) → "Banco HACK", ou pela página institucional `banco-hack.html`.
- **70 desafios publicados até agora** (210 alternativas no total, todas com A/B/C — Paliativa/Sistêmica/Transformadora): "O Desafio da Dona Joana" (Sustentabilidade) — os mesmos números documentados no exemplo de `iih.html`, usados como validação do motor de cálculo — e mais 69 desafios adicionados em rodadas sucessivas:
  - **"O Mistério da Torneira que Nunca Fecha"** (Sustentabilidade, Médio, ODS 4/22/48 pts)
  - **"A Escola Desconectada"** (Tecnologia, Médio, ODS 4/14/33 pts)
  - **"O Robô Conselheiro"** (IA, Médio, ODS 4/16/36 pts)
  - **"O Bazar que Ninguém Vê"** (Empreendedorismo, Médio, ODS 5/18/45 pts)
  - **"O Silêncio que Adoece"** (categorizado como Ciências, já que "Saúde" não é uma opção oficial — Médio, ODS 4/16/42 pts)
  - **"A Biblioteca Esquecida"** (categorizado como Criatividade, já que "Educação" não é uma opção oficial — Médio, ODS 4/14/33 pts)
  - **"A Praça Abandonada"** (categorizado como Liderança, já que "Cidadania" não é uma opção oficial — Médio, ODS 4/18/48 pts)
  - **"As Memórias que o Tempo Apaga"** (categorizado como Criatividade, já que "Cultura" não é uma opção oficial — Médio, ODS 4/14/42 pts)
  - **"O Transporte que Divide"** (categorizado como Empreendedorismo, já que "Inovação Social" não é uma opção oficial — Médio, ODS 4/22/45 pts)
  - **"O Papel Amassado"** (Sustentabilidade, **Fácil**, categoria já oficial — ODS 4/4/14 pts)
  - **"O Som que Atrapalha"** (Tecnologia, **Fácil**, categoria já oficial — ODS 4/14/20 pts)
  - **"A Prova que Ninguém Entendeu"** (IA, **Fácil**, categoria já oficial — ODS 4/12/14 pts)
  - **"O Doce que Ninguém Compra"** (Empreendedorismo, **Fácil**, categoria já oficial — ODS 4/14/33 pts)
  - **"A Merenda que Sobra"** (categorizado como Ciências, já que "Saúde" não é uma opção oficial — **Fácil**, ODS 5/16/42 pts)
  - **"O Recreio Sem Graça"** (categorizado como Criatividade, já que "Educação" não é uma opção oficial — **Fácil**, ODS 4/14/16 pts)
  - **"O Muro que Ninguém Vê"** (categorizado como Liderança, já que "Cidadania" não é uma opção oficial — **Fácil**, ODS 4/14/33 pts)
  - **"A Festa Junina que Quase Acabou"** (categorizado como Criatividade, já que "Cultura" não é uma opção oficial — **Fácil**, ODS 4/14/33 pts)
  - **"O Caminho da Escola"** (categorizado como Empreendedorismo, já que "Inovação Social" não é uma opção oficial — **Fácil**, ODS 4/14/33 pts)
  - **"O Rio que o Progresso Escondeu"** (Sustentabilidade, categoria já oficial — **Difícil**, primeiro desafio de nível Difícil publicado no sistema, ODS 8/24/60 pts)
  - **"A Cidade no Escuro"** (Tecnologia, **Difícil**, categoria já oficial — ODS 5/16/51 pts)
  - **"Os Invisíveis da Cidade"** (IA, **Difícil**, categoria já oficial — ODS 7/24/75 pts)
  - **"O Talento que o Brasil Desperdiça"** (Empreendedorismo, **Difícil**, categoria já oficial — ODS 7/22/54 pts)
  - **"A Epidemia Silenciosa"** (categorizado como Ciências, já que "Saúde" não é uma opção oficial — **Difícil**, ODS 7/22/54 pts)
  - **"O Abismo Digital"** (categorizado como Criatividade, já que "Educação" não é uma opção oficial — **Difícil**, ODS 4/22/45 pts)
  - **"Os Vazios da Democracia"** (categorizado como Liderança, já que "Cidadania" não é uma opção oficial — **Difícil**, ODS 4/20/51 pts)
  - **"A Aldeia que a Cidade Engoliu"** (categorizado como Criatividade, já que "Cultura" não é uma opção oficial — **Difícil**, ODS 7/22/54 pts)
  - **"A Fome que os Dados Não Mostram"** (categorizado como Empreendedorismo, já que "Inovação Social" não é uma opção oficial — **Difícil**, ODS 7/22/66 pts)
  - **"A Luz que Ninguém Apaga"** (Sustentabilidade, categoria já oficial — **Fácil**, ODS 4/14/20 pts — início da 2ª rodada de desafios Fácil)
  - **"O Celular que Atrapalha"** (Tecnologia, categoria já oficial — **Fácil**, ODS 4/12/20 pts)
  - **"O Trabalho que Sumiu"** (IA, **Fácil**, categoria já oficial — ODS 4/14/16 pts)
  - **"A Hortinha da Escola"** (Empreendedorismo, **Fácil**, categoria já oficial — ODS 5/20/36 pts)
  - **"A Mochila Pesada"** (categorizado como Ciências, já que "Saúde" não é uma opção oficial — **Fácil**, ODS 4/14/16 pts)
  - **"O Reforço que Ninguém Pede"** (categorizado como Criatividade, já que "Educação" não é uma opção oficial — **Fácil**, ODS 4/14/16 pts)
  - **"A Calçada que Some"** (categorizado como Liderança, já que "Cidadania" não é uma opção oficial — **Fácil**, ODS 4/14/30 pts)
  - **"A Rádio Muda"** (categorizado como Criatividade, já que "Cultura" não é uma opção oficial — **Fácil**, ODS 4/14/30 pts)
  - **"O Uniforme que Não Serve Mais"** (categorizado como Empreendedorismo, já que "Inovação Social" não é uma opção oficial — **Fácil**, ODS 5/20/42 pts)
  - **"O Óleo que Contamina"** (Sustentabilidade, **Médio**, categoria já oficial — ODS 7/24/66 pts)
  - **"A Horta Automatizada"** (Tecnologia, **Médio**, categoria já oficial — ODS 7/26/57 pts)
  - **"O Diagnóstico que Demora"** (IA, **Médio**, categoria já oficial — ODS 7/22/42 pts)
  - **"A Loja Vazia"** (Empreendedorismo, **Médio**, categoria já oficial — ODS 7/22/48 pts)
  - **"O Ar que Adoece"** (categorizado como Ciências, já que "Saúde" não é uma opção oficial — **Médio**, ODS 7/26/57 pts)
  - **"O Professor que Falta"** (categorizado como Criatividade, já que "Educação" não é uma opção oficial — **Médio**, ODS 4/14/33 pts)
  - **"O Transporte Invisível"** (categorizado como Liderança, já que "Cidadania" não é uma opção oficial — **Médio**, ODS 7/22/51 pts)
  - **"A Língua que se Perde"** (categorizado como Criatividade, já que "Cultura" não é uma opção oficial — **Médio**, ODS 4/22/42 pts)
  - **"O Lixo que Vale Ouro"** (categorizado como Empreendedorismo, já que "Inovação Social" não é uma opção oficial — **Médio**, ODS 5/20/54 pts)
  - **"O Aquífero Ameaçado"** (Sustentabilidade, **Difícil**, categoria já oficial — ODS 7/28/69 pts)
  - **"A Cidade Desconectada"** (Tecnologia, **Difícil**, categoria já oficial — ODS 7/26/54 pts)
  - **"O Enem Desigual"** (IA, **Difícil**, categoria já oficial — ODS 4/22/45 pts)
  - **"A Quebrada que Empreende"** (Empreendedorismo, **Difícil**, categoria já oficial — ODS 7/34/63 pts)
  - **"O Sus que Espera"** (categorizado como Ciências, já que "Saúde" não é uma opção oficial — **Difícil**, ODS 7/26/51 pts)
  - **"O Ensino Médio que Ninguém Quer"** (categorizado como Criatividade, já que "Educação" não é uma opção oficial — **Difícil**, ODS 7/22/51 pts)
  - **"Os Filhos do Encarceramento"** (categorizado como Liderança, já que "Cidadania" não é uma opção oficial — **Difícil**, ODS 8/26/60 pts)
  - **"O Patrimônio que Desaba"** (categorizado como Criatividade, já que "Cultura" não é uma opção oficial — **Difícil**, ODS 7/26/54 pts)
  - **"Os Refugiados Invisíveis"** (categorizado como Empreendedorismo, já que "Inovação Social" não é uma opção oficial — **Difícil**, ODS 7/26/60 pts)
  - **"O Jardim que Morreu"** (Sustentabilidade, categoria já oficial — **Fácil**, ODS 4/20/42 pts — início da **3ª rodada** de desafios Fácil, enviada em formato completo/detalhado)
  - **"O Quadro que Não Apaga"** (Tecnologia, categoria já oficial — **Fácil**, ODS 4/14/30 pts)
  - **"O Trabalho Copiado"** (IA, **Fácil**, categoria já oficial — ODS 4/12/21 pts)
  - **"A Barraquinha Vazia"** (Empreendedorismo, **Fácil**, categoria já oficial — ODS 7/20/33 pts)
  - **"A Falta de Sono"** (categorizado como Ciências, já que "Saúde" não é uma opção oficial — **Fácil**, ODS 4/14/21 pts)
  - **"O Livro Perdido"** (categorizado como Criatividade, já que "Educação" não é uma opção oficial — **Fácil**, ODS 3/10/30 pts)
  - **"O Sinal que Não Abre"** (categorizado como Liderança, já que "Cidadania" não é uma opção oficial — **Fácil**, ODS 7/14/30 pts)
  - **"A Dança que Ninguém Vê"** (categorizado como Criatividade, já que "Cultura" não é uma opção oficial — **Fácil**, ODS 4/14/30 pts)
  - **"A Carteira que Pesa"** (categorizado como Empreendedorismo, já que "Inovação Social" não é uma opção oficial — **Fácil**, ODS 5/20/39 pts)

  🆕 **Desafios criados do zero pelo agente para as categorias Comunicação e Matemática** (que nunca haviam recebido nenhum desafio, já que toda categoria "livre" enviada pelo usuário sempre teve correspondência com uma das outras 7 categorias oficiais): 1 Fácil + 1 Médio + 1 Difícil em cada uma, para atender a meta mínima do template.
  - **"O Aviso que Ninguém Lê"** (Comunicação, **Fácil**, pontos ODS por alternativa A/B/C: 3/12/21 pts)
  - **"O Boletim que Não Chega"** (Comunicação, **Médio**, pontos ODS por alternativa A/B/C: 3/12/21 pts)
  - **"As Vozes Sem Microfone"** (Comunicação, **Difícil**, pontos ODS por alternativa A/B/C: 4/14/24 pts)
  - **"A Conta que Não Fecha"** (Matemática, **Fácil**, pontos ODS por alternativa A/B/C: 3/12/21 pts)
  - **"O Gráfico que Mente"** (Matemática, **Médio**, pontos ODS por alternativa A/B/C: 3/14/30 pts)
  - **"Os Números Escondidos"** (Matemática, **Difícil**, pontos ODS por alternativa A/B/C: 4/14/33 pts)

  Os 63 desafios enviados pelo usuário chegaram em formato livre (fora do template, em lotes de tamanho variável e ordem não organizada por categoria/nível) e foram adaptados/organizados por aqui: categoria e nome de ODS corrigidos para bater exatamente com as opções oficiais (incluindo o remapeamento de categorias sem correspondência direta — "Saúde"→Ciências, "Educação"→Criatividade, "Cidadania"→Liderança, "Cultura"→Criatividade, "Inovação Social"→Empreendedorismo, sinalizado ao usuário para eventual ajuste), as matrizes de Planejamento e Ferramentas informadas pelo usuário com itens personalizados (ex.: "Canva", "Google Forms", "App Inventor", "Kit de jardinagem", "ChatGPT", "Glide") foram **inteiramente remapeadas** para as 10 Etapas de Planejamento e 10 Ferramentas fixas oficiais do sistema (preservando a lógica de peso Essencial/Recomendada/Irrelevante pretendida originalmente para cada alternativa), causas reais/distratoras e justificativas de profundidade elaboradas a partir da história de cada desafio quando não informadas — os cálculos de pontuação ODS informados pelo usuário foram conferidos e mantidos exatamente em todos os casos (incluindo a correção de "Saúde e Bem-estar" para o texto oficial "Saúde e Bem-Estar", com E maiúsculo). Já os 6 desafios de Comunicação e Matemática foram **criados integralmente pelo agente** (história, causas, alternativas, ODS, planejamento e ferramentas), pois essas 2 categorias nunca receberam nenhum conteúdo do usuário. Testado via Playwright com clube/equipe de QA (criados e depois removidos) em todas as rodadas, incluindo a mais recente (QA Round 9): todos os 70 desafios aparecem corretamente na lista, filtráveis por categoria e nível, sem erros de console.

  ✅ **Os 9 desafios de nível Fácil originalmente prometidos pelo usuário já foram todos entregues e publicados**: Papel Amassado, Som que Atrapalha, Prova que Ninguém Entendeu, Doce que Ninguém Compra, Merenda que Sobra, Recreio Sem Graça, Muro que Ninguém Vê, Festa Junina que Quase Acabou e Caminho da Escola.

  ✅ **Os 9 desafios de nível Difícil da 1ª rodada estão completos** (uma por categoria, considerando as substituições já aplicadas): Sustentabilidade/"O Rio que o Progresso Escondeu", Tecnologia/"A Cidade no Escuro", IA/"Os Invisíveis da Cidade", Empreendedorismo/"O Talento que o Brasil Desperdiça", Saúde→Ciências/"A Epidemia Silenciosa", Educação→Criatividade/"O Abismo Digital", Cidadania→Liderança/"Os Vazios da Democracia", Cultura→Criatividade/"A Aldeia que a Cidade Engoliu" e Inovação Social→Empreendedorismo/"A Fome que os Dados Não Mostram".

  ✅ **A 2ª rodada completa (Fácil + Médio + Difícil, 9 categorias cada = 27 desafios) foi entregue e publicada nesta atualização**, incluindo os 2 desafios Fácil que haviam ficado pendentes de uma rodada anterior (Luz que Ninguém Apaga, Celular que Atrapalha) mais os 7 Fácil, 9 Médio e 9 Difícil restantes das 9 categorias.

  ✅ **A 3ª rodada de desafios Fácil está completa** — todas as 9 categorias foram recebidas e publicadas, cobrindo Sustentabilidade/"O Jardim que Morreu", Tecnologia/"O Quadro que Não Apaga", IA/"O Trabalho Copiado", Empreendedorismo/"A Barraquinha Vazia", Saúde→Ciências/"A Falta de Sono", Educação→Criatividade/"O Livro Perdido", Cidadania→Liderança/"O Sinal que Não Abre", Cultura→Criatividade/"A Dança que Ninguém Vê" e Inovação Social→Empreendedorismo/"A Carteira que Pesa". Esta rodada foi enviada em formato completo/detalhado (com Matriz de Planejamento e Matriz de Ferramentas item a item), diferente do formato condensado usado em rodadas anteriores.

  📊 **Nota de transparência sobre contagem**: em determinado ponto do envio, o usuário mencionou "agora você tem 54 desafios" (estimativa própria, baseada em 9 categorias × 3 níveis × 2 rodadas). Esse número não foi usado como referência — a contagem real é sempre verificada diretamente via API. O total real e verificado após todas as rodadas recebidas até agora é **64 desafios / 192 alternativas**.

  ✅ **Lacuna de categoria corrigida**: uma verificação da distribuição real de desafios por categoria/nível revelou que **Comunicação** e **Matemática** nunca haviam recebido nenhum desafio (todo conteúdo do usuário sempre mapeava para uma das outras 7 categorias oficiais). A pedido do usuário, o agente criou do zero 1 Fácil + 1 Médio + 1 Difícil para cada uma dessas 2 categorias, garantindo que as 9 categorias oficiais tenham agora pelo menos 1 desafio de cada nível — meta mínima do template atingida em todas as categorias. Vale notar que **Empreendedorismo** e **Criatividade** ficaram com bem mais desafios que as demais (14 cada, vs. 7-8 nas outras categorias já preenchidas), efeito colateral do remapeamento de múltiplas categorias "livres" do usuário para essas duas — isso não foi corrigido nesta rodada (ver "próximos passos").

  ⚠️ **Processo em andamento**: o usuário sinalizou que ainda há grande volume de conteúdo (~150 páginas) sendo enviado em lotes, possivelmente incluindo desafios de nível Médio/Difícil para completar a 3ª rodada, ou rodadas adicionais ainda não anunciadas. O agente continuará organizando, corrigindo e publicando cada novo lote progressivamente, e fará uma consolidação final do README quando o usuário confirmar que todo o conteúdo foi enviado.
- 📄 **Como cadastrar novos desafios**: consulte **`INSTRUCOES-NOVOS-DESAFIOS-BANCO-HACK.md`** — template completo com os nomes exatos de campos, opções válidas e as 3 listas fixas (17 ODS oficiais, 10 Etapas de Planejamento, 10 Ferramentas) que precisam ser copiadas literalmente para o motor de cálculo reconhecer as respostas corretamente.
- 🎯 **Meta de distribuição por nível**: a recomendação registrada no template é ter **no mínimo 3 desafios por categoria** (1 Fácil + 1 Médio + 1 Difícil), para que qualquer equipe encontre um desafio adequado ao seu nível em qualquer uma das 9 categorias. O filtro por nível na tela do aluno já está pronto para receber esse crescimento (testado com dados fictícios via Playwright — filtro isolando corretamente por nível, ordem Fácil→Médio→Difícil, selo colorido aplicado corretamente).

### 🆕 Aplicação — Módulo 4: Ranking (interno + público)

O **Ranking** reúne, para cada equipe, a soma de **Pontos de Impacto** (ganhos nas 10 missões da Jornada Discovery, campo `projetos_discovery.pontos_impacto`) + **Pontos HACK** (ganhos nos desafios do Banco HACK, soma de `hack_submissoes.pontos_ganhos`) = **pontuação total da equipe**. O cálculo é feito 100% no cliente, a partir dos dados já existentes nessas duas tabelas — nenhuma tabela nova foi criada só para o ranking.

Existem **dois lugares** para ver o ranking, com escopos diferentes:

1. **Ranking interno** (`app/clube.html`, aba "Ranking", requer estar com um clube ativo) — compara **apenas as equipes do mesmo clube**, para o professor mentor acompanhar a evolução das equipes que ele mesmo gerencia.
2. **🆕 Ranking público** (`ranking.html`, nova página institucional com aba própria no menu principal) — **sem necessidade de login**, mostra o ranking de **todas** as equipes e escolas cadastradas na plataforma, em duas abas:
   - **Ranking de Equipes** — todas as equipes de todos os clubes, ordenadas pelo total de pontos, com o nome da escola/clube de cada uma.
   - **Ranking de Escolas** — os pontos de todas as equipes de um mesmo clube (escola) somados, mostrando o total da escola e quantas equipes ela tem.
   - Ambas as abas mostram, por linha: posição (🏆/🥈/🥉/nº), identidade visual (brasão da equipe ou logo da escola), nome, e o detalhamento **X Discovery · Y Banco HACK = Total**.

Ambos os rankings foram testados via Playwright com dados fictícios (3 equipes em 2 clubes distintos, com pontos diferentes de Discovery e Banco HACK): a ordenação, os totais por equipe e a agregação por escola bateram exatamente com o esperado, e o ranking interno mostrou corretamente **apenas** as equipes do clube ativo (isolamento confirmado).

## 🔗 Mapa de páginas (rotas)

| Rota | Descrição |
|---|---|
| `/index.html` | Home institucional |
| `/clube.html` | Criando o Clube (institucional) |
| `/discovery.html` | Jornada HACK Discovery |
| `/builder.html` | Jornada HACK Builder |
| `/banco-hack.html` | Banco HACK |
| `/challenges.html` | HACK Challenges |
| `/festival.html` | HACK Festival |
| `/festival-resultados.html` | **🆕 Resultados públicos do HACK Festival (módulo funcional, sem login)** — finalistas e vencedores de todo o Ecossistema HACK BRASIL, com estatísticas e link para o pitch de cada projeto |
| `/iih.html` | Índice de Impacto HACK — metodologia completa |
| `/ranking.html` | **Ranking público (módulo funcional, sem login)** — Ranking de Equipes e Ranking de Escolas, somando Pontos de Impacto (Discovery) + Pontos HACK (Banco HACK) de toda a plataforma |
| `/ecossistema.html` | Ecossistema HACK BRASIL |
| `/contato.html` | Contato |
| `/privacidade.html` | Política de Privacidade |
| `/termos.html` | Termos de Uso |
| `/app/login.html` | Portal de acesso à área logada |
| `/app/clube.html` | **Painel do Clube (módulo funcional)** — clube, professores mentores, estudantes, equipes, exportar dados, gerar link público |
| `/app/clube-publico.html?id={clube_id}` | **Ficha pública do clube (somente leitura, sem login)** — para compartilhar com pessoas externas (ex.: inscrição em HACK Festival, parceiros); inclui botão "Imprimir / Salvar PDF" |
| `/app/discovery.html` | **Jornada HACK Discovery (módulo funcional)** — as 10 missões (Explorar → Observar → Escolher → Investigar → Imaginar & Construir → Validar → Comunicar & Apresentar), com Pontos de Impacto e projeto montado automaticamente |
| `/app/banco-hack.html` | **Banco HACK (módulo funcional)** — banco de desafios reais com fluxo de 5 etapas (Compreender → Escolher → Planejar → Ferramentas → Resultado), cálculo automático real do IIH (0-100) com selo Bronze/Prata/Ouro/Diamante, e Pontos HACK por nível de dificuldade (Fácil +10 / Médio +20 / Difícil +30) |

## 🚧 Não implementado ainda (próximas etapas)

1. **Criando o Clube** — ✅ concluído (`app/clube.html`), incluindo o registro do Perfil HACK (feito via link para a plataforma externa **app.hackschool.app** + seleção manual do resultado pelo professor — ver seção de Dados abaixo), exportação de dados e link público compartilhável (`app/clube-publico.html`).
2. **Jornada HACK Discovery** — ✅ concluído (`app/discovery.html`), com as 10 missões, Pontos de Impacto e projeto montado automaticamente. O IIH desse projeto específico ainda não é calculado automaticamente ao final da Missão 10 (o motor de cálculo já existe no Banco HACK, mas ainda não foi conectado ao projeto do Discovery — ver item 9).
3. **Dashboard** — visão geral da equipe (IIH, missão atual, histórico) — ainda não iniciado (o ranking em si já existe, ver item 11).
4. **Gestão de Projetos** — página própria (ideias, MVP, pesquisas, canvas, validação) — ainda não iniciado (parcialmente coberto pelo resumo automático dentro do Discovery).
5. **Jornada HACK Builder** — trilhas interativas com desbloqueio de competências — ainda não iniciado.
6. **Banco HACK** — ✅ concluído (`app/banco-hack.html`), com fluxo completo de 5 etapas (história → causas reais → alternativa → planejamento → ferramentas → resultado do IIH), cálculo automático real das 4 dimensões + selo, filtro por nível de dificuldade e Pontos HACK (10/20/30) por nível. Já há **70 desafios publicados** (210 alternativas), cobrindo as 9 categorias oficiais em pelo menos 1 desafio por nível de dificuldade (Fácil/Médio/Difícil); a biblioteca continua crescendo com novos lotes enviados pelo usuário (ver `INSTRUCOES-NOVOS-DESAFIOS-BANCO-HACK.md`).
7. **HACK Challenges** — listagem real de desafios de parceiros, candidatura de equipes.
8. **HACK Festival** — inscrição real de projetos, avaliação, emissão de certificado (o ranking de escolas/equipes, especificamente, já está resolvido pela página `ranking.html` — ver item 11).
9. **Índice de Impacto HACK (IIH) — conectar o motor ao projeto do Discovery** — o motor de cálculo já existe e funciona no Banco HACK (4 dimensões, selos, persistência em `hack_submissoes`) e também já foi conectado à Avaliação do Professor Mentor no Discovery. Falta apenas: um painel de histórico/radar de competências mais detalhado por equipe (ver item 10).
10. **Perfil da Equipe** — página agregadora de tudo (Discovery + Banco HACK + IIH consolidado + histórico de evolução no ranking).
11. **Ranking** — ✅ concluído: ranking interno por clube (`app/clube.html`, aba "Ranking") e ranking público de equipes e escolas (`ranking.html`), somando Pontos de Impacto (Discovery) + Pontos HACK (Banco HACK). Possível evolução futura: filtros por período/temporada, e destaque para a equipe/escola do próprio usuário quando logado.

## 🗂 Estrutura de arquivos

```
index.html
clube.html
discovery.html
builder.html
banco-hack.html
challenges.html
festival.html
festival-resultados.html     (🆕 Resultados públicos do HACK Festival — finalistas e vencedores, sem login)
iih.html                     (metodologia completa do IIH — explicativa)
ranking.html                 (Ranking público — módulo funcional, sem login)
ecossistema.html
contato.html
privacidade.html
termos.html
app/
  ├── login.html              (portal de acesso à área logada)
  ├── clube.html               (✅ Painel do Clube — módulo funcional, com 🆕 aba Ranking interno)
  ├── clube-publico.html       (ficha pública do clube, somente leitura, sem login, com botão de impressão)
  ├── discovery.html           (✅ Jornada HACK Discovery — módulo funcional, as 10 missões)
  └── banco-hack.html          (Banco HACK — módulo funcional, 5 etapas + cálculo real do IIH + 🆕 Pontos HACK por nível)
includes/
  ├── header.html        (menu: Início | Clube | Discovery | Builder | Banco HACK | Challenges | Festival | Índice IIH | 🆕 Ranking)
  └── footer.html
css/
  └── style.css        (design system preto/amarelo; badges, botões, timeline, cards; + componentes de app/formulário + Banco HACK)
js/
  ├── common.js              (header/footer dinâmico, menu mobile, contadores animados — páginas institucionais)
  ├── app-clube.js           (CRUD completo do Painel do Clube via Table API + exportar/gerar link público + 🆕 cálculo do ranking interno)
  ├── app-clube-publico.js   (leitura somente da ficha pública do clube, a partir do `?id=` na URL)
  ├── app-discovery.js       (lógica completa das 10 missões da Jornada Discovery, Pontos de Impacto, projeto automático)
  ├── app-banco-hack.js      (motor de cálculo do IIH + fluxo de 5 etapas do Banco HACK + Pontos HACK por nível)
  ├── app-ranking.js         (busca todos os clubes/equipes/projetos/submissões e monta o Ranking de Equipes e de Escolas, sem login)
  ├── app-festival.js        (inscrição/status do HACK Festival dentro da área logada)
  └── app-festival-resultados.js  (🆕 busca finalistas/vencedores de todos os clubes/equipes e monta a página pública de resultados do Festival, sem login)
INSTRUCOES-NOVOS-DESAFIOS-BANCO-HACK.md  (template de cadastro de novos desafios, para uso fora do editor)
images/
  ├── logo-hackhub.png         (logo oficial — header, footer, login, favicon)
  ├── hero-hackhub-capa-v4.jpg (🆕 foto de capa da home — logo do raio 100% consistente em todas as camisetas)
  ├── hero-clube-v4.jpg        (🆕 foto temática — Criando o Clube)
  ├── hero-discovery-v4.jpg    (🆕 foto temática — Jornada Discovery)
  ├── hero-builder-v4.jpg      (🆕 foto temática — Jornada Builder)
  ├── hero-banco-hack-v4.jpg   (🆕 foto temática — Banco HACK)
  ├── hero-challenges-v4.jpg   (🆕 foto temática — HACK Challenges)
  ├── hero-festival-v4.jpg     (🆕 foto temática — HACK Festival + Resultados do Festival)
  ├── hero-iih-v4.jpg          (🆕 foto temática — Índice IIH)
  ├── hero-ranking-v4.jpg      (🆕 foto temática — Ranking público)
  ├── hero-ecossistema-v4.jpg  (🆕 foto temática — Ecossistema HACK BRASIL)
  └── hero-evolucao-v3.jpg     (🆕 foto de fundo da seção "Do treinamento ao impacto real", home)
```

> ⚠️ **Nota técnica sobre os sufixos "-v2"/"-v3"/"-v4"**: os arquivos são renomeados a cada rodada de refinamento (`hero-*.jpg` → `hero-*-v2.jpg` → `hero-*-v3.jpg` → `hero-*-v4.jpg`) para forçar o navegador a descartar o cache de versões antigas das fotos e carregar sempre a versão mais recente. Todas as páginas HTML já foram atualizadas para referenciar os nomes mais atuais; versões antigas são excluídas do repositório após cada atualização.
>
> 🆕 **Correção de consistência de marca (4ª versão das fotos)**: uma verificação minuciosa (imagem por imagem, com análise de IA) revelou que várias fotos da rodada anterior tinham um **crachá/logo inconsistente ou incorreto** nas camisetas (brasões de escola, emblemas circulares, raios sem contorno, ou até logos com as cores invertidas) em vez do logo oficial da marca. Isso foi corrigido regerando **todas as 11 fotos** com um prompt reforçado que fixa exatamente o desenho oficial: **crachá preto arredondado com fina borda amarela e um raio amarelo sólido centralizado**, nunca invertido (nunca fundo amarelo com raio preto) e nunca substituído por outro símbolo — inclusive reforçando que a cor de fundo do crachá (preto) nunca deve se misturar ou inverter com a cor da camiseta (mesmo em camisetas amarelas). Cada uma das 11 fotos foi verificada individualmente por análise de imagem antes de ser aplicada ao site; a foto do Festival precisou de duas regenerações extras até o crachá de todos os alunos ficar 100% idêntico. Arquivos atualizados para o sufixo `-v4` (`-v3` no caso da foto "Do treinamento ao impacto real"); versões antigas removidas do repositório.

> 🆕 **Fotos institucionais geradas nesta rodada**: todas as páginas institucionais (home + cada etapa da Jornada HACK + Índice IIH + Ranking + Ecossistema + Resultados do Festival) agora têm uma **foto temática de capa** no Hero (overlay com opacidade 20% sobre o `.gradient-hero`, mesmo padrão já usado desde o início do projeto), no estilo documental/candid usado como referência: estudantes e mentores reais, ambientes escolares/hubs de inovação bem iluminados, com a marca HACK HUB (camisetas, crachás, banners, telas) visível em cada cena. A foto da home é um destaque maior — grupo diverso e vibrante celebrando junto, usada tanto no fundo do Hero quanto na imagem lateral. As fotos antigas (`hero-equipe-hackathon.jpg`, `sobre-mentoria-equipe.jpg`, `festival-premiacao.jpg`, `hack-challenges-pitch.jpg`) foram substituídas e removidas.
>
> 🔧 **Refinamento visual das fotos (2ª versão)**: a pedido do usuário, todas as 10 fotos foram regeradas com uniformização de identidade visual: **estudantes** vestem polo **amarela** bem desenhada com gola/punho em preto e o logo (escudo + raio + "HACK HUB") no peito; **mentores/professores** vestem polo **preta** imponente com o raio em amarelo em destaque no peito — no mesmo espírito de referência de mockups de camisetas oficiais fornecidos pelo usuário.
>
> 🆕 **Refinamento visual das fotos (3ª versão)**: a pedido do usuário, os banners/pôsteres ao fundo de cada foto foram simplificados novamente — removido o ícone/escudo/raio que competia visualmente com o texto, deixando **apenas a palavra "HACK HUB" escrita em destaque**, grande e legível, sem nenhum símbolo adicional. Além disso, foi adicionada uma nova foto (`hero-evolucao-v2.jpg`) na seção "Do treinamento ao impacto real" da home, substituindo o fundo preto sólido por uma cena temática com overlay em gradiente escuro para manter a legibilidade do texto. Também foi corrigida uma barra de rolagem amarela visível no menu de navegação do header (classe `.no-scrollbar` adicionada ao `<nav>` desktop, escondendo a scrollbar horizontal sem alterar a funcionalidade).
>
> 🆕 **Marca do HACK HUB simplificada para wordmark de texto puro**: a pedido do usuário, o **ícone/emblema** que acompanhava o texto "HACK HUB" no header, footer, topbar de todas as páginas do app (`app/*.html`) e na página de login foi **removido**, deixando **apenas o texto "HACK HUB®"** como identidade de marca visível em toda a navegação — mais limpo e sem risco de conflito visual com outros elementos. O arquivo `images/logo-hackhub.png` não foi excluído do repositório: ele continua em uso como **favicon** (ícone da aba do navegador) em todas as páginas.

## 🎨 Design System

- **Cores**: Preto `#101010` / Amarelo `#FFC800` (dark `#E0A800`) / Branco, com cinzas Tailwind (`slate-50/600/900`) para textos e fundos neutros.
- **Fonte**: Poppins (Google Fonts), pesos 300–800.
- **Base técnica**: Tailwind CSS via CDN + Font Awesome 6.4 + `css/style.css` customizado.
- **Componentes institucionais**: `.btn-primary`, `.btn-accent`, `.btn-outline`, `.badge-yellow`, `.badge-dark`, `.journey-card`, `.journey-timeline`, `.iih-chip`, `.gradient-hero`.
- **Componentes da metodologia IIH**: `.dim-bar-track`/`.dim-bar-fill`, `.formula-box`, `.ods-tag`/`.ods-dot`, `.depth-card`/`.depth-highlight`, `.tier-card` (+ `.tier-bronze/silver/gold/diamond`, `.tier-medal`), `.result-mockup`/`.result-mockup-header`/`.dim-result-row`, `.pitch-quote`.
- **Componentes de aplicação/formulário** (usados no Painel do Clube): `.form-label`, `.form-input`/`.form-select`/`.form-textarea`, `.app-card`, `.avatar-img` (foto ou iniciais), `.team-strip` (faixa de cor no topo do card da equipe), `.chip-btn` (botão-pílula de ação), `.member-row` (linha de integrante).
- **Componentes da ficha pública** (usados em `app/clube-publico.html`): `.social-pill` (pílula clicável de rede social — Instagram/LinkedIn), `.public-hero-card` (hero preto/amarelo da ficha pública, mesma linguagem visual do `.gradient-hero`); regras `@media print` + classe `.no-print` para o botão "Imprimir / Salvar PDF".
- **Componentes da Jornada Discovery** (usados em `app/discovery.html`): `.missao-row` (+ `.is-done`/`.is-current`/`.is-locked`), `.missao-icon`, `.problema-block` (bloco de registro de problema nas Missões 2–5), `.ods-checkbox` (seleção dos 17 ODS na Missão 6); reaproveita `.progress-track`/`.progress-fill` (com nova variante `.on-dark` para uso sobre o `.gradient-hero`).
- **Componentes do Banco HACK** (usados em `app/banco-hack.html`): `.desafio-card` (+ `.is-resolvido`), `.etapa-dots`/`.etapa-dot` (+ `.is-done`/`.is-current`)/`.etapa-line`, `.opcao-selecionavel` (+ `.is-checked`), `.nivel-tag` (+ `.nivel-facil`/`.nivel-medio`/`.nivel-dificil` — selo colorido de dificuldade, verde/amarelo/vermelho); reaproveita os componentes da metodologia IIH (`.result-mockup`, `.ods-tag`, `.tier-medal` etc.) na tela de Resultado.
- **🆕 Componentes do Ranking** (usados na aba "Ranking" de `app/clube.html` e em `ranking.html`): reaproveita `.app-card`, `.avatar-img` e as cores de `CORES_EQUIPE` para montar cada linha do ranking (posição + ícone de medalha inline, sem classe CSS dedicada nova); em `ranking.html`, as abas "Ranking de Equipes"/"Ranking de Escolas" usam a nova classe `.ranking-tab-btn` (+ `.active`), com o mesmo padrão visual de sublinhado amarelo das demais abas do site.
- **Padrão de página de módulo institucional**: Hero temático (badge "Etapa N") → Objetivo → Ações da etapa → Resultado esperado → CTA para a próxima etapa.

## 📦 Dados / Armazenamento

O módulo **Painel do Clube** já usa 4 tabelas reais via Table API:

| Tabela | Campos principais |
|---|---|
| `hack_clubes` | `nome_clube`, `escola`, `cidade`, `estado`, `logo_url`, `descricao`, **`instagram`** (opcional), `status` (Ativo/Pendente) |
| `professores_mentores` | `clube_id`, `nome`, `email`, `telefone`, `foto_url`, `area_atuacao`, **`linkedin`** (opcional), `bio` |
| `estudantes` | `clube_id`, `equipe_id`, `nome`, `email`, `foto_url`, `turma_serie`, **`instagram`** (opcional), `perfil_hack` (texto livre/opcional — resultado do teste feito em app.hackschool.app, selecionado manualmente pelo professor), `funcao_equipe`, `status_convite` |
| `equipes` | `clube_id`, `nome_equipe`, `lema`, `cor_tema`, `brasao_url`, `status` (Em formação/Aprovada) |

O clube "ativo" no navegador do professor fica salvo em `localStorage` (`hh_clube_ativo_id`), com opção de "Trocar clube" no topo do painel.

**Exportar e compartilhar**: nenhuma tabela nova foi criada para isso — a exportação (`.txt`/`.json`) é montada 100% no cliente a partir dos dados já carregados (`js/app-clube.js` → `buildClubeExportSummary()` / `buildClubeExportJSON()` + `downloadFile()`), e o link público (`app/clube-publico.html?id={clube_id}`) apenas lê as mesmas 4 tabelas — filtradas pelo `id` do clube na URL — sem exigir autenticação, através de `js/app-clube-publico.js`. A impressão/PDF usa `window.print()` nativo do navegador, com regras `@media print` dedicadas.

**🆕 Jornada HACK Discovery** já usa 1 tabela real via Table API:

| Tabela | Campos principais |
|---|---|
| `projetos_discovery` | `clube_id`, `equipe_id`, `missao_atual`, `pontos_impacto`, `missoes_concluidas` (array), `m1_entendeu_metodologia`, `m2_problemas_escola`/`m3_problemas_comunidade`/`m4_problemas_municipio`/`m5_problemas_empresa` (arrays de `{titulo, descricao, afetados, foto_url}`), `m6_problema_escolhido`, `m6_motivo_escolha`, `m6_ods_selecionados` (array, as 17 opções oficiais de ODS), `m7_quem_sofre`, `m7_entrevistou`, `m7_quantidade_entrevistados`, `m7_descobertas`, `m8_nome_projeto`, `m8_descricao_solucao`, `m8_anexo_url`, `m8_mvp_url`, `m9_quem_testou`, `m9_o_que_disseram`, `m9_o_que_mudou`, `m10_pitch_url`, `status` (Não iniciado/Em andamento/Concluído) |

A equipe ativa na Jornada Discovery (quando o clube tem mais de uma equipe aprovada) fica salva em `localStorage` (`hh_equipe_discovery_id`), com opção de "Trocar equipe" no topo.

**🆕 Banco HACK** já usa 3 tabelas reais via Table API:

| Tabela | Campos principais |
|---|---|
| `hack_desafios` | `titulo`, `categoria` (Criatividade/Tecnologia/IA/Comunicação/Liderança/Empreendedorismo/Matemática/Ciências/Sustentabilidade), `historia`, `tempo_estimado`, `nivel` (Fácil/Médio/Difícil), `status` (Publicado/Rascunho), `ordem`, `causas_reais` (array), `causas_distratoras` (array) |
| `hack_alternativas` | `desafio_id`, `letra`, `texto`, `ods_diretos` (array, 3 pts cada), `ods_indiretos` (array, 1 pt cada), `profundidade` (Paliativa/Sistêmica/Transformadora), `justificativa_profundidade`, `planejamento_pesos` (array de `{etapa, classificacao}` — 10 itens fixos), `ferramentas_pesos` (array de `{ferramenta, classificacao}` — 10 itens fixos) |
| `hack_submissoes` | `desafio_id`, `equipe_id`, `clube_id`, `alternativa_id`, `causas_selecionadas` (array), `planejamento_selecionado` (array), `ferramentas_selecionadas` (array), `nota_compreensao`, `nota_ods`, `nota_planejamento`, `nota_ferramentas`, `iih_total`, `selo` (Bronze/Prata/Ouro/Diamante) |

A equipe ativa no Banco HACK reaproveita a **mesma chave** `hh_equipe_discovery_id` do Discovery — não existe uma chave separada, então a equipe escolhida em um módulo já vale automaticamente no outro. As 17 opções oficiais de ODS e as 2 listas fixas (10 Etapas de Planejamento, 10 Ferramentas) usadas na matriz de correlação estão documentadas por extenso em **`INSTRUCOES-NOVOS-DESAFIOS-BANCO-HACK.md`** — o cadastro de novos desafios deve usar esses textos exatamente como estão ali, pois o motor de cálculo (`js/app-banco-hack.js`) compara por igualdade exata de string.

**🆕 Ranking** não cria nenhuma tabela nova — tanto o ranking interno (`app/clube.html`) quanto o público (`ranking.html`) leem diretamente as tabelas já existentes:

| Tabela usada | Campo lido para o ranking |
|---|---|
| `hack_clubes` | `nome_clube`, `escola`, `cidade`, `estado`, `logo_url` (identidade da "escola" no Ranking de Escolas) |
| `equipes` | `nome_equipe`, `clube_id`, `cor_tema`, `brasao_url` (identidade da equipe no Ranking de Equipes) |
| `projetos_discovery` | soma de `pontos_impacto` por `equipe_id` |
| `hack_submissoes` | soma de `pontos_ganhos` por `equipe_id` (novos campos **`nivel_desafio`** e **`pontos_ganhos`**, adicionados nesta rodada especificamente para o Ranking) |

No ranking interno (`js/app-clube.js` → `pontosDaEquipe()`/`renderRanking()`), os dados já vêm filtrados pelo clube ativo (mesma lógica de `loadAllData()`). No ranking público (`js/app-ranking.js`), a função `apiAll()` pagina a tabela inteira (sem filtro de clube) para montar tanto o Ranking de Equipes quanto o Ranking de Escolas (agregação por `clube_id`) — por isso é a única página do site que não depende de nenhum clube/equipe ativa no `localStorage`.

Para as próximas etapas serão criadas: `perfis_hack_respostas` (teste comportamental).

### 🆕 Aplicação (área logada) — Módulo 3: Jornada HACK Builder

**`app/builder.html`** (lógica em `js/app-builder.js`) — 5 trilhas de competências (Inovação & Criatividade, Tecnologia, Inteligência Artificial, Empreendedorismo, Gestão de Projetos), cada uma com 4 competências. Dentro de cada trilha, as competências são desbloqueadas **em sequência** (só é possível abrir a competência N depois de concluir a N-1). Cada competência tem uma pergunta/reflexão para a equipe responder (textarea) + link de evidência opcional; ao concluir, a equipe ganha **Pontos Builder** (20 ou 30 pontos, conforme a competência). Reaproveita a mesma seleção de clube/equipe (`hh_clube_ativo_id` / `hh_equipe_discovery_id`) dos demais módulos. Tabela: `builder_conclusoes`.

### 🆕 Aplicação (área logada) — Módulo 4: Dashboard da Equipe

**`app/dashboard.html`** (lógica em `js/app-dashboard.js`) — visão geral e agregada de uma equipe: pontos de **Discovery + Banco HACK + Builder** (e total), **posição no ranking geral** do Ecossistema HACK BRASIL (mesma lógica de soma usada em `ranking.html`), progresso e missão em andamento da Jornada Discovery, **IIH real** (nota + selo) quando já avaliado pelo mentor, e resumo de quantos desafios do Banco HACK e quantas competências do Builder já foram concluídos, com atalhos para continuar em cada módulo.

### 🆕 Aplicação (área logada) — Módulo 5: HACK Challenges + Painel da Empresa

**`app/challenges.html`** (lógica em `js/app-challenges.js`, lado das equipes) — mural de desafios reais publicados por empresas parceiras, com filtro por categoria (Tecnologia, Sustentabilidade, Marketing, Operações, Produto, Comunicação, Outro). Cada card mostra título, empresa, valor da premiação e prazo. A equipe pode **aceitar** um desafio, depois **enviar a proposta** (texto da solução + link de pitch/protótipo opcional), e acompanhar a **avaliação** (nota 0-10 + feedback) e o **pagamento** da premiação quando aprovada. Aba "Minhas propostas" mostra o histórico completo (inclusive desafios já encerrados).

**`app/empresa.html`** (lógica em `js/app-empresa.js`, lado das empresas) — painel de confiança (sem login/senha, no mesmo espírito da Avaliação do Professor Mentor do Discovery): a empresa se cadastra ou seleciona seu perfil já existente, publica novos desafios (título, descrição, categoria, valor da premiação, prazo), acompanha as propostas recebidas por desafio e pode **aprovar/rejeitar** (com nota e feedback) e **registrar o pagamento** da premiação às equipes aprovadas. Também pode encerrar um desafio (deixa de aparecer no mural).

Ciclo de status da proposta (`hack_challenges_propostas.status`): `Aceito → Proposta enviada → Aprovada/Rejeitada → Paga`. Tabelas: `empresas_parceiras`, `hack_challenges_desafios`, `hack_challenges_propostas`.

### 🆕 Aplicação (área logada) — Módulo 6: HACK Festival

**`app/festival.html`** (lógica em `js/app-festival.js`) — a equipe só pode se inscrever depois de **concluir as 10 missões** da Jornada Discovery (senão vê uma tela convidando a terminar o Discovery primeiro). Ao inscrever, o link do pitch final vem pré-preenchido a partir da Missão 10 (se existir) e pode ser editado. A equipe acompanha o status da inscrição numa tela festiva com cores/emoji diferentes: 📋 **Inscrito** → **Avaliado** (nota 0-10 + feedback da apresentação) → 🏅 **Finalista** → 🏆 **Vencedor**. Tabela: `festival_inscricoes` (com referência a `projetos_discovery`).

✅ **Retestado via Playwright** nesta rodada (com dados de QA criados e depois removidos): fluxo de inscrição (`Inscrito`, com formulário pré-preenchido a partir da Missão 10 e botão de editar pitch visível) e a tela de status `Vencedor` (hero dourado, card de avaliação com nota/feedback, botão de editar pitch corretamente escondido) foram confirmados funcionando ponta a ponta. Como `Avaliado`/`Finalista` compartilham exatamente o mesmo mecanismo de renderização (`STATUS_HERO[insc.status]`), essa cobertura foi considerada suficiente.

**🆕 `festival-resultados.html`** — nova página **pública, sem login**, no mesmo espírito de `ranking.html`: mostra os projetos com status **Vencedor** (cards em destaque, hero dourado) e **Finalista** (lista) de todo o Ecossistema HACK BRASIL, com estatísticas (total de inscritos, total de finalistas+vencedores, total de vencedores) e link para o pitch de cada projeto. Lógica em `js/app-festival-resultados.js` (mesmo padrão `apiAll()` de `js/app-ranking.js`, juntando `festival_inscricoes` + `projetos_discovery` + `equipes` + `hack_clubes`). O botão "Ver resultados" na topbar do app e o CTA final de `app/festival.html` (antes apontando para o Dashboard como solução temporária) agora apontam para essa página; ela também foi adicionada ao footer institucional (`includes/footer.html`) e ao CTA final de `festival.html` institucional. Testada via Playwright com dados de QA (1 vencedor + 1 finalista), confirmando estatísticas e renderização corretas, depois removidos.

## 🚀 Deploy

Para publicar o site, use a aba **Publish** do editor.

## 📌 Próximo passo recomendado

1. **Continuar crescendo a biblioteca de desafios do Banco HACK** — hoje já há **70 desafios publicados / 210 alternativas**, com as 9 categorias oficiais atendendo a meta mínima de 1 Fácil + 1 Médio + 1 Difícil cada (as lacunas de Comunicação e Matemática foram fechadas com conteúdo criado pelo agente). Próximo ajuste sugerido: equilibrar a distribuição — Empreendedorismo e Criatividade estão com 14 desafios cada (acima da meta), enquanto as demais categorias têm 7-8; opcionalmente redistribuir esse excedente ou simplesmente aceitar como está. O usuário sinalizou que ainda há mais conteúdo a caminho (possivelmente Médio/Difícil da 3ª rodada, ou novas rodadas) — assim que novos lotes chegarem, seguir cadastrando via `hack_desafios`/`hack_alternativas` usando o template `INSTRUCOES-NOVOS-DESAFIOS-BANCO-HACK.md`. O filtro por nível de dificuldade e os Pontos HACK (10/20/30) já estão prontos na tela do aluno para receber esse conteúdo.
2. ✅ Motor de cálculo do IIH conectado ao projeto final da Jornada Discovery via Avaliação do Professor Mentor — concluído e testado.
3. ✅ 🆕 **Ranking (interno + público)** — concluído e testado: aba "Ranking" dentro do Painel do Clube (por equipes do mesmo clube) e página pública `ranking.html` (Ranking de Equipes + Ranking de Escolas, sem login), somando Pontos de Impacto (Discovery) + Pontos HACK (Banco HACK).
4. ✅ **Jornada HACK Builder** — concluído e testado (5 trilhas × 4 competências, desbloqueio sequencial, Pontos Builder).
5. ✅ **Dashboard da Equipe** — concluído e testado (agrega Discovery + Banco HACK + Builder + posição no ranking geral).
6. ✅ **HACK Challenges + Painel da Empresa** — concluído e testado (mural de desafios, aceitar/propor pelas equipes, avaliar/pagar pelas empresas).
7. ✅ **HACK Festival** — construído e **retestado com sucesso via Playwright** nesta rodada (inscrição de projeto concluído no Discovery com pitch pré-preenchido, e tela de status `Vencedor` com hero/card de avaliação/botões corretos); o problema de timing do script de QA da rodada anterior era do próprio script, não do app, e foi corrigido (setup e verificação separados em arquivos distintos, `localStorage` definido antes da criação do iframe).
8. ✅ **Criada `festival-resultados.html`** — página pública (sem login) com finalistas e vencedores do HACK Festival de todo o Ecossistema HACK BRASIL, testada via Playwright com dados fictícios. Links de "Resultados" em `app/festival.html` (topbar + CTA final) e no footer/CTA de `festival.html` institucional já apontam para ela.
9. Criar o **Manual do Professor Mentor** — documento explicando em detalhe como preencher a Avaliação do Mentor no Discovery (classificação de ODS, profundidade, critérios para cada nota) de forma justa e consistente entre clubes/equipes.
10. (Opcional/futuro) Adicionar **filtro por período/temporada** no Ranking público (ex.: "Ranking do 1º semestre de 2026"), útil quando a plataforma tiver vários ciclos/temporadas acumulados.
11. (Opcional/futuro) Se um dia fizer sentido, avaliar uma integração mais profunda com **app.hackschool.app** (ex.: SSO ou importação automática do resultado do teste) — por ora, o fluxo manual (professor confere o resultado lá e seleciona aqui) atende bem e evita complexidade de integração entre sistemas.
12. (Opcional/futuro) Evoluir a ficha pública do clube (`app/clube-publico.html`) para um verdadeiro "media kit" com exportação em imagem, e permitir a um clube gerar **múltiplos links** (ex.: um específico só com a equipe X, para inscrições pontuais em desafios/festivais).
13. (Opcional/futuro) Avaliar se o Painel da Empresa (`app/empresa.html`) deve migrar de modelo de confiança para autenticação real, caso o volume de empresas parceiras cresça.
