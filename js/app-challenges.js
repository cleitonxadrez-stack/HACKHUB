/* ==========================================================================
   HACK HUB® — HACK Challenges (app funcional, lado das equipes)
   Mural de desafios de empresas parceiras: aceitar, desenvolver e enviar
   proposta, acompanhar avaliação/pagamento.
   Persistência via Table API (tables/hack_challenges_desafios,
   hack_challenges_propostas, empresas_parceiras)
   ========================================================================== */

const STORAGE_CLUBE_KEY = 'hh_clube_ativo_id';
const STORAGE_EQUIPE_KEY = 'hh_equipe_discovery_id';

const state = {
  clube: null,
  equipes: [],
  equipeAtiva: null,
  empresas: [],
  desafios: [],
  propostas: [],
  filtroCategoria: 'Todos',
  desafioAtual: null,
};

const CATEGORIAS = ['Todos', 'Tecnologia', 'Sustentabilidade', 'Marketing', 'Operações', 'Produto', 'Comunicação', 'Outro'];

const STATUS_INFO = {
  'Aceito': { label: 'Aceito — em desenvolvimento', cor: '#101010', bg: '#F1F5F9', icone: 'fa-solid fa-play' },
  'Proposta enviada': { label: 'Proposta enviada — aguardando avaliação', cor: '#92600A', bg: '#FFF3CC', icone: 'fa-solid fa-paper-plane' },
  'Aprovada': { label: 'Proposta aprovada!', cor: '#166534', bg: '#DCFCE7', icone: 'fa-solid fa-circle-check' },
  'Rejeitada': { label: 'Proposta não selecionada', cor: '#991B1B', bg: '#FEE2E2', icone: 'fa-solid fa-circle-xmark' },
  'Paga': { label: 'Premiação paga!', cor: '#4A2E00', bg: '#FFE27A', icone: 'fa-solid fa-sack-dollar' },
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

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function formatMoeda(valor) {
  const n = Number(valor) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function empresaById(id) { return state.empresas.find(e => e.id === id) || null; }
function desafioById(id) { return state.desafios.find(d => d.id === id) || null; }

/* --------------------------------------------------------------------------
   Alternância de views
   -------------------------------------------------------------------------- */

const VIEWS = ['loading', 'erro', 'sem-clube', 'sem-equipe', 'escolher-equipe', 'mural', 'minhas-propostas', 'desafio'];

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

  await carregarDados(equipe);
  renderFiltros();
  renderMural();
  showView('mural');
}

/* --------------------------------------------------------------------------
   Carregamento de dados
   -------------------------------------------------------------------------- */

async function carregarDados(equipe) {
  const [empresasRes, desafiosRes, propostasRes] = await Promise.all([
    api(`empresas_parceiras?limit=200`),
    api(`hack_challenges_desafios?limit=200`),
    api(`hack_challenges_propostas?limit=500`),
  ]);
  state.empresas = empresasRes.data || [];
  state.desafios = (desafiosRes.data || []).filter(d => d.status === 'Aberto');
  state.propostas = (propostasRes.data || []).filter(p => p.equipe_id === equipe.id);
}

function propostaDoDesafio(desafioId) {
  return state.propostas.find(p => p.desafio_id === desafioId) || null;
}

/* --------------------------------------------------------------------------
   Render: Filtros de categoria
   -------------------------------------------------------------------------- */

function renderFiltros() {
  const wrap = $('#filtros-categoria');
  wrap.innerHTML = CATEGORIAS.map(cat => `
    <button data-cat="${cat}" class="badge ${state.filtroCategoria === cat ? 'badge-yellow' : 'badge-dark'}" style="cursor:pointer;">${escapeHtml(cat)}</button>
  `).join('');
  $all('[data-cat]', wrap).forEach(btn => {
    btn.addEventListener('click', () => {
      state.filtroCategoria = btn.getAttribute('data-cat');
      renderFiltros();
      renderMural();
    });
  });
  $('#qtd-minhas-propostas').textContent = state.propostas.length;
}

/* --------------------------------------------------------------------------
   Render: Mural de desafios
   -------------------------------------------------------------------------- */

function renderMural() {
  const desafiosFiltrados = state.filtroCategoria === 'Todos'
    ? state.desafios
    : state.desafios.filter(d => d.categoria === state.filtroCategoria);

  const wrap = $('#lista-desafios');
  $('#lista-desafios-vazia').classList.toggle('hidden', desafiosFiltrados.length > 0);
  wrap.classList.toggle('hidden', desafiosFiltrados.length === 0);

  wrap.innerHTML = desafiosFiltrados.map(d => {
    const empresa = empresaById(d.empresa_id);
    const proposta = propostaDoDesafio(d.id);
    return `
      <button data-desafio-id="${d.id}" class="app-card text-left hover:border-brand-yellow transition-colors flex flex-col" style="border:2px solid transparent;">
        <div class="flex items-center justify-between mb-3">
          <span class="badge badge-dark">${escapeHtml(d.categoria || 'Outro')}</span>
          ${proposta ? `<span class="badge" style="background:${STATUS_INFO[proposta.status]?.bg || '#F1F5F9'};color:${STATUS_INFO[proposta.status]?.cor || '#101010'};"><i class="${STATUS_INFO[proposta.status]?.icone || 'fa-solid fa-circle'} mr-1"></i>${escapeHtml(proposta.status)}</span>` : ''}
        </div>
        <p class="font-semibold text-slate-900 mb-1">${escapeHtml(d.titulo)}</p>
        <p class="text-xs text-slate-500 mb-4 flex-1">${escapeHtml(empresa ? empresa.nome_empresa : 'Empresa parceira')}</p>
        <div class="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
          <span class="font-display font-bold text-brand-yellow-dark">${formatMoeda(d.valor_premiacao)}</span>
          <span class="text-xs text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${escapeHtml(d.prazo || '—')}</span>
        </div>
      </button>
    `;
  }).join('');

  $all('[data-desafio-id]', wrap).forEach(btn => {
    btn.addEventListener('click', () => abrirDesafio(btn.getAttribute('data-desafio-id')));
  });
}

/* --------------------------------------------------------------------------
   Render: Detalhe do desafio / aceitar / enviar proposta
   -------------------------------------------------------------------------- */

function abrirDesafio(desafioId) {
  const desafio = desafioById(desafioId);
  state.desafioAtual = desafio;
  const empresa = empresaById(desafio.empresa_id);
  const proposta = propostaDoDesafio(desafioId);

  $('#desafio-conteudo').innerHTML = `
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-3">
        <span class="badge badge-dark">${escapeHtml(desafio.categoria || 'Outro')}</span>
        ${proposta ? statusBadgeHTML(proposta.status) : ''}
      </div>
      <h1 class="font-display text-2xl font-bold text-slate-900 mb-1">${escapeHtml(desafio.titulo)}</h1>
      <p class="text-sm text-slate-500">${escapeHtml(empresa ? empresa.nome_empresa : 'Empresa parceira')}</p>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="app-card text-center">
        <p class="font-display text-xl font-bold text-brand-yellow-dark">${formatMoeda(desafio.valor_premiacao)}</p>
        <p class="text-xs text-slate-500 uppercase tracking-wide mt-1">Premiação</p>
      </div>
      <div class="app-card text-center">
        <p class="font-display text-xl font-bold text-slate-900">${escapeHtml(desafio.prazo || '—')}</p>
        <p class="text-xs text-slate-500 uppercase tracking-wide mt-1">Prazo</p>
      </div>
    </div>

    <div class="app-card mb-6">
      <p class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Descrição do desafio</p>
      <p class="text-sm text-slate-600 whitespace-pre-line">${escapeHtml(desafio.descricao || '—')}</p>
    </div>

    <div id="desafio-acao-area"></div>
  `;

  renderAcaoDesafio(desafio, proposta);
  showView('desafio');
}

function statusBadgeHTML(status) {
  const info = STATUS_INFO[status] || STATUS_INFO['Aceito'];
  return `<span class="badge" style="background:${info.bg};color:${info.cor};"><i class="${info.icone} mr-1"></i>${escapeHtml(status)}</span>`;
}

function renderAcaoDesafio(desafio, proposta) {
  const area = $('#desafio-acao-area');

  if (!proposta) {
    // Não aceitou ainda
    area.innerHTML = `
      <button id="btn-aceitar-desafio" class="btn-accent w-full py-3 rounded-lg font-semibold"><i class="fa-solid fa-hand-point-up mr-2"></i>Aceitar desafio para minha equipe</button>
    `;
    $('#btn-aceitar-desafio').addEventListener('click', handleAceitarDesafio);
    return;
  }

  if (proposta.status === 'Aceito') {
    // Aceitou, ainda não enviou proposta
    area.innerHTML = `
      <div class="rounded-xl p-4 mb-4" style="background:#F1F5F9;">
        <p class="text-sm text-slate-700"><i class="fa-solid fa-circle-info mr-1.5 text-slate-500"></i>Sua equipe aceitou este desafio. Desenvolvam a solução e enviem a proposta abaixo.</p>
      </div>
      <form id="form-proposta" class="space-y-4">
        <div>
          <label class="form-label">Descreva a proposta/solução desenvolvida *</label>
          <textarea name="proposta_texto" required rows="6" maxlength="4000" class="form-textarea" placeholder="Explique a solução da equipe para este desafio..."></textarea>
        </div>
        <div>
          <label class="form-label">Link do pitch/protótipo/demo <span class="text-slate-400 font-normal">(opcional)</span></label>
          <input type="text" name="proposta_anexo_url" maxlength="500" class="form-input" placeholder="Ex.: link de vídeo, apresentação ou protótipo">
        </div>
        <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold"><i class="fa-solid fa-paper-plane mr-2"></i>Enviar proposta para avaliação</button>
      </form>
    `;
    $('#form-proposta').addEventListener('submit', handleEnviarProposta);
    return;
  }

  if (proposta.status === 'Proposta enviada') {
    area.innerHTML = `
      <div class="app-card">
        <p class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Proposta enviada pela equipe</p>
        <p class="text-sm text-slate-600 whitespace-pre-line mb-3">${escapeHtml(proposta.proposta_texto || '—')}</p>
        ${proposta.proposta_anexo_url ? `<p class="text-xs text-slate-400"><i class="fa-solid fa-link mr-1"></i>${escapeHtml(proposta.proposta_anexo_url)}</p>` : ''}
      </div>
      <div class="rounded-xl p-4 mt-4" style="background:#FFF3CC;">
        <p class="text-sm text-slate-700"><i class="fa-solid fa-hourglass-half mr-1.5 text-brand-yellow-dark"></i>Aguardando avaliação da empresa. Você será notificado quando houver retorno.</p>
      </div>
    `;
    return;
  }

  // Aprovada / Rejeitada / Paga — mostra avaliação final
  area.innerHTML = `
    <div class="app-card mb-4">
      <p class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Proposta enviada pela equipe</p>
      <p class="text-sm text-slate-600 whitespace-pre-line mb-3">${escapeHtml(proposta.proposta_texto || '—')}</p>
      ${proposta.proposta_anexo_url ? `<p class="text-xs text-slate-400"><i class="fa-solid fa-link mr-1"></i>${escapeHtml(proposta.proposta_anexo_url)}</p>` : ''}
    </div>
    <div class="rounded-2xl p-5" style="background:${proposta.status === 'Rejeitada' ? '#FEE2E2' : '#101010'};">
      <div class="flex items-center gap-4 flex-wrap justify-between">
        <div>
          <p class="font-semibold text-sm mb-1" style="color:${proposta.status === 'Rejeitada' ? '#991B1B' : '#FFC800'};">Avaliação da empresa</p>
          ${proposta.avaliacao_nota !== undefined && proposta.avaliacao_nota !== null ? `<p class="font-display text-2xl font-bold" style="color:${proposta.status === 'Rejeitada' ? '#101010' : '#fff'};">${proposta.avaliacao_nota}/10</p>` : ''}
        </div>
        ${proposta.status === 'Paga' ? `<div class="text-right"><p class="font-display text-2xl font-bold text-brand-yellow">${formatMoeda(proposta.valor_pago)}</p><p class="text-xs text-white/70 uppercase tracking-wide">pago à equipe</p></div>` : ''}
      </div>
      ${proposta.avaliacao_feedback ? `<p class="text-sm mt-3" style="color:${proposta.status === 'Rejeitada' ? '#7F1D1D' : '#E2E8F0'};">${escapeHtml(proposta.avaliacao_feedback)}</p>` : ''}
    </div>
  `;
}

async function handleAceitarDesafio() {
  const btn = $('#btn-aceitar-desafio');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Aceitando...';
  try {
    const payload = {
      desafio_id: state.desafioAtual.id,
      equipe_id: state.equipeAtiva.id,
      clube_id: state.clube.id,
      status: 'Aceito',
    };
    const created = await api('hack_challenges_propostas', { method: 'POST', body: JSON.stringify(payload) });
    state.propostas.push(created);
    showToast('🎉 Desafio aceito! Agora desenvolvam a solução e enviem a proposta.');
    renderFiltros();
    abrirDesafio(state.desafioAtual.id);
  } catch (err) {
    console.error(err);
    showToast('Não foi possível aceitar o desafio. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-hand-point-up mr-2"></i>Aceitar desafio para minha equipe';
  }
}

async function handleEnviarProposta(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());
  const proposta = propostaDoDesafio(state.desafioAtual.id);

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

  try {
    const payload = {
      status: 'Proposta enviada',
      proposta_texto: (data.proposta_texto || '').slice(0, 4000),
      proposta_anexo_url: (data.proposta_anexo_url || '').slice(0, 500),
    };
    const updated = await api(`hack_challenges_propostas/${proposta.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
    const idx = state.propostas.findIndex(p => p.id === proposta.id);
    state.propostas[idx] = { ...state.propostas[idx], ...updated };
    showToast('🚀 Proposta enviada! Agora é aguardar a avaliação da empresa.');
    renderMural();
    abrirDesafio(state.desafioAtual.id);
  } catch (err) {
    console.error(err);
    showToast('Não foi possível enviar a proposta. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i>Enviar proposta para avaliação';
  }
}

/* --------------------------------------------------------------------------
   Render: Minhas propostas (histórico completo, inclusive desafios encerrados)
   -------------------------------------------------------------------------- */

async function abrirMinhasPropostas() {
  showView('loading');
  try {
    // Recarrega TODOS os desafios (não só abertos) para mostrar histórico completo
    const desafiosRes = await api(`hack_challenges_desafios?limit=200`);
    const todosDesafios = desafiosRes.data || [];

    const wrap = $('#lista-minhas-propostas');
    $('#lista-minhas-propostas-vazia').classList.toggle('hidden', state.propostas.length > 0);

    wrap.innerHTML = state.propostas.map(p => {
      const desafio = todosDesafios.find(d => d.id === p.desafio_id);
      const empresa = desafio ? empresaById(desafio.empresa_id) : null;
      const info = STATUS_INFO[p.status] || STATUS_INFO['Aceito'];
      return `
        <div class="app-card">
          <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
            <p class="font-semibold text-slate-900">${escapeHtml(desafio ? desafio.titulo : 'Desafio')}</p>
            <span class="badge" style="background:${info.bg};color:${info.cor};"><i class="${info.icone} mr-1"></i>${escapeHtml(p.status)}</span>
          </div>
          <p class="text-xs text-slate-500 mb-3">${escapeHtml(empresa ? empresa.nome_empresa : 'Empresa parceira')}</p>
          ${p.status === 'Paga' ? `<p class="text-sm font-semibold text-brand-yellow-dark">${formatMoeda(p.valor_pago)} pago à equipe</p>` : ''}
        </div>
      `;
    }).join('');

    showView('minhas-propostas');
  } catch (err) {
    console.error(err);
    showView('erro');
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
  $('#btn-ver-minhas-propostas').addEventListener('click', abrirMinhasPropostas);
  $('#btn-voltar-mural-1').addEventListener('click', () => { renderMural(); showView('mural'); });
  $('#btn-voltar-mural-2').addEventListener('click', () => { renderMural(); showView('mural'); });
  init();
});
