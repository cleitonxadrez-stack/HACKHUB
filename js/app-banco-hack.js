/* ==========================================================================
   HACK HUB® — Banco HACK (app funcional)
   VERSÃO MODIFICADA: Usa JSON local em vez de API do Gemini
   ========================================================================== */

const STORAGE_CLUBE_KEY = 'hh_clube_ativo_id';
const STORAGE_EQUIPE_KEY = 'hh_equipe_discovery_id';
const BANCO_DADOS_URL = '../dados/hackhub-export-2026-07-17-05-33-35.json'; // 👈 CAMINHO DO ARQUIVO JSON

// Cache global para os dados
let BANCO_DADOS_GLOBAL = null;

const state = {
  clube: null,
  equipes: [],
  equipeAtiva: null,
  desafios: [],
  alternativas: [],
  submissoes: [],
  categoriaFiltro: 'Todas',
  nivelFiltro: 'Todos',
  sessao: null,
};

const NIVEL_INFO = {
  'Fácil': { classe: 'nivel-facil', ordem: 1, icone: 'fa-solid fa-seedling', pontos: 10 },
  'Médio': { classe: 'nivel-medio', ordem: 2, icone: 'fa-solid fa-fire', pontos: 20 },
  'Difícil': { classe: 'nivel-dificil', ordem: 3, icone: 'fa-solid fa-bolt', pontos: 30 },
};

const ETAPAS_PLANEJAMENTO = [
  'Definir o problema e a causa raiz',
  'Definir o público-alvo',
  'Estabelecer metas e indicadores de sucesso',
  'Levantar recursos necessários (tempo, dinheiro, materiais)',
  'Buscar parceiros e apoiadores',
  'Coletar dados e evidências',
  'Elaborar cronograma de execução',
  'Identificar riscos e planos de contingência',
  'Planejar a comunicação/divulgação',
  'Planejar a validação com o público-alvo',
];

const FERRAMENTAS = [
  'Formulário de pesquisa/entrevista',
  'Planilha de orçamento',
  'Protótipo/maquete física',
  'Prototipagem digital (Figma, Canva etc.)',
  'Aplicativo ou site',
  'Rede social para divulgação',
  'Vídeo/pitch em vídeo',
  'Cronograma de tarefas (Trello, Kanban etc.)',
  'Ferramenta de Inteligência Artificial',
  'Parcerias institucionais (ONG, prefeitura, empresa)',
];

const PESO_CLASSIFICACAO = { 'Essencial': 5, 'Recomendada': 3, 'Irrelevante': 0 };
const MULTIPLICADOR_PROFUNDIDADE = { 'Paliativa': 1, 'Sistêmica': 2, 'Transformadora': 3 };
const MAX_PLANEJAMENTO_SELECAO = 5;
const MAX_FERRAMENTAS_SELECAO = 5;

