/* ==========================================================================
   HACK HUB® — Painel da Empresa Parceira (app funcional)
   Publicar desafios (HACK Challenges), receber propostas das equipes,
   avaliar e registrar pagamento da premiação.
   Modelo de confiança (sem login/senha), igual ao padrão de Avaliação do
   Professor Mentor usado no Discovery — a empresa escolhe/cadastra seu
   perfil e atua diretamente.
   Persistência via Table API (tables/empresas_parceiras,
   hack_challenges_desafios, hack_challenges_propostas)
   ========================================================================== */

const STORAGE_EMPRESA_KEY = 'hh_empresa_ativa_id';

const state = {
  empresas: [],
  empresaAtiva: null,
  desafios: [],
  propostas: [],
  equipesCache: {},
  clubesCache: {},
  desafioAtual: null,
};

const CATEGORIAS_LABEL = {
  'Tecnologia': 'Tecnologia', 'Sustentabilidade': 'Sustentabilidade', 'Marketing': 'Marketing',
  'Operações': 'Operações', 'Produto': 'Produto', 'Comunicação': 'Comunicação', 'Outro': 'Outro',
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

const STATUS_INFO = {
  'Aceito': { label: 'Aceito — em desenvolvimento', cor: '#101010', bg: '#F1F5F9', icone: 'fa-solid fa-play' },
  'Proposta enviada': { label: 'Proposta enviada — aguardando avaliação', cor: '#92600A', bg: '#FFF3CC', icone: 'fa-solid fa-paper-plane' },
  'Aprovada': { label: 'Aprovada', cor: '#166534', bg: '#DCFCE7', icone: 'fa-solid fa-circle-check' },
  'Rejeitada': { label: 'Rejeitada', cor: '#991B1B', bg: '#FEE2E2', icone: 'fa-solid fa-circle-xmark' },
  'Paga': { label: 'Paga', cor: '#4A2E00', bg: '#FFE27A', icone: 'fa-solid fa-sack-dollar' },
};

/* --------------------------------------------------------------------------
   Alternância de views
   -------------------------------------------------------------------------- */

const VIEWS = ['loading', 'erro', 'entrar', 'dashboard', 'novo-desafio', 'desafio'];

function showView(name) {
  VIEWS.forEach(v => {
    const el = $(`#view-${v}`);
    if (el) el.classList.toggle('hidden', v !== name);
  });
}

/* --------------------------------------------------------------------------
   Inicialização
   -------------------------------------------------------------------------- */

async function init() {
  showView('loading');
  try {
    const empresasRes = await api('empresas_parceiras?limit=200');
    state.empresas = empresasRes.data || [];

    const empresaSalvaId = localStorage.getItem(STORAGE_EMPRESA_KEY);
    const empresaSalva = state.empresas.find(e => e.id === empresaSalvaId);

    if (empresaSalva) {
      await selecionarEmpresa(empresaSalva);
    } else {
      renderEntrar();
      showView('entrar');
    }
  } catch (err) {
    console.error(err);
    showView('erro');
  }
}

function renderEntrar() {
  const wrap = $('#lista-empresas-existentes');
  if (state.empresas.length === 0) {
    wrap.innerHTML = '';
    return;
  }
  wrap.innerHTML = `<p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Empresas já cadastradas</p>` +
    state.empresas.map(emp => `
      <button data-empresa-id="${emp.id}" class="app-card w-full text-left flex items-center gap-4 hover:border-brand-yellow transition-colors" style="border:2px solid transparent;">
        <div class="avatar-img w-11 h-11 flex items-center justify-center text-white shrink-0" style="background:#101010;"><i class="fa-solid fa-building"></i></div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-900 truncate">${escapeHtml(emp.nome_empresa)}</p>
          <p class="text-xs text-slate-500 truncate">${escapeHtml(emp.contato_nome || '')}</p>
        </div>
        <i class="fa-solid fa-chevron-right text-slate-300"></i>
      </button>
    `).join('');
  $all('[data-empresa-id]', wrap).forEach(btn => {
    btn.addEventListener('click', async () => {
      const emp = state.empresas.find(e => e.id === btn.getAttribute('data-empresa-id'));
      showView('loading');
      try {
        await selecionarEmpresa(emp);
      } catch (err) {
        console.error(err);
        showView('erro');
      }
    });
  });
}

async function handleCriarEmpresa(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cadastrando...';

  try {
    const payload = {
      nome_empresa: (data.nome_empresa || '').trim(),
      contato_nome: (data.contato_nome || '').trim(),
      contato_email: (data.contato_email || '').trim(),
      site: (data.site || '').trim(),
      logo_url: (data.logo_url || '').trim(),
      descricao: (data.descricao || '').trim(),
    };
    const created = await api('empresas_parceiras', { method: 'POST', body: JSON.stringify(payload) });
    state.empresas.push(created);
    showToast('🎉 Empresa cadastrada com sucesso!');
    await selecionarEmpresa(created);
  } catch (err) {
    console.error(err);
    showToast('Não foi possível cadastrar a empresa. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Cadastrar empresa e entrar';
  }
}

async function selecionarEmpresa(empresa) {
  state.empresaAtiva = empresa;
  localStorage.setItem(STORAGE_EMPRESA_KEY, empresa.id);
  $('#topbar-empresa-name').textContent = empresa.nome_empresa;
  $('#topbar-empresa-name').classList.remove('hidden');
  $('#btn-trocar-empresa').classList.remove('hidden');

  await carregarDados(empresa);
  renderDashboard();
  showView('dashboard');
}

/* --------------------------------------------------------------------------
   Carregamento de dados
   -------------------------------------------------------------------------- */

async function carregarDados(empresa) {
  const [desafiosRes, propostasRes] = await Promise.all([
    api('hack_challenges_desafios?limit=200'),
    api('hack_challenges_propostas?limit=500'),
  ]);
  state.desafios = (desafiosRes.data || []).filter(d => d.empresa_id === empresa.id);
  const meusDesafioIds = state.desafios.map(d => d.id);
  state.propostas = (propostasRes.data || []).filter(p => meusDesafioIds.includes(p.desafio_id));
}

function propostasDoDesafio(desafioId) {
  return state.propostas.filter(p => p.desafio_id === desafioId);
}

async function nomeEquipe(equipeId) {
  if (state.equipesCache[equipeId]) return state.equipesCache[equipeId];
  try {
    const eq = await api(`equipes/${equipeId}`);
    state.equipesCache[equipeId] = eq;
    return eq;
  } catch {
    return null;
  }
}

/* --------------------------------------------------------------------------
   Render: Dashboard (meus desafios)
   -------------------------------------------------------------------------- */

function renderDashboard() {
  $('#empresa-nome').textContent = state.empresaAtiva.nome_empresa;

  const wrap = $('#lista-meus-desafios');
  $('#lista-meus-desafios-vazia').classList.toggle('hidden', state.desafios.length > 0);
  wrap.classList.toggle('hidden', state.desafios.length === 0);

  wrap.innerHTML = state.desafios.map(d => {
    const props = propostasDoDesafio(d.id);
    const pendentes = props.filter(p => p.status === 'Proposta enviada').length;
    return `
      <button data-desafio-id="${d.id}" class="app-card text-left hover:border-brand-yellow transition-colors flex flex-col" style="border:2px solid transparent;">
        <div class="flex items-center justify-between mb-3">
          <span class="badge ${d.status === 'Aberto' ? 'badge-yellow' : 'badge-dark'}">${escapeHtml(d.status)}</span>
          ${pendentes > 0 ? `<span class="badge" style="background:#FFF3CC;color:#92600A;">${pendentes} para avaliar</span>` : ''}
        </div>
        <p class="font-semibold text-slate-900 mb-1">${escapeHtml(d.titulo)}</p>
        <p class="text-xs text-slate-500 mb-4 flex-1">${escapeHtml(CATEGORIAS_LABEL[d.categoria] || d.categoria || '')}</p>
        <div class="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
          <span class="font-display font-bold text-brand-yellow-dark">${formatMoeda(d.valor_premiacao)}</span>
          <span class="text-xs text-slate-400"><i class="fa-solid fa-users mr-1"></i>${props.length} proposta(s)</span>
        </div>
      </button>
    `;
  }).join('');

  $all('[data-desafio-id]', wrap).forEach(btn => {
    btn.addEventListener('click', () => abrirDesafio(btn.getAttribute('data-desafio-id')));
  });
}

/* --------------------------------------------------------------------------
   Novo desafio
   -------------------------------------------------------------------------- */

async function handleNovoDesafio(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';

  try {
    const payload = {
      empresa_id: state.empresaAtiva.id,
      titulo: (data.titulo || '').trim().slice(0, 150),
      descricao: (data.descricao || '').trim().slice(0, 4000),
      categoria: data.categoria,
      valor_premiacao: parseFloat(data.valor_premiacao) || 0,
      prazo: (data.prazo || '').trim().slice(0, 60),
      status: 'Aberto',
    };
    const created = await api('hack_challenges_desafios', { method: 'POST', body: JSON.stringify(payload) });
    state.desafios.unshift(created);
    showToast('🎉 Desafio publicado no mural do HACK Challenges!');
    form.reset();
    renderDashboard();
    showView('dashboard');
  } catch (err) {
    console.error(err);
    showToast('Não foi possível publicar o desafio. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-bullhorn"></i> Publicar desafio no mural';
  }
}

/* --------------------------------------------------------------------------
   Detalhe do desafio: propostas recebidas + avaliar/pagar
   -------------------------------------------------------------------------- */

async function abrirDesafio(desafioId) {
  const desafio = state.desafios.find(d => d.id === desafioId);
  state.desafioAtual = desafio;

  $('#desafio-header').innerHTML = `
    <div class="flex items-center gap-3 mb-3">
      <span class="badge badge-dark">${escapeHtml(CATEGORIAS_LABEL[desafio.categoria] || desafio.categoria || '')}</span>
      <span class="badge ${desafio.status === 'Aberto' ? 'badge-yellow' : 'badge-dark'}">${escapeHtml(desafio.status)}</span>
    </div>
    <h1 class="font-display text-2xl font-bold text-slate-900 mb-3">${escapeHtml(desafio.titulo)}</h1>
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="app-card text-center">
        <p class="font-display text-xl font-bold text-brand-yellow-dark">${formatMoeda(desafio.valor_premiacao)}</p>
        <p class="text-xs text-slate-500 uppercase tracking-wide mt-1">Premiação</p>
      </div>
      <div class="app-card text-center">
        <p class="font-display text-xl font-bold text-slate-900">${escapeHtml(desafio.prazo || '—')}</p>
        <p class="text-xs text-slate-500 uppercase tracking-wide mt-1">Prazo</p>
      </div>
    </div>
    <div class="app-card">
      <p class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Descrição</p>
      <p class="text-sm text-slate-600 whitespace-pre-line">${escapeHtml(desafio.descricao || '—')}</p>
    </div>
    <div class="flex items-center gap-3 mt-4">
      ${desafio.status === 'Aberto'
        ? `<button data-encerrar="1" class="btn-outline px-4 py-2 rounded-lg text-xs font-semibold"><i class="fa-solid fa-lock mr-1.5"></i>Encerrar desafio</button>`
        : `<span class="text-xs text-slate-400">Desafio ${escapeHtml(desafio.status).toLowerCase()}</span>`}
    </div>
  `;

  const btnEncerrar = $('[data-encerrar]');
  if (btnEncerrar) {
    btnEncerrar.addEventListener('click', () => handleEncerrarDesafio(desafio.id));
  }

  await renderListaPropostas(desafio.id);
  showView('desafio');
}

async function handleEncerrarDesafio(desafioId) {
  try {
    const updated = await api(`hack_challenges_desafios/${desafioId}`, { method: 'PATCH', body: JSON.stringify({ status: 'Encerrado' }) });
    const idx = state.desafios.findIndex(d => d.id === desafioId);
    state.desafios[idx] = { ...state.desafios[idx], ...updated };
    showToast('Desafio encerrado. Não aparecerá mais no mural.');
    abrirDesafio(desafioId);
  } catch (err) {
    console.error(err);
    showToast('Não foi possível encerrar o desafio.', 'fa-solid fa-triangle-exclamation');
  }
}

async function renderListaPropostas(desafioId) {
  const props = propostasDoDesafio(desafioId);
  const wrap = $('#lista-propostas');
  $('#lista-propostas-vazia').classList.toggle('hidden', props.length > 0);
  wrap.classList.toggle('hidden', props.length === 0);

  const linhas = await Promise.all(props.map(async (p) => {
    const equipe = await nomeEquipe(p.equipe_id);
    const info = STATUS_INFO[p.status] || STATUS_INFO['Aceito'];
    return `
      <div class="app-card" data-proposta-card="${p.id}">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <p class="font-semibold text-slate-900">${escapeHtml(equipe ? equipe.nome_equipe : 'Equipe')}</p>
          <span class="badge" style="background:${info.bg};color:${info.cor};"><i class="${info.icone} mr-1"></i>${escapeHtml(p.status)}</span>
        </div>
        ${p.proposta_texto ? `<p class="text-sm text-slate-600 whitespace-pre-line mb-3">${escapeHtml(p.proposta_texto)}</p>` : `<p class="text-xs text-slate-400 mb-3 italic">A equipe ainda não enviou a proposta (aceitou o desafio).</p>`}
        ${p.proposta_anexo_url ? `<p class="text-xs text-slate-400 mb-3"><i class="fa-solid fa-link mr-1"></i>${escapeHtml(p.proposta_anexo_url)}</p>` : ''}
        <div id="avaliacao-area-${p.id}"></div>
      </div>
    `;
  }));

  wrap.innerHTML = linhas.join('');

  props.forEach(p => renderAreaAvaliacao(p));
}

function renderAreaAvaliacao(proposta) {
  const area = $(`#avaliacao-area-${proposta.id}`);
  if (!area) return;

  if (proposta.status !== 'Proposta enviada' && proposta.status !== 'Aprovada') {
    if (proposta.status === 'Rejeitada' || proposta.status === 'Paga') {
      area.innerHTML = `
        ${proposta.avaliacao_nota !== undefined && proposta.avaliacao_nota !== null ? `<p class="text-sm text-slate-700 mb-1"><strong>Nota:</strong> ${proposta.avaliacao_nota}/10</p>` : ''}
        ${proposta.avaliacao_feedback ? `<p class="text-sm text-slate-600 mb-1"><strong>Feedback:</strong> ${escapeHtml(proposta.avaliacao_feedback)}</p>` : ''}
        ${proposta.status === 'Paga' ? `<p class="text-sm font-semibold text-brand-yellow-dark mt-2">${formatMoeda(proposta.valor_pago)} pago à equipe</p>` : ''}
      `;
    } else {
      area.innerHTML = '';
    }
    return;
  }

  if (proposta.status === 'Proposta enviada') {
    area.innerHTML = `
      <form data-form-avaliar="${proposta.id}" class="space-y-3 border-t border-slate-100 pt-3 mt-2">
        <div class="grid sm:grid-cols-2 gap-3">
          <div>
            <label class="form-label">Nota (0 a 10) *</label>
            <input type="number" name="avaliacao_nota" min="0" max="10" step="0.5" required class="form-input">
          </div>
        </div>
        <div>
          <label class="form-label">Feedback para a equipe</label>
          <textarea name="avaliacao_feedback" rows="2" maxlength="1000" class="form-textarea" placeholder="Comentários sobre a proposta..."></textarea>
        </div>
        <div class="flex gap-2">
          <button type="submit" data-acao="Aprovada" class="btn-accent flex-1 py-2.5 rounded-lg text-sm font-semibold"><i class="fa-solid fa-check mr-1.5"></i>Aprovar</button>
          <button type="submit" data-acao="Rejeitada" class="btn-outline flex-1 py-2.5 rounded-lg text-sm font-semibold"><i class="fa-solid fa-xmark mr-1.5"></i>Rejeitar</button>
        </div>
      </form>
    `;
    const form = $(`[data-form-avaliar="${proposta.id}"]`);
    form.addEventListener('submit', (e) => handleAvaliarProposta(e, proposta.id));
    return;
  }

  if (proposta.status === 'Aprovada') {
    area.innerHTML = `
      ${proposta.avaliacao_nota !== undefined && proposta.avaliacao_nota !== null ? `<p class="text-sm text-slate-700 mb-1"><strong>Nota:</strong> ${proposta.avaliacao_nota}/10</p>` : ''}
      ${proposta.avaliacao_feedback ? `<p class="text-sm text-slate-600 mb-3"><strong>Feedback:</strong> ${escapeHtml(proposta.avaliacao_feedback)}</p>` : ''}
      <form data-form-pagar="${proposta.id}" class="flex items-end gap-2 border-t border-slate-100 pt-3">
        <div class="flex-1">
          <label class="form-label">Valor a pagar (R$) *</label>
          <input type="number" name="valor_pago" min="0" step="0.01" required class="form-input" value="${state.desafioAtual && state.desafioAtual.id === proposta.desafio_id ? state.desafioAtual.valor_premiacao : ''}">
        </div>
        <button type="submit" class="btn-accent px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0"><i class="fa-solid fa-sack-dollar mr-1.5"></i>Registrar pagamento</button>
      </form>
    `;
    const form = $(`[data-form-pagar="${proposta.id}"]`);
    form.addEventListener('submit', (e) => handlePagarProposta(e, proposta.id));
  }
}

async function handleAvaliarProposta(e, propostaId) {
  e.preventDefault();
  const form = e.target;
  const acao = e.submitter ? e.submitter.getAttribute('data-acao') : 'Aprovada';
  const data = Object.fromEntries(new FormData(form).entries());
  const btns = form.querySelectorAll('button[type="submit"]');
  btns.forEach(b => b.disabled = true);

  try {
    const payload = {
      status: acao,
      avaliacao_nota: parseFloat(data.avaliacao_nota) || 0,
      avaliacao_feedback: (data.avaliacao_feedback || '').slice(0, 1000),
    };
    const updated = await api(`hack_challenges_propostas/${propostaId}`, { method: 'PATCH', body: JSON.stringify(payload) });
    const idx = state.propostas.findIndex(p => p.id === propostaId);
    state.propostas[idx] = { ...state.propostas[idx], ...updated };
    showToast(acao === 'Aprovada' ? '✅ Proposta aprovada!' : 'Proposta marcada como rejeitada.');
    await renderListaPropostas(state.desafioAtual.id);
    renderDashboard();
  } catch (err) {
    console.error(err);
    showToast('Não foi possível salvar a avaliação.', 'fa-solid fa-triangle-exclamation');
    btns.forEach(b => b.disabled = false);
  }
}

async function handlePagarProposta(e, propostaId) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  try {
    const payload = {
      status: 'Paga',
      valor_pago: parseFloat(data.valor_pago) || 0,
    };
    const updated = await api(`hack_challenges_propostas/${propostaId}`, { method: 'PATCH', body: JSON.stringify(payload) });
    const idx = state.propostas.findIndex(p => p.id === propostaId);
    state.propostas[idx] = { ...state.propostas[idx], ...updated };
    showToast('💰 Pagamento registrado! A equipe verá o valor pago.');
    await renderListaPropostas(state.desafioAtual.id);
  } catch (err) {
    console.error(err);
    showToast('Não foi possível registrar o pagamento.', 'fa-solid fa-triangle-exclamation');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-sack-dollar mr-1.5"></i>Registrar pagamento';
  }
}

/* --------------------------------------------------------------------------
   Botões estáticos / init
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  $('#btn-tentar-novamente').addEventListener('click', init);
  $('#form-criar-empresa').addEventListener('submit', handleCriarEmpresa);
  $('#btn-trocar-empresa').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_EMPRESA_KEY);
    renderEntrar();
    showView('entrar');
  });
  $('#btn-novo-desafio').addEventListener('click', () => showView('novo-desafio'));
  $('#form-novo-desafio').addEventListener('submit', handleNovoDesafio);
  $('#btn-voltar-dashboard-1').addEventListener('click', () => showView('dashboard'));
  $('#btn-voltar-dashboard-2').addEventListener('click', () => { renderDashboard(); showView('dashboard'); });
  init();
});
