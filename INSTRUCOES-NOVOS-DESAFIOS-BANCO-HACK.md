# 📋 Como criar novos desafios para o Banco HACK

Este documento é o **template oficial** para você criar novos desafios enquanto eu finalizo os últimos ajustes do sistema. Preencha as informações **exatamente** no formato abaixo (nomes de campos, opções e as listas fixas precisam ser copiadas ao pé da letra) e me envie de volta — eu importo tudo direto para o banco de dados.

> ⚠️ **Regra de ouro**: o sistema calcula o IIH automaticamente comparando o que o aluno marca com o que você (professor/criador do desafio) classificou. Se um texto estiver digitado diferente do modelo (acento faltando, palavra trocada, maiúscula/minúscula diferente), o item **não é reconhecido** e vale 0 ponto silenciosamente — sem aviso de erro. Por isso, sempre que possível, **copie e cole** as listas fixas deste documento em vez de digitar de novo.

---

## 🧩 Visão geral: cada desafio tem 2 partes

1. **O Desafio** (1 registro) → a história/contexto que o aluno lê.
2. **As Alternativas** (2 a 4 registros) → as possíveis soluções que o aluno escolhe, cada uma com sua pontuação de ODS, profundidade e a matriz de planejamento/ferramentas.

Recomendo **3 alternativas por desafio** (A, B, C), sendo idealmente:
- **A** = solução Paliativa (resolve o sintoma, rasa)
- **B** ou **C** = solução Sistêmica (ataca causas, mais de um ODS)
- Opcionalmente uma **Transformadora** (alto impacto, escalável) para desafios mais avançados

> 🎯 **Meta de distribuição por nível**: a plataforma já tem filtro por nível de dificuldade (Fácil/Médio/Difícil) na tela do aluno, então o ideal é criar **no mínimo 3 desafios por categoria**, sendo **1 Fácil + 1 Médio + 1 Difícil** (para cada uma das 9 categorias: Criatividade, Tecnologia, IA, Comunicação, Liderança, Empreendedorismo, Matemática, Ciências, Sustentabilidade). Isso garante que qualquer equipe — do 6º ano ao ensino médio — encontre um desafio no nível certo em toda categoria, em vez de "buracos" onde só existe 1 nível disponível.
>
> Sugestão de como diferenciar os níveis na prática:
> - **Fácil**: história mais curta e direta, poucas causas distratoras (2-3), alternativas de solução mais óbvias entre si.
> - **Médio**: história com mais contexto, causas distratoras mais parecidas com as reais (mais fácil confundir), alternativas com ODS diretos/indiretos combinados de forma menos evidente.
> - **Difícil**: história com múltiplas camadas de causa (causa raiz escondida), causas distratoras bem plausíveis, alternativas com profundidades (Paliativa/Sistêmica/Transformadora) mais difíceis de distinguir só pelo texto — exige leitura atenta.

---

## PARTE 1 — Ficha do Desafio (tabela `hack_desafios`)

| Campo | O que é | Como preencher |
|---|---|---|
| `titulo` | Título curto e chamativo | Texto livre. Ex.: "O Desafio da Dona Joana" |
| `categoria` | Área de conhecimento | **Escolha exatamente uma** destas opções (copiar e colar): `Criatividade`, `Tecnologia`, `IA`, `Comunicação`, `Liderança`, `Empreendedorismo`, `Matemática`, `Ciências`, `Sustentabilidade` |
| `historia` | A narrativa que o aluno lê antes de resolver | Texto livre, pode ter parágrafos. Conte o contexto/problema sem revelar a solução |
| `tempo_estimado` | Tempo sugerido | Texto livre. Ex.: `"30 minutos"` |
| `nivel` | Dificuldade | **Escolha exatamente uma**: `Fácil`, `Médio`, `Difícil` |
| `status` | Se aparece para os alunos | Use `Rascunho` enquanto está em construção e `Publicado` quando estiver pronto. **Me envie sempre como se fosse "Publicado"** — eu decido quando ativar. |
| `ordem` | Posição na lista (número) | Um número (1, 2, 3...). Se não souber, deixe `99` e eu ajusto. |
| `causas_reais` | Lista de causas **verdadeiras** do problema | 3 a 5 frases curtas. Usadas na Etapa 1 (o aluno tem que identificar quais são reais) |
| `causas_distratoras` | Lista de causas **falsas/armadilhas** (parecem certas, mas não são a causa raiz) | 3 a 5 frases curtas, no mesmo estilo das reais, para confundir de propósito |

### Exemplo real (desafio "Dona Joana", já publicado):
- **titulo**: O Desafio da Dona Joana
- **categoria**: Sustentabilidade
- **nivel**: Médio
- **tempo_estimado**: 30 minutos
- **causas_reais** (exemplos do padrão usado): "Falta de planejamento no cardápio da semana", "Compras feitas sem lista, gerando excesso", "Sobras não são reaproveitadas em novas receitas", "Falta de local adequado para compostagem"
- **causas_distratoras**: coisas plausíveis mas que não são a causa raiz do desperdício de alimentos (ex.: "A geladeira é pequena", "A família não gosta de verduras")