/* --------------------------------------------------------------------------
   Helpers gerais
   -------------------------------------------------------------------------- */

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function showToast(msg, icon = 'fa-solid fa-circle-check') {
  const toast = $('#toast');
  toast.innerHTML = `<i class="${icon} text-brand-yellow"></i> ${msg}`;
  toast.classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* --------------------------------------------------------------------------
   NOVO: Carregar dados do JSON local
   -------------------------------------------------------------------------- */

async function carregarBancoDados() {
  if (BANCO_DADOS_GLOBAL) return BANCO_DADOS_GLOBAL;
  
  try {
    const response = await fetch(BANCO_DADOS_URL);
    if (!response.ok) throw new Error(`Erro ao carregar JSON: ${response.status}`);
    BANCO_DADOS_GLOBAL = await response.json();
    return BANCO_DADOS_GLOBAL;
  } catch (err) {
    console.error('Erro ao carregar banco de dados:', err);
    throw err;
  }
}

// Simulação da API antiga — agora busca do JSON
async function api(path, opts = {}) {
  const bd = await carregarBancoDados();
  
  // Se for GET, retorna os dados da tabela
  if (!opts.method || opts.method === 'GET') {
    const partes = path.split('?');
    const recurso = partes[0]; // ex: "hack_desafios", "hack_desafios/123"
    
    // Parsing de querys (limit, filter, etc)
    const queryStr = partes[1] || '';
    const params = new URLSearchParams(queryStr);
    
    const [tabela, id] = recurso.split('/');
    const dados = bd[tabela] || [];
    
    if (id) {
      // GET específico: hack_desafios/123
      const item = dados.find(d => d.id === id);
      if (!item) {
        const err = new Error(`Não encontrado: ${recurso}`);
        err.status = 404;
        throw err;
      }
      return item;
    }
    
    // GET lista: hack_desafios?limit=200
    return {
      data: dados,
      results: dados
    };
  }
  
  // Se for POST/PATCH, simula salvamento localmente
  if (opts.method === 'POST' || opts.method === 'PATCH') {
    const payload = JSON.parse(opts.body || '{}');
    
    // Para submissões, cria um ID novo se for POST
    if (opts.method === 'POST') {
      const id = 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
      const novaSubmissao = {
        id,
        ...payload,
        created_at: Date.now(),
        updated_at: Date.now()
      };
      // Simula salvamento (em produção, seria enviado para o servidor)
      BANCO_DADOS_GLOBAL.hack_submissoes = BANCO_DADOS_GLOBAL.hack_submissoes || [];
      BANCO_DADOS_GLOBAL.hack_submissoes.push(novaSubmissao);
      return novaSubmissao;
    }
    
    // Para PATCH, atualiza a submissão existente
    if (opts.method === 'PATCH') {
      const partes = path.split('/');
      const id = partes[partes.length - 1];
      const submissoes = BANCO_DADOS_GLOBAL.hack_submissoes || [];
      const idx = submissoes.findIndex(s => s.id === id);
      if (idx === -1) {
        const err = new Error(`Submissão não encontrada: ${id}`);
        err.status = 404;
        throw err;
      }
      const atualizada = {
        ...submissoes[idx],
        ...payload,
        updated_at: Date.now()
      };
      submissoes[idx] = atualizada;
      return atualizada;
    }
  }
  
  throw new Error(`Método não suportado: ${opts.method}`);
}

/* --------------------------------------------------------------------------
   Alternância de views
   -------------------------------------------------------------------------- */

const VIEWS = ['loading', 'erro', 'sem-clube', 'sem-equipe', 'escolher-equipe', 'lista', 'desafio'];

function showView(name) {
  VIEWS.forEach(v => {
    const el = $(`#view-${v}`);
    if (el) el.classList.toggle('hidden', v !== name);
  });
}

/* --------------------------------------------------------------------------
   Inicialização / seleção de clube e equipe
   -------------------------------------------------------------------------- */

async function init() {
  showView('loading');
  const clubeId = localStorage.getItem(STORAGE_CLUBE_KEY);
  if (!clubeId) return showView('sem-clube');

  try {
    let clube;
    try {
      clube = await api(`hack_clubes/${clubeId}`);
    } catch (e) {
      if (e.status === 404) return showView('sem-clube');
      throw e;
    }
    if (!clube || clube.deleted) return showView('sem-clube');
    state.clube = clube;

    const equipesRes = await api(`equipes?limit=200`);
    const equipesAprovadas = (equipesRes.data || []).filter(e => e.clube_id === clubeId && e.status === 'Aprovada');
    state.equipes = equipesAprovadas;
    if (equipesAprovadas.length === 0) return showView('sem-equipe');

    const savedEquipeId = localStorage.getItem(STORAGE_EQUIPE_KEY);
    let equipe = equipesAprovadas.find(e => e.id === savedEquipeId);

    if (!equipe) {
      if (equipesAprovadas.length === 1) {
        equipe = equipesAprovadas[0];
        localStorage.setItem(STORAGE_EQUIPE_KEY, equipe.id);
      } else {
        return renderEscolherEquipe(equipesAprovadas);
      }
    }
    await selecionarEquipe(equipe);
  } catch (err) {
    console.error(err);
    showView('erro');
  }
}

function renderEscolherEquipe(equipes) {
  showView('escolher-equipe');
  const wrap = $('#lista-escolher-equipe');
  wrap.innerHTML = equipes.map(eq => `
    <button data-equipe-id="${eq.id}" class="app-card w-full text-left flex items-center justify-between hover:shadow-md transition-shadow" data-action="escolher-equipe">
      <div>
        <p class="font-semibold text-slate-900">${escapeHtml(eq.nome_equipe)}</p>
        ${eq.lema ? `<p class="text-xs text-slate-500 italic">"${escapeHtml(eq.lema)}"</p>` : ''}
      </div>
      <i class="fa-solid fa-arrow-right text-brand-yellow-dark"></i>
    </button>
  `).join('');
  $all('[data-action="escolher-equipe"]', wrap).forEach(btn => {
    btn.addEventListener('click', async () => {
      const equipe = equipes.find(e => e.id === btn.getAttribute('data-equipe-id'));
      localStorage.setItem(STORAGE_EQUIPE_KEY, equipe.id);
      await selecionarEquipe(equipe);
    });
  });
}

async function selecionarEquipe(equipe) {
  try {
    showView('loading');
    state.equipeAtiva = equipe;
    showTopbarEquipe();

    const [desafiosRes, alternativasRes, submissoesRes] = await Promise.all([
      api('hack_desafios?limit=200'),
      api('hack_alternativas?limit=500'),
      api('hack_submissoes?limit=500'),
    ]);

    state.desafios = (desafiosRes.data || []).filter(d => d.status === 'Publicado').sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    state.alternativas = alternativasRes.data || [];
    state.submissoes = (submissoesRes.data || []).filter(s => s.equipe_id === equipe.id);

    renderLista();
    showView('lista');
  } catch (err) {
    console.error(err);
    showView('erro');
  }
}

function showTopbarEquipe() {
  $('#topbar-equipe-name').textContent = state.equipeAtiva?.nome_equipe || '';
  $('#topbar-equipe-name').classList.remove('hidden');
  $('#btn-trocar-equipe').classList.toggle('hidden', state.equipes.length <= 1);
}

/* --------------------------------------------------------------------------
   Lista de desafios
   -------------------------------------------------------------------------- */

function submissaoDoDesafio(desafioId) {
  const doDesafio = state.submissoes.filter(s => s.desafio_id === desafioId);
  if (doDesafio.length === 0) return null;
  return doDesafio.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];
}

