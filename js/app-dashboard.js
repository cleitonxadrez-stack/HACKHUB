/* ==========================================================================
   HACK HUB® — Dashboard da Equipe (app funcional)
   Visão agregada: IIH atual/histórico (Discovery), missão em andamento,
   pontos por módulo (Discovery + Banco HACK + Builder) e posição no
   ranking geral do Ecossistema HACK BRASIL.
   Reaproveita a mesma lógica de pontosDaEquipe() do Painel do Clube/Ranking.
   ========================================================================== */

const STORAGE_CLUBE_KEY = 'hh_clube_ativo_id';
const STORAGE_EQUIPE_KEY = 'hh_equipe_discovery_id';

const state = {
  clube: null,
  equipes: [],
  equipeAtiva: null,
  projetoDiscovery: null,
  hackSubmissoes: [],
  builderConclusoes: [],
  rankingPosicao: null,
};

const MISSOES_TITULOS = {
  1: 'Missão 1 · Conhecendo a metodologia',
  2: 'Missão 2 · Problemas na escola',
  3: 'Missão 3 · Problemas da comunidade',
  4: 'Missão 4 · Problemas do município',
  5: 'Missão 5 · Desafios de empresas',
  6: 'Missão 6 · Qual problema vamos resolver?',
  7: 'Missão 7 · Pesquisa e entrevistas',
  8: 'Missão 8 · Criando a solução e o MVP',
  9: 'Missão 9 · Testando com usuários',
  10: 'Missão 10 · Hora do pitch',
};

const SELO_INFO = {
  'Bronze': { emoji: '🥉', bg: '#CD7F32' },
  'Prata': { emoji: '🥈', bg: '#9CA3AF' },
  'Ouro': { emoji: '🥇', bg: '#D4A017' },
  'Diamante': { emoji: '💎', bg: '#6C7BFA' },
};

/* --------------------------------------------------------------------------
   Helpers gerais
   -------------------------------------------------------------------------- */

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function showToast(msg, icon = 'fa-solid fa-circle-check') {
  const toast = $('#toast');
  toast.innerHTML = `<i class="${icon} text-brand-yellow"></i> ${msg}`;
  toast.classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200);
}