---

## PARTE 2 — Ficha de cada Alternativa (tabela `hack_alternativas`)

Para **cada** alternativa (A, B, C...) preencha:

| Campo | O que é | Como preencher |
|---|---|---|
| `letra` | Identificador | `A`, `B`, `C`... |
| `texto` | Descrição da solução proposta | Texto livre, 1-3 frases |
| `ods_diretos` | ODS **diretamente** impactados (valem 3 pts cada) | Escolha entre 1 e 4 itens da **Lista Oficial de ODS** abaixo — copie o texto exato |
| `ods_indiretos` | ODS **indiretamente** impactados (valem 1 pt cada) | Mesma lista, itens diferentes dos diretos |
| `profundidade` | Nível da solução | **Escolha exatamente uma**: `Paliativa` (×1), `Sistêmica` (×2), `Transformadora` (×3) |
| `justificativa_profundidade` | Por que você classificou assim | Texto livre, 1 frase (aparece como explicação pro aluno) |
| `planejamento_pesos` | Classificação das 10 Etapas de Planejamento | Ver instruções abaixo — **as 10 devem ser classificadas** |
| `ferramentas_pesos` | Classificação das 10 Ferramentas | Ver instruções abaixo — **as 10 devem ser classificadas** |

### Fórmula usada pelo sistema (para você entender o efeito do que preenche):
```
Pontos ODS = (nº ODS diretos × 3 + nº ODS indiretos × 1) × multiplicador de profundidade
(máximo 40 pontos nesta dimensão)

Selo:
  Transformadora           → 💎 Diamante
  Sistêmica + pontos > 25  → 🥇 Ouro
  Sistêmica + pontos 10-25 → 🥈 Prata
  qualquer outro caso      → 🥉 Bronze
```

---

## 📗 Lista Oficial de ODS (copie e cole exatamente como está)

Use estes textos **exatamente assim** em `ods_diretos` e `ods_indiretos`:

```
1 — Erradicação da Pobreza
2 — Fome Zero e Agricultura Sustentável
3 — Saúde e Bem-Estar
4 — Educação de Qualidade
5 — Igualdade de Gênero
6 — Água Potável e Saneamento
7 — Energia Limpa e Acessível
8 — Trabalho Decente e Crescimento Econômico
9 — Indústria, Inovação e Infraestrutura
10 — Redução das Desigualdades
11 — Cidades e Comunidades Sustentáveis
12 — Consumo e Produção Responsáveis
13 — Ação Contra a Mudança Global do Clima
14 — Vida na Água
15 — Vida Terrestre
16 — Paz, Justiça e Instituições Eficazes
17 — Parcerias e Meios de Implementação
```

---

## 📘 Lista Fixa — Etapas de Planejamento (as mesmas 10 para TODOS os desafios)

Para `planejamento_pesos`, classifique **cada uma** destas 10 etapas como `Essencial` (5 pts), `Recomendada` (3 pts) ou `Irrelevante` (0 pts) — pensando: "essa etapa é importante para executar a Alternativa X especificamente?"

```
1. Definir o problema e a causa raiz
2. Definir o público-alvo
3. Estabelecer metas e indicadores de sucesso
4. Levantar recursos necessários (tempo, dinheiro, materiais)
5. Buscar parceiros e apoiadores
6. Coletar dados e evidências
7. Elaborar cronograma de execução
8. Identificar riscos e planos de contingência
9. Planejar a comunicação/divulgação
10. Planejar a validação com o público-alvo
```

**Formato para me enviar** (para cada alternativa, as 10 linhas):
```
Definir o problema e a causa raiz → Essencial
Definir o público-alvo → Recomendada
Estabelecer metas e indicadores de sucesso → Essencial
Levantar recursos necessários (tempo, dinheiro, materiais) → Recomendada
Buscar parceiros e apoiadores → Irrelevante
Coletar dados e evidências → Recomendada
Elaborar cronograma de execução → Essencial
Identificar riscos e planos de contingência → Irrelevante
Planejar a comunicação/divulgação → Recomendada
Planejar a validação com o público-alvo → Essencial
```

⚠️ Lembre-se: no jogo o aluno escolhe **exatamente 5** dessas 10 etapas. A nota dessa dimensão é: (soma dos pontos das 5 escolhidas ÷ soma das 5 maiores pontuações possíveis) × 25. Ou seja, **é importante que existam pelo menos 5 itens classificados como "Essencial" ou com pontuação alta**, senão fica impossível tirar nota máxima.

---

## 🧰 Lista Fixa — Ferramentas (as mesmas 10 para TODOS os desafios)

Para `ferramentas_pesos`, classifique **cada uma** destas 10 ferramentas como `Essencial` (5 pts), `Recomendada` (3 pts) ou `Irrelevante` (0 pts):