function renderLista() {
  $('#equipe-nome').textContent = state.equipeAtiva.nome_equipe;

  const categorias = ['Todas', ...Array.from(new Set(state.desafios.map(d => d.categoria).filter(Boolean)))];
  const filtrosWrap = $('#filtros-categoria');
  filtrosWrap.innerHTML = categorias.map(cat => `
    <button type="button" class="chip-btn ${state.categoriaFiltro === cat ? 'active' : ''}" data-categoria="${escapeHtml(cat)}">${escapeHtml(cat)}</button>
  `).join('');
  $all('[data-categoria]', filtrosWrap).forEach(btn => {
    btn.addEventListener('click', () => {
      state.categoriaFiltro = btn.getAttribute('data-categoria');
      renderLista();
    });
  });

  const niveisPresentes = Array.from(new Set(state.desafios.map(d => d.nivel).filter(Boolean)));
  niveisPresentes.sort((a, b) => (NIVEL_INFO[a]?.ordem || 99) - (NIVEL_INFO[b]?.ordem || 99));
  const niveis = ['Todos', ...niveisPresentes];
  const filtrosNivelWrap = $('#filtros-nivel');
  if (filtrosNivelWrap) {
    filtrosNivelWrap.innerHTML = niveis.map(niv => {
      const info = NIVEL_INFO[niv];
      const icone = info ? `<i class="${info.icone} mr-1"></i>` : '';
      return `<button type="button" class="chip-btn ${state.nivelFiltro === niv ? 'active' : ''}" data-nivel="${escapeHtml(niv)}">${icone}${escapeHtml(niv)}</button>`;
    }).join('');
    $all('[data-nivel]', filtrosNivelWrap).forEach(btn => {
      btn.addEventListener('click', () => {
        state.nivelFiltro = btn.getAttribute('data-nivel');
        renderLista();
      });
    });
  }

  const filtrados = state.desafios.filter(d => {
    const passaCategoria = state.categoriaFiltro === 'Todas' || d.categoria === state.categoriaFiltro;
    const passaNivel = state.nivelFiltro === 'Todos' || d.nivel === state.nivelFiltro;
    return passaCategoria && passaNivel;
  });

  const wrap = $('#lista-desafios');
  const vazio = $('#lista-desafios-vazia');

  if (filtrados.length === 0) {
    wrap.innerHTML = '';
    vazio.classList.remove('hidden');
    return;
  }
  vazio.classList.add('hidden');

  wrap.innerHTML = filtrados.map(d => {
    const sub = submissaoDoDesafio(d.id);
    const resolvido = !!sub;
    const nivelInfo = NIVEL_INFO[d.nivel] || { classe: '', icone: 'fa-solid fa-signal' };
    return `
      <article class="desafio-card ${resolvido ? 'is-resolvido' : ''}" data-desafio-id="${d.id}">
        ${resolvido ? `<span class="badge badge-yellow absolute top-4 right-4"><i class="fa-solid fa-check mr-1"></i>Resolvido</span>` : ''}
        <div class="flex items-center gap-2 mb-3 flex-wrap">
          <span class="badge badge-dark">${escapeHtml(d.categoria || 'Geral')}</span>
          ${d.nivel ? `<span class="nivel-tag ${nivelInfo.classe}"><span class="nivel-dot"></span>${escapeHtml(d.nivel)}</span>` : ''}
        </div>
        <h3 class="font-display text-lg font-bold text-slate-900 mb-2">${escapeHtml(d.titulo)}</h3>
        <p class="text-slate-500 text-xs mb-4 line-clamp-3">${escapeHtml((d.historia || '').replace(/<[^>]+>/g, '').slice(0, 140))}${(d.historia || '').length > 140 ? '…' : ''}</p>
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span><i class="fa-regular fa-clock mr-1"></i>${escapeHtml(d.tempo_estimado || '—')}</span>
        </div>
        ${resolvido ? `<div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span class="text-xs text-slate-500">IIH obtido</span>
          <span class="font-display font-bold text-brand-yellow-dark">${sub.iih_total ?? 0}/100</span>
        </div>` : ''}
      </article>
    `;
  }).join('');

  $all('[data-desafio-id]', wrap).forEach(card => {
    card.addEventListener('click', () => abrirDesafio(card.getAttribute('data-desafio-id')));
  });
}

/* --------------------------------------------------------------------------
   Resolução do desafio — máquina de etapas
   -------------------------------------------------------------------------- */

const ETAPAS = [
  { n: 1, label: 'Compreender' },
  { n: 2, label: 'Escolher' },
  { n: 3, label: 'Planejar' },
  { n: 4, label: 'Ferramentas' },
  { n: 5, label: 'Resultado' },
];

function abrirDesafio(desafioId, opts = {}) {
  const desafio = state.desafios.find(d => d.id === desafioId);
  if (!desafio) return;

  const submissaoExistente = submissaoDoDesafio(desafioId);
  const forcarReinicio = !!opts.reiniciar;

  const causasReais = (desafio.causas_reais || []).map(c => ({ texto: c, real: true }));
  const causasDistratoras = (desafio.causas_distratoras || []).map(c => ({ texto: c, real: false }));

  state.sessao = {
    desafio,
    submissaoExistente,
    etapaAtual: (submissaoExistente && !forcarReinicio) ? 5 : 1,
    causas: shuffle([...causasReais, ...causasDistratoras]),
    causasSelecionadas: [],
    alternativaId: null,
    planejamentoSelecionado: [],
    ferramentasSelecionadas: [],
    resultado: (submissaoExistente && !forcarReinicio) ? resultadoFromSubmissao(submissaoExistente) : null,
  };

  showView('desafio');
  renderEtapaDots();
  renderEtapaAtual();
}