async function api(path, opts = {}) {
  const res = await fetch(`../tables/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const err = new Error(`Erro na API: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** Busca todas as páginas de uma tabela (a API pagina por padrão). */
async function apiAll(tableName, limit = 500) {
  let page = 1;
  let all = [];
  while (true) {
    const res = await api(`${tableName}?page=${page}&limit=${limit}`);
    const rows = res.data || [];
    all = all.concat(rows);
    if (rows.length < limit || all.length >= (res.total || all.length)) break;
    page += 1;
    if (page > 20) break; // guarda de segurança
  }
  return all;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

/* --------------------------------------------------------------------------
   Alternância de views
   -------------------------------------------------------------------------- */

const VIEWS = ['loading', 'erro', 'sem-clube', 'sem-equipe', 'escolher-equipe', 'dashboard'];

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
    const clube = await api(`hack_clubes/${clubeId}`);
    if (!clube || clube.deleted) {
      localStorage.removeItem(STORAGE_CLUBE_KEY);
      return showView('sem-clube');
    }
    state.clube = clube;

    const equipesRes = await api(`equipes?limit=200`);
    const equipesAprovadas = (equipesRes.data || []).filter(eq => eq.clube_id === clubeId && eq.status === 'Aprovada');
    state.equipes = equipesAprovadas;

    if (equipesAprovadas.length === 0) return showView('sem-equipe');

    const equipeSalvaId = localStorage.getItem(STORAGE_EQUIPE_KEY);
    const equipeSalva = equipesAprovadas.find(eq => eq.id === equipeSalvaId);

    if (equipeSalva) {
      await selecionarEquipe(equipeSalva);
    } else if (equipesAprovadas.length === 1) {
      await selecionarEquipe(equipesAprovadas[0]);
    } else {
      renderEscolherEquipe();
      showView('escolher-equipe');
    }
  } catch (err) {
    console.error(err);
    if (err.status === 404) {
      localStorage.removeItem(STORAGE_CLUBE_KEY);
      return showView('sem-clube');
    }
    showView('erro');
  }
}

function renderEscolherEquipe() {
  const wrap = $('#lista-escolher-equipe');
  wrap.innerHTML = state.equipes.map(eq => `
    <button data-equipe-id="${eq.id}" class="app-card w-full text-left flex items-center gap-4 hover:border-brand-yellow transition-colors" style="border:2px solid transparent;">
      <div class="avatar-img w-11 h-11 flex items-center justify-center text-white shrink-0" style="background:#101010;"><i class="fa-solid fa-shield-halved"></i></div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-slate-900 truncate">${escapeHtml(eq.nome_equipe)}</p>
        ${eq.lema ? `<p class="text-xs text-slate-500 italic truncate">"${escapeHtml(eq.lema)}"</p>` : ''}
      </div>
      <i class="fa-solid fa-chevron-right text-slate-300"></i>
    </button>
  `).join('');
  $all('[data-equipe-id]', wrap).forEach(btn => {
    btn.addEventListener('click', async () => {
      const eq = state.equipes.find(e => e.id === btn.getAttribute('data-equipe-id'));
      showView('loading');
      try {
        await selecionarEquipe(eq);
      } catch (err) {
        console.error(err);
        showView('erro');
      }
    });
  });
}

async function selecionarEquipe(equipe) {
  state.equipeAtiva = equipe;
  localStorage.setItem(STORAGE_EQUIPE_KEY, equipe.id);
  $('#topbar-equipe-name').textContent = equipe.nome_equipe;
  $('#topbar-equipe-name').classList.remove('hidden');
  $('#btn-trocar-equipe').classList.toggle('hidden', state.equipes.length <= 1);

  await carregarDadosEquipe(equipe);
  renderDashboard();
  showView('dashboard');
}

/* --------------------------------------------------------------------------
   Carregamento agregado de dados (Discovery + Banco HACK + Builder + Ranking)
   -------------------------------------------------------------------------- */

async function carregarDadosEquipe(equipe) {
  const [projetosRes, submissoesRes, conclusoesRes] = await Promise.all([
    api(`projetos_discovery?limit=200`),
    api(`hack_submissoes?limit=500`),
    api(`builder_conclusoes?limit=500`),
  ]);
  state.projetoDiscovery = (projetosRes.data || []).find(p => p.equipe_id === equipe.id) || null;
  state.hackSubmissoes = (submissoesRes.data || []).filter(s => s.equipe_id === equipe.id);
  state.builderConclusoes = (conclusoesRes.data || []).filter(c => c.equipe_id === equipe.id);

  // Ranking geral (mesma lógica de js/app-ranking.js): soma Pontos de Impacto (Discovery)
  // + Pontos HACK (Banco HACK) de TODAS as equipes do ecossistema, para achar a posição desta equipe.
  const [todosProjetos, todasSubmissoes, todasEquipes] = await Promise.all([
    apiAll('projetos_discovery'),
    apiAll('hack_submissoes'),
    apiAll('equipes'),
  ]);
  const ranking = todasEquipes.map(eq => {
    const pontosDiscovery = todosProjetos.filter(p => p.equipe_id === eq.id).reduce((s, p) => s + (p.pontos_impacto || 0), 0);
    const pontosBancoHack = todasSubmissoes.filter(s => s.equipe_id === eq.id).reduce((s, sub) => s + (sub.pontos_ganhos || 0), 0);
    return { equipeId: eq.id, total: pontosDiscovery + pontosBancoHack };
  }).sort((a, b) => b.total - a.total);
  const posicao = ranking.findIndex(r => r.equipeId === equipe.id);
  state.rankingPosicao = posicao >= 0 ? posicao + 1 : null;
  state.rankingTotalEquipes = ranking.length;
}

/* --------------------------------------------------------------------------
   Cálculos de pontos (mesma fórmula do Painel do Clube / Ranking)
   -------------------------------------------------------------------------- */

function pontosDiscovery() {
  return state.projetoDiscovery ? (state.projetoDiscovery.pontos_impacto || 0) : 0;
}
function pontosBancoHack() {
  return state.hackSubmissoes.reduce((s, sub) => s + (sub.pontos_ganhos || 0), 0);
}
function pontosBuilder() {
  return state.builderConclusoes.reduce((s, c) => s + (c.pontos || 0), 0);
}

/* --------------------------------------------------------------------------
   Render: Dashboard
   -------------------------------------------------------------------------- */

function renderDashboard() {
  $('#equipe-nome').textContent = state.equipeAtiva.nome_equipe;
  $('#equipe-escola').textContent = state.clube ? (state.clube.escola || state.clube.nome_clube) : '';

  $('#ranking-posicao').textContent = state.rankingPosicao ? `#${state.rankingPosicao}` : '—';

  const pd = pontosDiscovery();
  const pb = pontosBancoHack();
  const pk = pontosBuilder();
  $('#stat-pontos-discovery').textContent = pd;
  $('#stat-pontos-banco-hack').textContent = pb;
  $('#stat-pontos-builder').textContent = pk;
  $('#stat-pontos-total').textContent = pd + pb + pk;

  renderDiscovery();

  $('#banco-hack-qtd').textContent = state.hackSubmissoes.length;
  $('#builder-qtd').textContent = state.builderConclusoes.length;
}

function renderDiscovery() {
  const projeto = state.projetoDiscovery;
  if (!projeto) {
    $('#discovery-sem-projeto').classList.remove('hidden');
    $('#discovery-conteudo').classList.add('hidden');
    return;
  }
  $('#discovery-sem-projeto').classList.add('hidden');
  $('#discovery-conteudo').classList.remove('hidden');

  const concluidas = (projeto.missoes_concluidas || []).length;
  const pct = Math.round((concluidas / 10) * 100);
  $('#discovery-progress-fill').style.width = `${pct}%`;
  $('#discovery-missoes-concluidas').textContent = concluidas;

  if (concluidas >= 10) {
    $('#discovery-missao-atual-card').classList.add('hidden');
  } else {
    $('#discovery-missao-atual-card').classList.remove('hidden');
    const proxima = (projeto.missao_atual || 1);
    $('#discovery-missao-atual-titulo').textContent = MISSOES_TITULOS[proxima] || `Missão ${proxima}`;
  }

  if (projeto.avaliacao_status === 'Avaliado' && projeto.iih_total !== undefined && projeto.iih_total !== null) {
    const selo = SELO_INFO[projeto.iih_selo] || SELO_INFO['Bronze'];
    $('#discovery-iih-card').classList.remove('hidden');
    $('#discovery-selo-emoji').textContent = selo.emoji;
    $('#discovery-selo-emoji').style.background = selo.bg;
    $('#discovery-iih-total').textContent = `${projeto.iih_total}/100 — ${projeto.iih_selo || 'Bronze'}`;
  } else {
    $('#discovery-iih-card').classList.add('hidden');
  }
}

/* --------------------------------------------------------------------------
   Botões estáticos / init
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  $('#btn-tentar-novamente').addEventListener('click', init);
  $('#btn-trocar-equipe').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_EQUIPE_KEY);
    renderEscolherEquipe();
    showView('escolher-equipe');
  });
  init();
});