```
1. Formulário de pesquisa/entrevista
2. Planilha de orçamento
3. Protótipo/maquete física
4. Prototipagem digital (Figma, Canva etc.)
5. Aplicativo ou site
6. Rede social para divulgação
7. Vídeo/pitch em vídeo
8. Cronograma de tarefas (Trello, Kanban etc.)
9. Ferramenta de Inteligência Artificial
10. Parcerias institucionais (ONG, prefeitura, empresa)
```

**Formato para me enviar** (mesmo esquema de setinha `→`):
```
Formulário de pesquisa/entrevista → Recomendada
Planilha de orçamento → Essencial
Protótipo/maquete física → Irrelevante
Prototipagem digital (Figma, Canva etc.) → Recomendada
Aplicativo ou site → Irrelevante
Rede social para divulgação → Essencial
Vídeo/pitch em vídeo → Recomendada
Cronograma de tarefas (Trello, Kanban etc.) → Essencial
Ferramenta de Inteligência Artificial → Irrelevante
Parcerias institucionais (ONG, prefeitura, empresa) → Recomendada
```

⚠️ Aqui o aluno escolhe **até 5** ferramentas (não precisa ser exatamente 5). Mesma fórmula de nota (÷ pelas 5 maiores pontuações possíveis × 25).

---

## ✅ Template completo para copiar e preencher (1 desafio + 3 alternativas)

Copie o bloco abaixo em um documento/planilha, duplique para cada novo desafio, e preencha tudo:

```
========================================
DESAFIO
========================================
Título: 
Categoria (uma de: Criatividade / Tecnologia / IA / Comunicação / Liderança / Empreendedorismo / Matemática / Ciências / Sustentabilidade): 
História (contexto/narrativa completa): 
Tempo estimado: 
Nível (Fácil / Médio / Difícil): 
Ordem (número): 

Causas reais (3 a 5 frases):
- 
- 
- 

Causas distratoras (3 a 5 frases, parecem certas mas não são a causa raiz):
- 
- 
- 

========================================
ALTERNATIVA A
========================================
Texto da solução: 
ODS diretos (copiar da lista oficial, 1 a 4 itens):
- 
ODS indiretos (copiar da lista oficial):
- 
Profundidade (Paliativa / Sistêmica / Transformadora): 
Justificativa da profundidade: 

Planejamento (classifique as 10, use Essencial/Recomendada/Irrelevante):
Definir o problema e a causa raiz → 
Definir o público-alvo → 
Estabelecer metas e indicadores de sucesso → 
Levantar recursos necessários (tempo, dinheiro, materiais) → 
Buscar parceiros e apoiadores → 
Coletar dados e evidências → 
Elaborar cronograma de execução → 
Identificar riscos e planos de contingência → 
Planejar a comunicação/divulgação → 
Planejar a validação com o público-alvo → 

Ferramentas (classifique as 10, use Essencial/Recomendada/Irrelevante):
Formulário de pesquisa/entrevista → 
Planilha de orçamento → 
Protótipo/maquete física → 
Prototipagem digital (Figma, Canva etc.) → 
Aplicativo ou site → 
Rede social para divulgação → 
Vídeo/pitch em vídeo → 
Cronograma de tarefas (Trello, Kanban etc.) → 
Ferramenta de Inteligência Artificial → 
Parcerias institucionais (ONG, prefeitura, empresa) → 

========================================
ALTERNATIVA B
========================================
(repita a mesma estrutura da Alternativa A)

========================================
ALTERNATIVA C
========================================
(repita a mesma estrutura da Alternativa A)
```

---

## 💡 Dicas para desafios equilibrados

- **Alternativa A (Paliativa)**: 1 ODS direto, 1 ODS indireto → resulta em pontuação baixa de ODS (ex.: 4 pts) → Selo Bronze.
- **Alternativa B/C (Sistêmica)**: 2-3 ODS diretos + 2-3 ODS indiretos, multiplicador ×2 → pontuação entre 10-25 (Prata) ou acima de 25 (Ouro) dependendo da quantidade de ODS.
- **Transformadora** (se usar): multiplicador ×3, reservada para soluções realmente escaláveis/replicáveis — sempre vira Diamante independente da pontuação ODS.
- Quanto mais "Essencial" você marcar bem distribuído entre as 10 etapas/ferramentas (em vez de concentrar tudo em 5), mais justa fica a pontuação, pois o aluno terá que realmente pensar em qual delas é mais essencial para aquela alternativa específica.
- Alternativas diferentes (A, B, C) devem ter classificações de planejamento/ferramentas **diferentes entre si** — é isso que torna a escolha da alternativa relevante para a nota final.

---

## 📬 Como me enviar

Pode me mandar preenchido aqui mesmo no chat (colando o texto), em um Google Docs/planilha compartilhado, ou em qualquer formato de texto — só preciso que as **listas fixas de ODS/Planejamento/Ferramentas usem exatamente os textos deste documento**. Eu cuido de transformar em dados do banco e testar os cálculos antes de publicar.

Já existe 1 desafio completo e testado no sistema como modelo de referência: **"O Desafio da Dona Joana"** (categoria Sustentabilidade, 3 alternativas A/B/C com pontuações de IIH 4/24/16 já validadas).