function resultadoFromSubmissao(sub) {
  return {
    nota_compreensao: sub.nota_compreensao || 0,
    nota_ods: sub.nota_ods || 0,
    nota_planejamento: sub.nota_planejamento || 0,
    nota_ferramentas: sub.nota_ferramentas || 0,
    iih_total: sub.iih_total || 0,
    selo: sub.selo || 'Bronze',
    pontos_ganhos: sub.pontos_ganhos || 0,
    alternativa: state.alternativas.find(a => a.id === sub.alternativa_id) || null,
  };
}

function renderEtapaDots() {
  const wrap = $('#etapa-dots');
  wrap.innerHTML = ETAPAS.map((e, idx) => {
    const isDone = e.n < state.sessao.etapaAtual;
    const isCurrent = e.n === state.sessao.etapaAtual;
    const dot = `<div class="etapa-dot ${isDone ? 'is-done' : isCurrent ? 'is-current' : ''}" title="${escapeHtml(e.label)}">${isDone ? '<i class="fa-solid fa-check"></i>' : e.n}</div>`;
    const line = idx < ETAPAS.length - 1 ? `<div class="etapa-line ${isDone ? 'is-done' : ''}"></div>` : '';
    return dot + line;
  }).join('');
}

function irParaEtapa(n) {
  state.sessao.etapaAtual = n;
  renderEtapaDots();
  renderEtapaAtual();
}

function renderEtapaAtual() {
  const n = state.sessao.etapaAtual;
  const container = $('#desafio-container');
  if (n === 1) container.innerHTML = htmlEtapaCompreensao();
  else if (n === 2) container.innerHTML = htmlEtapaEscolher();
  else if (n === 3) container.innerHTML = htmlEtapaPlanejamento();
  else if (n === 4) container.innerHTML = htmlEtapaFerramentas();
  else if (n === 5) container.innerHTML = htmlEtapaResultado();
  wireEtapaAtual();
}

/* Etapa 1 — Compreensão do Problema */
function htmlEtapaCompreensao() {
  const d = state.sessao.desafio;
  const nivelInfo = NIVEL_INFO[d.nivel] || { classe: '' };
  return `
    <div class="flex items-center gap-2 mb-3 flex-wrap">
      <span class="badge badge-yellow"><i class="fa-solid fa-magnifying-glass mr-1.5"></i>Etapa 1 · Compreender</span>
      ${d.nivel ? `<span class="nivel-tag ${nivelInfo.classe}"><span class="nivel-dot"></span>${escapeHtml(d.nivel)}</span>` : ''}
    </div>
    <h2 class="font-display text-xl font-bold text-slate-900 mb-2">${escapeHtml(d.titulo)}</h2>
    <div class="text-slate-600 text-sm leading-relaxed mb-6">${d.historia || ''}</div>
    <p class="font-semibold text-slate-800 text-sm mb-3">Quais das opções abaixo são causas reais deste problema? (marque todas que se aplicam)</p>
    <div class="space-y-2 mb-6">
      ${state.sessao.causas.map((c, i) => `
        <label class="opcao-selecionavel">
          <input type="checkbox" data-causa-idx="${i}" class="mt-1 w-4 h-4 accent-brand-yellow-dark">
          <span class="text-sm text-slate-700">${escapeHtml(c.texto)}</span>
        </label>
      `).join('')}
    </div>
    <button id="btn-avancar-etapa" class="btn-accent w-full py-3 rounded-lg font-semibold">Avançar <i class="fa-solid fa-arrow-right ml-1"></i></button>
  `;
}

/* Etapa 2 — Escolher alternativa */
function htmlEtapaEscolher() {
  const d = state.sessao.desafio;
  const alternativas = state.alternativas.filter(a => a.desafio_id === d.id).sort((a, b) => (a.letra || '').localeCompare(b.letra || ''));
  if (alternativas.length === 0) {
    return `
      <span class="badge badge-yellow mb-3"><i class="fa-solid fa-list-check mr-1.5"></i>Etapa 2 · Escolher</span>
      <div class="rounded-xl bg-slate-50 border border-slate-100 p-5 text-sm text-slate-500 text-center">Este desafio ainda não tem alternativas cadastradas.</div>
      <button id="btn-voltar-etapa" class="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-800"><i class="fa-solid fa-arrow-left mr-1"></i> Voltar</button>
    `;
  }
  return `
    <span class="badge badge-yellow mb-3"><i class="fa-solid fa-list-check mr-1.5"></i>Etapa 2 · Escolher</span>
    <h2 class="font-display text-xl font-bold text-slate-900 mb-4">Qual solução sua equipe escolhe?</h2>
    <div class="space-y-3 mb-6">
      ${alternativas.map(a => `
        <label class="opcao-selecionavel ${state.sessao.alternativaId === a.id ? 'is-checked' : ''}">
          <input type="radio" name="alternativa" value="${a.id}" class="mt-1 w-4 h-4 accent-brand-yellow-dark" ${state.sessao.alternativaId === a.id ? 'checked' : ''}>
          <span>
            <span class="badge badge-dark mr-2" style="font-size:0.65rem;">Alternativa ${escapeHtml(a.letra || '')}</span>
            <span class="text-sm text-slate-800">${a.texto || ''}</span>
          </span>
        </label>
      `).join('')}
    </div>
    <div class="flex gap-3">
      <button id="btn-voltar-etapa" class="px-5 py-3 rounded-lg font-semibold border border-slate-200 text-slate-600 hover:border-slate-300"><i class="fa-solid fa-arrow-left mr-1"></i> Voltar</button>
      <button id="btn-avancar-etapa" class="btn-accent flex-1 py-3 rounded-lg font-semibold">Avançar <i class="fa-solid fa-arrow-right ml-1"></i></button>
    </div>
  `;
}

/* Etapa 3 — Planejamento */
function htmlEtapaPlanejamento() {
  return `
    <span class="badge badge-yellow mb-3"><i class="fa-solid fa-diagram-project mr-1.5"></i>Etapa 3 · Planejar</span>
    <h2 class="font-display text-xl font-bold text-slate-900 mb-2">Quais etapas de planejamento sua equipe vai seguir?</h2>
    <p class="text-slate-500 text-sm mb-4">Escolham exatamente <strong>${MAX_PLANEJAMENTO_SELECAO}</strong> etapas — as mais importantes para a solução escolhida.</p>
    <p id="contador-planejamento" class="text-xs font-semibold text-brand-yellow-dark mb-3">0 de ${MAX_PLANEJAMENTO_SELECAO} selecionadas</p>
    <div class="space-y-2 mb-6">
      ${ETAPAS_PLANEJAMENTO.map((etapa, i) => `
        <label class="opcao-selecionavel">
          <input type="checkbox" data-planejamento-idx="${i}" class="mt-1 w-4 h-4 accent-brand-yellow-dark">
          <span class="text-sm text-slate-700">${escapeHtml(etapa)}</span>
        </label>
      `).join('')}
    </div>
    <div class="flex gap-3">
      <button id="btn-voltar-etapa" class="px-5 py-3 rounded-lg font-semibold border border-slate-200 text-slate-600 hover:border-slate-300"><i class="fa-solid fa-arrow-left mr-1"></i> Voltar</button>
      <button id="btn-avancar-etapa" class="btn-accent flex-1 py-3 rounded-lg font-semibold">Avançar <i class="fa-solid fa-arrow-right ml-1"></i></button>
    </div>
  `;
}

/* Etapa 4 — Ferramentas */
function htmlEtapaFerramentas() {
  return `
    <span class="badge badge-yellow mb-3"><i class="fa-solid fa-toolbox mr-1.5"></i>Etapa 4 · Ferramentas</span>
    <h2 class="font-display text-xl font-bold text-slate-900 mb-2">Quais ferramentas sua equipe vai usar?</h2>
    <p class="text-slate-500 text-sm mb-4">Escolham até <strong>${MAX_FERRAMENTAS_SELECAO}</strong> ferramentas mais adequadas à solução.</p>
    <p id="contador-ferramentas" class="text-xs font-semibold text-brand-yellow-dark mb-3">0 de ${MAX_FERRAMENTAS_SELECAO} selecionadas</p>
    <div class="space-y-2 mb-6">
      ${FERRAMENTAS.map((f, i) => `
        <label class="opcao-selecionavel">
          <input type="checkbox" data-ferramenta-idx="${i}" class="mt-1 w-4 h-4 accent-brand-yellow-dark">
          <span class="text-sm text-slate-700">${escapeHtml(f)}</span>
        </label>
      `).join('')}
    </div>
    <div class="flex gap-3">
      <button id="btn-voltar-etapa" class="px-5 py-3 rounded-lg font-semibold border border-slate-200 text-slate-600 hover:border-slate-300"><i class="fa-solid fa-arrow-left mr-1"></i> Voltar</button>
      <button id="btn-finalizar" class="btn-accent flex-1 py-3 rounded-lg font-semibold">Calcular meu IIH <i class="fa-solid fa-flag-checkered ml-1"></i></button>
    </div>
  `;
}

/* Etapa 5 — Resultado */
const SELO_INFO = {
  'Bronze': { emoji: '🥉', gradiente: 'linear-gradient(145deg,#E3A469,#CD7F32)', cor: '#fff', desc: 'Resolve o sintoma, primeiro passo.' },
  'Prata': { emoji: '🥈', gradiente: 'linear-gradient(145deg,#E5E7EB,#9CA3AF)', cor: '#334155', desc: 'Ataca causas, solução integrada.' },
  'Ouro': { emoji: '🥇', gradiente: 'linear-gradient(145deg,#FFE27A,#D4A017)', cor: '#4A2E00', desc: 'Alto impacto, múltiplos ODS.' },
  'Diamante': { emoji: '💎', gradiente: 'linear-gradient(145deg,#93E5FF,#6C7BFA)', cor: '#fff', desc: 'Pode ser replicada em escala, muda o jogo.' },
};

function htmlEtapaResultado() {
  const r = state.sessao.resultado;
  if (!r) return `<p class="text-center text-slate-500 py-10">Nenhum resultado calculado ainda.</p>`;
  const selo = SELO_INFO[r.selo] || SELO_INFO['Bronze'];
  const alt = r.alternativa;
  const odsTags = alt ? [
    ...(alt.ods_diretos || []).map(o => `<span class="ods-tag"><span class="ods-dot" style="background:var(--hh-yellow-dark)">●</span>${escapeHtml(o)}</span>`),
    ...(alt.ods_indiretos || []).map(o => `<span class="ods-tag ods-indirect"><span class="ods-dot" style="background:#CBD5E1">●</span>${escapeHtml(o)} (indireto)</span>`),
  ].join('') : '';

  return `
    <span class="badge badge-yellow mb-3"><i class="fa-solid fa-trophy mr-1.5"></i>Resultado</span>
    <div class="result-mockup mb-6">
      <div class="result-mockup-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <p class="text-brand-yellow text-xs font-semibold uppercase tracking-wide mb-1">Seu IIH neste desafio</p>
          <p class="text-4xl font-extrabold">${Math.round(r.iih_total)}<span class="text-lg text-white/60">/100</span></p>
        </div>
        <div class="text-center">
          <div class="tier-medal" style="background:${selo.gradiente}; color:${selo.cor};"><i class="fa-solid fa-medal"></i></div>
          <p class="text-xs font-semibold text-white/80">Selo ${escapeHtml(r.selo)}</p>
        </div>
      </div>
      <div class="p-6 sm:p-8">
        ${r.pontos_ganhos > 0 ? `<div class="rounded-xl border p-4 mb-6 flex items-center gap-3" style="background:var(--hh-yellow-light); border-color:rgba(224,168,0,0.35);">
          <i class="fa-solid fa-star text-brand-yellow-dark text-lg"></i>
          <p class="text-sm text-slate-800"><strong>+${r.pontos_ganhos} Pontos HACK</strong> conquistados por esta equipe (nível ${escapeHtml(state.sessao.desafio.nivel || '—')}). Eles contam para o ranking geral.</p>
        </div>` : ''}
        <div class="space-y-5 mb-8">
          <div class="dim-result-row">
            <p class="text-sm font-medium text-slate-700">Compreensão do Problema</p>
            <p class="text-sm font-semibold text-slate-900">${Math.round(r.nota_compreensao)}/10</p>
            <div class="dim-bar-track col-span-2"><div class="dim-bar-fill" style="width:${(r.nota_compreensao / 10) * 100}%"></div></div>
          </div>
          <div class="dim-result-row">
            <p class="text-sm font-medium text-slate-700">Impacto ODS</p>
            <p class="text-sm font-semibold text-slate-900">${Math.round(r.nota_ods)}/40</p>
            <div class="dim-bar-track col-span-2"><div class="dim-bar-fill" style="width:${(r.nota_ods / 40) * 100}%"></div></div>
          </div>
          <div class="dim-result-row">
            <p class="text-sm font-medium text-slate-700">Planejamento</p>
            <p class="text-sm font-semibold text-slate-900">${Math.round(r.nota_planejamento)}/25</p>
            <div class="dim-bar-track col-span-2"><div class="dim-bar-fill" style="width:${(r.nota_planejamento / 25) * 100}%"></div></div>
          </div>
          <div class="dim-result-row">
            <p class="text-sm font-medium text-slate-700">Ferramentas</p>
            <p class="text-sm font-semibold text-slate-900">${Math.round(r.nota_ferramentas)}/25</p>
            <div class="dim-bar-track col-span-2"><div class="dim-bar-fill" style="width:${(r.nota_ferramentas / 25) * 100}%"></div></div>
          </div>
        </div>
        ${odsTags ? `<p class="font-semibold text-slate-900 mb-3 text-sm">ODS impactados pela solução escolhida:</p><div class="flex flex-wrap gap-2 mb-6">${odsTags}</div>` : ''}
        <div class="rounded-xl bg-slate-50 border border-slate-100 p-5 flex items-center gap-4">
          <div class="tier-medal" style="background:${selo.gradiente}; color:${selo.cor}; margin:0;"><i class="fa-solid fa-medal"></i></div>
          <div>
            <p class="text-xs text-slate-500">Selo de Impacto</p>
            <p class="font-semibold text-slate-900">${selo.emoji} ${escapeHtml(r.selo)} — ${escapeHtml(selo.desc)}</p>
          </div>
        </div>
      </div>
    </div>
    <button id="btn-refazer" class="w-full py-3 rounded-lg font-semibold border border-slate-200 text-slate-600 hover:border-slate-300 mb-3"><i class="fa-solid fa-rotate-right mr-1"></i> Refazer este desafio</button>
    <button id="btn-voltar-lista-resultado" class="btn-accent w-full py-3 rounded-lg font-semibold">Voltar ao Banco HACK <i class="fa-solid fa-arrow-right ml-1"></i></button>
  `;
}

/* --------------------------------------------------------------------------
   Wiring das etapas
   -------------------------------------------------------------------------- */

function wireEtapaAtual() {
  const n = state.sessao.etapaAtual;
  const btnVoltarTopo = $('#btn-voltar-lista');
  if (btnVoltarTopo) {
    btnVoltarTopo.onclick = () => { state.sessao = null; renderLista(); showView('lista'); };
  }

  const btnVoltarEtapa = $('#btn-voltar-etapa');
  if (btnVoltarEtapa) btnVoltarEtapa.addEventListener('click', () => irParaEtapa(Math.max(1, n - 1)));

  if (n === 1) {
    $all('[data-causa-idx]').forEach(cb => {
      cb.checked = state.sessao.causasSelecionadas.includes(Number(cb.getAttribute('data-causa-idx')));
      cb.addEventListener('change', () => {
        const idx = Number(cb.getAttribute('data-causa-idx'));
        if (cb.checked) state.sessao.causasSelecionadas.push(idx);
        else state.sessao.causasSelecionadas = state.sessao.causasSelecionadas.filter(i => i !== idx);
      });
    });
    $('#btn-avancar-etapa').addEventListener('click', () => {
      if (state.sessao.causasSelecionadas.length === 0) {
        showToast('Selecionem pelo menos uma causa antes de avançar.', 'fa-solid fa-triangle-exclamation');
        return;
      }
      irParaEtapa(2);
    });
  } else if (n === 2) {
    $all('input[name="alternativa"]').forEach(r => {
      r.addEventListener('change', () => { state.sessao.alternativaId = r.value; });
    });
    const btnAvancar = $('#btn-avancar-etapa');
    if (btnAvancar) btnAvancar.addEventListener('click', () => {
      if (!state.sessao.alternativaId) {
        showToast('Escolham uma alternativa de solução antes de avançar.', 'fa-solid fa-triangle-exclamation');
        return;
      }
      irParaEtapa(3);
    });
  } else if (n === 3) {
    const contador = $('#contador-planejamento');
    $all('[data-planejamento-idx]').forEach(cb => {
      cb.addEventListener('change', () => {
        const idx = Number(cb.getAttribute('data-planejamento-idx'));
        if (cb.checked) {
          if (state.sessao.planejamentoSelecionado.length >= MAX_PLANEJAMENTO_SELECAO) {
            cb.checked = false;
            showToast(`Escolham no máximo ${MAX_PLANEJAMENTO_SELECAO} etapas.`, 'fa-solid fa-triangle-exclamation');
            return;
          }
          state.sessao.planejamentoSelecionado.push(idx);
        } else {
          state.sessao.planejamentoSelecionado = state.sessao.planejamentoSelecionado.filter(i => i !== idx);
        }
        contador.textContent = `${state.sessao.planejamentoSelecionado.length} de ${MAX_PLANEJAMENTO_SELECAO} selecionadas`;
      });
    });
    $('#btn-avancar-etapa').addEventListener('click', () => {
      if (state.sessao.planejamentoSelecionado.length !== MAX_PLANEJAMENTO_SELECAO) {
        showToast(`Selecionem exatamente ${MAX_PLANEJAMENTO_SELECAO} etapas de planejamento.`, 'fa-solid fa-triangle-exclamation');
        return;
      }
      irParaEtapa(4);
    });
  } else if (n === 4) {
    const contador = $('#contador-ferramentas');
    $all('[data-ferramenta-idx]').forEach(cb => {
      cb.addEventListener('change', () => {
        const idx = Number(cb.getAttribute('data-ferramenta-idx'));
        if (cb.checked) {
          if (state.sessao.ferramentasSelecionadas.length >= MAX_FERRAMENTAS_SELECAO) {
            cb.checked = false;
            showToast(`Escolham no máximo ${MAX_FERRAMENTAS_SELECAO} ferramentas.`, 'fa-solid fa-triangle-exclamation');
            return;
          }
          state.sessao.ferramentasSelecionadas.push(idx);
        } else {
          state.sessao.ferramentasSelecionadas = state.sessao.ferramentasSelecionadas.filter(i => i !== idx);
        }
        contador.textContent = `${state.sessao.ferramentasSelecionadas.length} de ${MAX_FERRAMENTAS_SELECAO} selecionadas`;
      });
    });
    const btnFinalizar = $('#btn-finalizar');
    btnFinalizar.addEventListener('click', async () => {
      if (state.sessao.ferramentasSelecionadas.length === 0) {
        showToast('Selecionem pelo menos 1 ferramenta antes de calcular o IIH.', 'fa-solid fa-triangle-exclamation');
        return;
      }
      btnFinalizar.disabled = true;
      const original = btnFinalizar.innerHTML;
      btnFinalizar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando...';
      try {
        await finalizarDesafio();
      } catch (err) {
        console.error(err);
        showToast('Erro ao calcular/salvar o resultado. Tente novamente.', 'fa-solid fa-triangle-exclamation');
        btnFinalizar.disabled = false;
        btnFinalizar.innerHTML = original;
      }
    });
  } else if (n === 5) {
    const btnRefazer = $('#btn-refazer');
    if (btnRefazer) btnRefazer.addEventListener('click', () => {
      const desafioId = state.sessao.desafio.id;
      abrirDesafio(desafioId, { reiniciar: true });
    });
    const btnVoltar = $('#btn-voltar-lista-resultado');
    if (btnVoltar) btnVoltar.addEventListener('click', () => { state.sessao = null; renderLista(); showView('lista'); });
  }
}

/* --------------------------------------------------------------------------
   Motor de cálculo do IIH
   -------------------------------------------------------------------------- */

function calcularNotaCompreensao(sessao) {
  const totalReal = sessao.causas.filter(c => c.real).length;
  if (totalReal === 0) return 10;
  let pontos = 0;
  sessao.causasSelecionadas.forEach(idx => {
    pontos += sessao.causas[idx].real ? 1 : -1;
  });
  const nota = (pontos / totalReal) * 10;
  return Math.max(0, Math.min(10, nota));
}

function calcularOds(alternativa) {
  const diretos = (alternativa.ods_diretos || []).length;
  const indiretos = (alternativa.ods_indiretos || []).length;
  const mult = MULTIPLICADOR_PROFUNDIDADE[alternativa.profundidade] || 1;
  const pontosBrutos = (diretos * 3 + indiretos * 1) * mult;
  const notaDimensao = Math.min(40, pontosBrutos);
  return { pontosBrutos, notaDimensao };
}

function calcularSelo(alternativa, pontosBrutosOds) {
  const prof = alternativa.profundidade;
  if (prof === 'Transformadora') return 'Diamante';
  if (prof === 'Sistêmica' && pontosBrutosOds > 25) return 'Ouro';
  if (prof === 'Sistêmica' && pontosBrutosOds >= 10) return 'Prata';
  return 'Bronze';
}

function pesosMatriz(matrizArray, listaFixa) {
  const map = {};
  listaFixa.forEach(item => { map[item] = 0; });
  (matrizArray || []).forEach(entry => {
    const chave = entry.etapa || entry.ferramenta;
    const pts = PESO_CLASSIFICACAO[entry.classificacao] ?? 0;
    if (chave in map) map[chave] = pts;
  });
  return map;
}

function calcularNotaPorMatriz(selecionadosTextos, mapaPesos, topN) {
  const pesosOrdenados = Object.values(mapaPesos).sort((a, b) => b - a);
  const denom = pesosOrdenados.slice(0, topN).reduce((s, v) => s + v, 0);
  const numerador = selecionadosTextos.reduce((s, texto) => s + (mapaPesos[texto] || 0), 0);
  if (denom === 0) return 0;
  return Math.max(0, Math.min(25, (numerador / denom) * 25));
}

async function finalizarDesafio() {
  const sessao = state.sessao;
  const alternativa = state.alternativas.find(a => a.id === sessao.alternativaId);
  if (!alternativa) throw new Error('Alternativa não encontrada');

  const notaCompreensao = calcularNotaCompreensao(sessao);
  const { pontosBrutos, notaDimensao: notaOds } = calcularOds(alternativa);
  const selo = calcularSelo(alternativa, pontosBrutos);

  const mapaPlanejamento = pesosMatriz(alternativa.planejamento_pesos, ETAPAS_PLANEJAMENTO);
  const mapaFerramentas = pesosMatriz(alternativa.ferramentas_pesos, FERRAMENTAS);

  const planejamentoTextos = sessao.planejamentoSelecionado.map(i => ETAPAS_PLANEJAMENTO[i]);
  const ferramentasTextos = sessao.ferramentasSelecionadas.map(i => FERRAMENTAS[i]);

  const notaPlanejamento = calcularNotaPorMatriz(planejamentoTextos, mapaPlanejamento, MAX_PLANEJAMENTO_SELECAO);
  const notaFerramentas = calcularNotaPorMatriz(ferramentasTextos, mapaFerramentas, MAX_FERRAMENTAS_SELECAO);

  const iihTotal = notaCompreensao + notaOds + notaPlanejamento + notaFerramentas;

  const causasTextos = sessao.causasSelecionadas.map(i => sessao.causas[i].texto);

  const nivelDesafio = sessao.desafio.nivel;
  const pontosDoNivel = (NIVEL_INFO[nivelDesafio] || {}).pontos || 0;
  const jaTinhaPontos = !!sessao.submissaoExistente;
  const pontosGanhos = jaTinhaPontos ? (sessao.submissaoExistente.pontos_ganhos || 0) : pontosDoNivel;

  const payload = {
    desafio_id: sessao.desafio.id,
    equipe_id: state.equipeAtiva.id,
    clube_id: state.clube.id,
    alternativa_id: alternativa.id,
    causas_selecionadas: causasTextos,
    planejamento_selecionado: planejamentoTextos,
    ferramentas_selecionadas: ferramentasTextos,
    nota_compreensao: Math.round(notaCompreensao * 10) / 10,
    nota_ods: Math.round(notaOds * 10) / 10,
    nota_planejamento: Math.round(notaPlanejamento * 10) / 10,
    nota_ferramentas: Math.round(notaFerramentas * 10) / 10,
    iih_total: Math.round(iihTotal * 10) / 10,
    selo,
    nivel_desafio: nivelDesafio || null,
    pontos_ganhos: pontosGanhos,
  };

  let updated;
  if (sessao.submissaoExistente) {
    updated = await api(`hack_submissoes/${sessao.submissaoExistente.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    state.submissoes = state.submissoes.map(s => s.id === updated.id ? updated : s);
  } else {
    updated = await api('hack_submissoes', { method: 'POST', body: JSON.stringify(payload) });
    state.submissoes.push(updated);
  }

  sessao.submissaoExistente = updated;
  sessao.resultado = resultadoFromSubmissao(updated);

  const msgPontos = !jaTinhaPontos && pontosGanhos > 0 ? ` (+${pontosGanhos} Pontos HACK)` : '';
  showToast(`🎉 Desafio concluído! Selo ${selo} — IIH ${payload.iih_total}/100${msgPontos}`);
  irParaEtapa(5);
}

/* --------------------------------------------------------------------------
   Botões estáticos / init
   -------------------------------------------------------------------------- */

function setupStaticButtons() {
  $('#btn-trocar-equipe').addEventListener('click', () => {
    if (!confirm('Deseja trocar de equipe? Você poderá voltar a esta equipe depois.')) return;
    localStorage.removeItem(STORAGE_EQUIPE_KEY);
    location.reload();
  });
  const btnTentar = $('#btn-tentar-novamente');
  if (btnTentar) btnTentar.addEventListener('click', () => init());
}

document.addEventListener('DOMContentLoaded', () => {
  setupStaticButtons();
  init();
});
