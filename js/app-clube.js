/* ==========================================================================
   HACK HUB® — Painel do Clube (app funcional)
   Módulo: Criando o Clube
   Persistência via Table API (tables/hack_clubes, professores_mentores,
   estudantes, equipes)
   ========================================================================== */

const STORAGE_KEY = 'hh_clube_ativo_id';

const state = {
  clube: null,
  mentores: [],
  estudantes: [],
  equipes: [],
  projetosDiscovery: [],
  hackSubmissoes: [],
};

const CORES_EQUIPE = {
  'Amarelo': '#FFC800',
  'Preto': '#101010',
  'Azul': '#3B82F6',
  'Verde': '#22C55E',
  'Vermelho': '#EF4444',
  'Roxo': '#8B5CF6',
};

const FUNCOES = ['A definir', 'Líder', 'Criativo', 'Pesquisador', 'Comunicador', 'Executor'];
const PERFIS_HACK = [
  { nome: 'Creator', emoji: '💡', descricao: 'Transforma ideias em oportunidades' },
  { nome: 'Builder', emoji: '🚀', descricao: 'Faz as ideias acontecerem' },
  { nome: 'Connector', emoji: '🎤', descricao: 'Conecta pessoas, ideias e oportunidades' },
  { nome: 'Tech Maker', emoji: '🤖', descricao: 'Usa a tecnologia para criar soluções' },
  { nome: 'Leader', emoji: '🌍', descricao: 'Inspira pessoas e conduz a equipe ao resultado' },
];
const TESTE_PERFIL_URL = 'https://app.hackschool.app';

function perfilInfo(nome) {
  return PERFIS_HACK.find(p => p.nome === nome) || null;
}

/* --------------------------------------------------------------------------
   Helpers de redes sociais (Instagram / LinkedIn)
   -------------------------------------------------------------------------- */

function instagramUrl(handle) {
  if (!handle) return '#';
  const clean = handle.trim().replace(/^@/, '');
  if (/^https?:\/\//i.test(handle)) return handle.trim();
  return `https://instagram.com/${clean}`;
}

function linkedinUrl(value) {
  if (!value) return '#';
  if (/^https?:\/\//i.test(value)) return value.trim();
  return `https://linkedin.com/in/${value.trim().replace(/^@/, '')}`;
}

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

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function avatarHTML(fotoUrl, name, size = 'w-12 h-12', bg = 'bg-black', text = 'text-brand-yellow') {
  if (fotoUrl) {
    return `<img src="${fotoUrl}" alt="${name}" class="avatar-img ${size}">`;
  }
  return `<div class="avatar-img ${size} ${bg} ${text} flex items-center justify-center font-bold text-sm">${initials(name)}</div>`;
}

async function api(path, opts = {}) {
  const res = await fetch(`../tables/${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
  return res.json();
}

/* --------------------------------------------------------------------------
   Carregamento de dados
   -------------------------------------------------------------------------- */

async function loadAllData(clubeId) {
  const [mentoresRes, estudantesRes, equipesRes, projetosRes, submissoesRes] = await Promise.all([
    api(`professores_mentores?limit=200`),
    api(`estudantes?limit=500`),
    api(`equipes?limit=200`),
    api(`projetos_discovery?limit=200`),
    api(`hack_submissoes?limit=500`),
  ]);
  state.mentores = (mentoresRes.data || []).filter(m => m.clube_id === clubeId);
  state.estudantes = (estudantesRes.data || []).filter(e => e.clube_id === clubeId);
  state.equipes = (equipesRes.data || []).filter(eq => eq.clube_id === clubeId);
  state.projetosDiscovery = (projetosRes.data || []).filter(p => p.clube_id === clubeId);
  state.hackSubmissoes = (submissoesRes.data || []).filter(s => s.clube_id === clubeId);
}

/* --------------------------------------------------------------------------
   Ranking (Pontos de Impacto do Discovery + Pontos HACK do Banco HACK)
   -------------------------------------------------------------------------- */

/** Calcula, para uma equipe, os pontos de Discovery, de Banco HACK e o total. */
function pontosDaEquipe(equipeId) {
  const pontosDiscovery = state.projetosDiscovery
    .filter(p => p.equipe_id === equipeId)
    .reduce((soma, p) => soma + (p.pontos_impacto || 0), 0);
  const pontosBancoHack = state.hackSubmissoes
    .filter(s => s.equipe_id === equipeId)
    .reduce((soma, s) => soma + (s.pontos_ganhos || 0), 0);
  return { pontosDiscovery, pontosBancoHack, total: pontosDiscovery + pontosBancoHack };
}

async function tryLoadActiveClube() {
  const clubeId = localStorage.getItem(STORAGE_KEY);
  if (!clubeId) return showCreateView();
  try {
    const clube = await api(`hack_clubes/${clubeId}`);
    if (!clube || clube.deleted) {
      localStorage.removeItem(STORAGE_KEY);
      return showCreateView();
    }
    state.clube = clube;
    await loadAllData(clube.id);
    renderDashboard();
    showDashboardView();
  } catch (err) {
    console.error(err);
    localStorage.removeItem(STORAGE_KEY);
    showCreateView();
  }
}

/* --------------------------------------------------------------------------
   Alternância de views
   -------------------------------------------------------------------------- */

function showCreateView() {
  $('#view-criar-clube').classList.remove('hidden');
  $('#view-dashboard').classList.add('hidden');
  $('#btn-sair-clube').classList.add('hidden');
  $('#topbar-clube-name').textContent = '';
}

function showDashboardView() {
  $('#view-criar-clube').classList.add('hidden');
  $('#view-dashboard').classList.remove('hidden');
  $('#btn-sair-clube').classList.remove('hidden');
  $('#topbar-clube-name').textContent = state.clube?.nome_clube || '';
}

/* --------------------------------------------------------------------------
   Render: cabeçalho + estatísticas
   -------------------------------------------------------------------------- */

function renderClubeHeader() {
  const c = state.clube;
  $('#clube-nome').textContent = c.nome_clube || 'Meu HACK CLUB';
  $('#clube-escola').innerHTML = `<i class="fa-solid fa-school mr-1.5"></i>${c.escola || '—'}${c.cidade ? ' · ' + c.cidade : ''}${c.estado ? '/' + c.estado : ''}`;
  $('#clube-descricao').textContent = c.descricao || '';
  const statusBadge = $('#clube-status-badge');
  statusBadge.textContent = c.status === 'Ativo' ? '● Clube ativo' : '● Configuração pendente';
  statusBadge.className = c.status === 'Ativo' ? 'badge badge-yellow mb-2' : 'badge badge-dark mb-2';

  const logoImg = $('#clube-logo-img');
  const logoFallback = $('#clube-logo-fallback');
  if (c.logo_url) {
    logoImg.src = c.logo_url;
    logoImg.style.display = 'block';
    logoFallback.style.display = 'none';
  } else {
    logoImg.style.display = 'none';
    logoFallback.style.display = 'flex';
  }

  const socialWrap = $('#clube-social-links');
  if (socialWrap) {
    socialWrap.innerHTML = c.instagram
      ? `<a href="${instagramUrl(c.instagram)}" target="_blank" rel="noopener" class="text-xs font-semibold text-white/80 hover:text-brand-yellow transition-colors"><i class="fa-brands fa-instagram mr-1.5"></i>${c.instagram}</a>`
      : '';
  }
}

function renderStats() {
  $('#stat-mentores').textContent = state.mentores.length;
  $('#stat-estudantes').textContent = state.estudantes.length;
  $('#stat-equipes').textContent = state.equipes.length;
  $('#stat-aprovadas').textContent = state.equipes.filter(e => e.status === 'Aprovada').length;
}

function renderDashboard() {
  renderClubeHeader();
  renderStats();
  renderMentores();
  renderEstudantes();
  renderEquipes();
  renderRanking();
}

/* --------------------------------------------------------------------------
   Render: Professores mentores
   -------------------------------------------------------------------------- */

function renderMentores() {
  const wrap = $('#lista-mentores');
  wrap.innerHTML = '';
  $('#empty-mentores').classList.toggle('hidden', state.mentores.length > 0);
  state.mentores.forEach(m => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="flex items-start gap-4 mb-3">
        ${avatarHTML(m.foto_url, m.nome, 'w-14 h-14')}
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-900 truncate">${m.nome}</p>
          <p class="text-xs text-slate-500 truncate">${m.area_atuacao || 'Professor mentor'}</p>
        </div>
        <button data-action="del-mentor" data-id="${m.id}" class="text-slate-300 hover:text-red-500 transition-colors"><i class="fa-solid fa-trash text-sm"></i></button>
      </div>
      ${m.bio ? `<p class="text-xs text-slate-500 mb-3 leading-relaxed">${m.bio}</p>` : ''}
      <div class="flex flex-col gap-1.5 text-xs text-slate-500">
        ${m.email ? `<span><i class="fa-solid fa-envelope w-4 text-brand-yellow-dark"></i> ${m.email}</span>` : ''}
        ${m.telefone ? `<span><i class="fa-solid fa-phone w-4 text-brand-yellow-dark"></i> ${m.telefone}</span>` : ''}
        ${m.linkedin ? `<a href="${linkedinUrl(m.linkedin)}" target="_blank" rel="noopener" class="hover:text-brand-yellow-dark"><i class="fa-brands fa-linkedin w-4 text-brand-yellow-dark"></i> LinkedIn</a>` : ''}
      </div>
    `;
    wrap.appendChild(card);
  });
}

/* --------------------------------------------------------------------------
   Render: Estudantes
   -------------------------------------------------------------------------- */

function equipeNomeById(id) {
  const eq = state.equipes.find(e => e.id === id);
  return eq ? eq.nome_equipe : null;
}

function renderEstudantes() {
  const wrap = $('#lista-estudantes');
  wrap.innerHTML = '';
  $('#empty-estudantes').classList.toggle('hidden', state.estudantes.length > 0);
  state.estudantes.forEach(s => {
    const equipeNome = equipeNomeById(s.equipe_id);
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="flex items-start gap-3 mb-3">
        ${avatarHTML(s.foto_url, s.nome, 'w-12 h-12', 'bg-brand-yellow/20', 'text-brand-yellow-dark')}
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-900 text-sm truncate">${s.nome}</p>
          <p class="text-xs text-slate-500 truncate">${s.turma_serie || 'Série não informada'}</p>
        </div>
        <div class="flex items-center gap-1 shrink-0">
          <button data-action="edit-estudante" data-id="${s.id}" class="text-slate-300 hover:text-slate-600 transition-colors"><i class="fa-solid fa-pen text-sm"></i></button>
          <button data-action="del-estudante" data-id="${s.id}" class="text-slate-300 hover:text-red-500 transition-colors"><i class="fa-solid fa-trash text-sm"></i></button>
        </div>
      </div>
      <div class="flex flex-wrap gap-1.5 mb-2">
        <span class="badge ${s.status_convite === 'Confirmado' ? 'badge-yellow' : 'badge-dark'}">${s.status_convite || 'Convidado'}</span>
        ${s.perfil_hack
          ? `<span class="badge badge-dark">${perfilInfo(s.perfil_hack)?.emoji || ''} ${s.perfil_hack}</span>`
          : `<button data-action="edit-estudante" data-id="${s.id}" class="badge" style="background:#F1F5F9;color:#94A3B8;cursor:pointer;"><i class="fa-solid fa-vial mr-1"></i>Perfil HACK pendente</button>`}
      </div>
      <p class="text-xs text-slate-500 mb-1.5">
        <i class="fa-solid fa-people-group w-4 text-brand-yellow-dark"></i>
        ${equipeNome ? `Equipe: <span class="font-medium text-slate-700">${equipeNome}</span>` : 'Sem equipe'}
      </p>
      ${s.instagram ? `<a href="${instagramUrl(s.instagram)}" target="_blank" rel="noopener" class="text-xs text-slate-500 hover:text-brand-yellow-dark"><i class="fa-brands fa-instagram w-4 text-brand-yellow-dark"></i> ${s.instagram}</a>` : ''}
    `;
    wrap.appendChild(card);
  });
}

/* --------------------------------------------------------------------------
   Render: Equipes
   -------------------------------------------------------------------------- */

function renderEquipes() {
  const wrap = $('#lista-equipes');
  wrap.innerHTML = '';
  $('#empty-equipes').classList.toggle('hidden', state.equipes.length > 0);
  state.equipes.forEach(eq => {
    const membros = state.estudantes.filter(s => s.equipe_id === eq.id);
    const cor = CORES_EQUIPE[eq.cor_tema] || '#FFC800';
    const card = document.createElement('div');
    card.className = 'app-card relative';
    card.innerHTML = `
      <div class="team-strip" style="background:${cor}"></div>
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-3 min-w-0">
          ${eq.brasao_url
            ? `<img src="${eq.brasao_url}" alt="${eq.nome_equipe}" class="avatar-img w-12 h-12">`
            : `<div class="avatar-img w-12 h-12 flex items-center justify-center text-white" style="background:${cor}"><i class="fa-solid fa-shield-halved"></i></div>`}
          <div class="min-w-0">
            <p class="font-semibold text-slate-900 truncate">${eq.nome_equipe}</p>
            ${eq.lema ? `<p class="text-xs text-slate-500 italic truncate">"${eq.lema}"</p>` : ''}
          </div>
        </div>
        <button data-action="del-equipe" data-id="${eq.id}" class="text-slate-300 hover:text-red-500 transition-colors shrink-0"><i class="fa-solid fa-trash text-sm"></i></button>
      </div>

      <span class="badge ${eq.status === 'Aprovada' ? 'badge-yellow' : 'badge-dark'} mb-4">
        <i class="fa-solid ${eq.status === 'Aprovada' ? 'fa-check' : 'fa-hourglass-half'} mr-1"></i> ${eq.status || 'Em formação'}
      </span>

      <p class="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Integrantes (${membros.length})</p>
      <div class="space-y-1.5 mb-4">
        ${membros.length === 0 ? '<p class="text-xs text-slate-400">Nenhum integrante ainda.</p>' : membros.map(m => `
          <div class="member-row">
            ${avatarHTML(m.foto_url, m.nome, 'w-8 h-8', 'bg-black', 'text-brand-yellow')}
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-slate-800 truncate">${m.nome}</p>
              ${m.perfil_hack ? `<p class="text-[10px] text-brand-yellow-dark font-semibold truncate">${perfilInfo(m.perfil_hack)?.emoji || ''} ${m.perfil_hack}</p>` : ''}
            </div>
            <select data-action="set-funcao" data-id="${m.id}" class="text-[11px] border border-slate-200 rounded-md px-1.5 py-1 bg-white">
              ${FUNCOES.map(f => `<option value="${f}" ${m.funcao_equipe === f ? 'selected' : ''}>${f}</option>`).join('')}
            </select>
            <button data-action="remove-membro" data-id="${m.id}" class="text-slate-300 hover:text-red-500 shrink-0"><i class="fa-solid fa-xmark text-xs"></i></button>
          </div>
        `).join('')}
      </div>

      <div class="flex flex-wrap gap-2">
        <button data-action="add-membro" data-id="${eq.id}" class="chip-btn"><i class="fa-solid fa-user-plus"></i> Adicionar integrante</button>
        <button data-action="edit-equipe" data-id="${eq.id}" class="chip-btn"><i class="fa-solid fa-pen"></i> Identidade</button>
        ${eq.status !== 'Aprovada'
          ? `<button data-action="aprovar-equipe" data-id="${eq.id}" class="chip-btn active"><i class="fa-solid fa-check"></i> Aprovar equipe</button>`
          : `<button data-action="reabrir-equipe" data-id="${eq.id}" class="chip-btn"><i class="fa-solid fa-rotate-left"></i> Reabrir</button>`}
      </div>
    `;
    wrap.appendChild(card);
  });
}

/* --------------------------------------------------------------------------
   Render: Ranking interno (equipes do mesmo clube)
   -------------------------------------------------------------------------- */

function renderRanking() {
  const wrap = $('#lista-ranking');
  if (!wrap) return;
  wrap.innerHTML = '';
  $('#empty-ranking').classList.toggle('hidden', state.equipes.length > 0);

  const linhas = state.equipes
    .map(eq => ({ equipe: eq, ...pontosDaEquipe(eq.id) }))
    .sort((a, b) => b.total - a.total);

  const medalha = (pos) => {
    if (pos === 0) return { icone: 'fa-solid fa-trophy', cor: '#E0A800', bg: '#FFF3CC' };
    if (pos === 1) return { icone: 'fa-solid fa-medal', cor: '#94A3B8', bg: '#F1F5F9' };
    if (pos === 2) return { icone: 'fa-solid fa-medal', cor: '#B45309', bg: '#FEF3C7' };
    return { icone: 'fa-solid fa-hashtag', cor: '#94A3B8', bg: '#F8FAFC' };
  };

  linhas.forEach((linha, pos) => {
    const { equipe: eq, pontosDiscovery, pontosBancoHack, total } = linha;
    const cor = CORES_EQUIPE[eq.cor_tema] || '#FFC800';
    const m = medalha(pos);
    const row = document.createElement('div');
    row.className = 'app-card flex items-center gap-4';
    row.innerHTML = `
      <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style="background:${m.bg};color:${m.cor}">
        ${pos < 3 ? `<i class="${m.icone}"></i>` : `${pos + 1}º`}
      </div>
      ${eq.brasao_url
        ? `<img src="${eq.brasao_url}" alt="${eq.nome_equipe}" class="avatar-img w-11 h-11 shrink-0">`
        : `<div class="avatar-img w-11 h-11 flex items-center justify-center text-white shrink-0" style="background:${cor}"><i class="fa-solid fa-shield-halved"></i></div>`}
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-slate-900 truncate">${eq.nome_equipe}</p>
        <p class="text-xs text-slate-500 truncate"><i class="fa-solid fa-earth-americas w-3.5 text-brand-yellow-dark"></i> ${pontosDiscovery} Discovery &nbsp;·&nbsp; <i class="fa-solid fa-cube w-3.5 text-brand-yellow-dark"></i> ${pontosBancoHack} Banco HACK</p>
      </div>
      <div class="text-right shrink-0">
        <p class="font-display text-xl font-bold text-slate-900">${total}</p>
        <p class="text-[10px] text-slate-400 uppercase tracking-wide">pontos</p>
      </div>
    `;
    wrap.appendChild(row);
  });
}

/* --------------------------------------------------------------------------
   Modal helper
   -------------------------------------------------------------------------- */

function openModal(html) {
  $('#modal-box').innerHTML = html;
  $('#modal-root').classList.remove('hidden');
}
function closeModal() {
  $('#modal-root').classList.add('hidden');
  $('#modal-box').innerHTML = '';
}

/* --------------------------------------------------------------------------
   Ações: Clube (criar / editar)
   -------------------------------------------------------------------------- */

async function handleCriarClube(e) {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  data.status = 'Ativo';
  try {
    const created = await api('hack_clubes', { method: 'POST', body: JSON.stringify(data) });
    localStorage.setItem(STORAGE_KEY, created.id);
    state.clube = created;
    await loadAllData(created.id);
    renderDashboard();
    showDashboardView();
    showToast('HACK CLUB criado com sucesso!');
  } catch (err) {
    console.error(err);
    showToast('Não foi possível criar o clube. Tente novamente.', 'fa-solid fa-triangle-exclamation');
  }
}

function openEditarClubeModal() {
  const c = state.clube;
  openModal(`
    <div class="p-6 sm:p-7">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg font-bold text-slate-900"><i class="fa-solid fa-pen-to-square mr-2 text-brand-yellow-dark"></i>Editar informações do clube</h3>
        <button data-close-modal class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <form id="form-editar-clube" class="space-y-4">
        <div>
          <label class="form-label">Nome do HACK CLUB *</label>
          <input type="text" name="nome_clube" required class="form-input" value="${c.nome_clube || ''}">
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Escola *</label>
            <input type="text" name="escola" required class="form-input" value="${c.escola || ''}">
          </div>
          <div>
            <label class="form-label">Cidade</label>
            <input type="text" name="cidade" class="form-input" value="${c.cidade || ''}">
          </div>
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Estado (UF)</label>
            <input type="text" name="estado" maxlength="2" class="form-input uppercase" value="${c.estado || ''}">
          </div>
          <div>
            <label class="form-label">Logo do clube (URL)</label>
            <input type="url" name="logo_url" class="form-input" value="${c.logo_url || ''}">
          </div>
        </div>
        <div>
          <label class="form-label">Descrição</label>
          <textarea name="descricao" rows="3" class="form-textarea">${c.descricao || ''}</textarea>
        </div>
        <div>
          <label class="form-label">Instagram do clube <span class="text-slate-400 font-normal">(opcional)</span></label>
          <input type="text" name="instagram" class="form-input" value="${c.instagram || ''}" placeholder="@meuhackclub">
        </div>
        <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Salvar alterações</button>
      </form>
    </div>
  `);
  $('#form-editar-clube').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const updated = await api(`hack_clubes/${c.id}`, { method: 'PATCH', body: JSON.stringify(data) });
      state.clube = { ...state.clube, ...updated };
      renderClubeHeader();
      closeModal();
      showToast('Informações do clube atualizadas!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    }
  });
}

/* --------------------------------------------------------------------------
   Ações: Professor mentor
   -------------------------------------------------------------------------- */

function openAddMentorModal() {
  openModal(`
    <div class="p-6 sm:p-7">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg font-bold text-slate-900"><i class="fa-solid fa-chalkboard-user mr-2 text-brand-yellow-dark"></i>Cadastrar professor mentor</h3>
        <button data-close-modal class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <form id="form-mentor" class="space-y-4">
        <div>
          <label class="form-label">Nome completo *</label>
          <input type="text" name="nome" required class="form-input" placeholder="Nome do professor mentor">
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">E-mail</label>
            <input type="email" name="email" class="form-input" placeholder="email@escola.com">
          </div>
          <div>
            <label class="form-label">Telefone</label>
            <input type="text" name="telefone" class="form-input" placeholder="(00) 00000-0000">
          </div>
        </div>
        <div>
          <label class="form-label">Área de atuação</label>
          <input type="text" name="area_atuacao" class="form-input" placeholder="Ex.: Matemática, Ciências...">
        </div>
        <div>
          <label class="form-label">Foto (URL da imagem)</label>
          <input type="url" name="foto_url" class="form-input" placeholder="https://... (opcional)">
        </div>
        <div>
          <label class="form-label">LinkedIn <span class="text-slate-400 font-normal">(opcional)</span></label>
          <input type="text" name="linkedin" class="form-input" placeholder="https://linkedin.com/in/seu-perfil">
        </div>
        <div>
          <label class="form-label">Bio / apresentação</label>
          <textarea name="bio" rows="2" class="form-textarea" placeholder="Uma breve apresentação (opcional)"></textarea>
        </div>
        <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Cadastrar</button>
      </form>
    </div>
  `);
  $('#form-mentor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    data.clube_id = state.clube.id;
    try {
      const created = await api('professores_mentores', { method: 'POST', body: JSON.stringify(data) });
      state.mentores.push(created);
      renderMentores();
      renderStats();
      closeModal();
      showToast('Professor mentor cadastrado!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao cadastrar. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    }
  });
}

async function deleteMentor(id) {
  if (!confirm('Remover este professor mentor?')) return;
  try {
    await api(`professores_mentores/${id}`, { method: 'DELETE' });
    state.mentores = state.mentores.filter(m => m.id !== id);
    renderMentores();
    renderStats();
    showToast('Professor mentor removido.');
  } catch (err) {
    console.error(err);
    showToast('Erro ao remover.', 'fa-solid fa-triangle-exclamation');
  }
}

/* --------------------------------------------------------------------------
   Ações: Estudantes
   -------------------------------------------------------------------------- */

function perfilHackFieldHTML(valorAtual = '') {
  return `
    <div class="rounded-xl border border-slate-200 p-4 bg-slate-50">
      <div class="flex items-start justify-between gap-3 mb-3 flex-wrap">
        <label class="form-label mb-0">Perfil HACK <span class="text-slate-400 font-normal">(opcional)</span></label>
        <a href="${TESTE_PERFIL_URL}" target="_blank" rel="noopener" class="text-xs font-semibold text-brand-yellow-dark hover:underline whitespace-nowrap">
          <i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> Fazer o teste em app.hackschool.app
        </a>
      </div>
      <p class="text-xs text-slate-500 mb-3 leading-relaxed">O teste dos 5 Perfis HACK é feito na plataforma HACK School. Depois que o estudante concluir, selecione o resultado aqui. Pode deixar em branco por enquanto.</p>
      <select name="perfil_hack" class="form-select">
        <option value="" ${!valorAtual ? 'selected' : ''}>Ainda não realizado</option>
        ${PERFIS_HACK.map(p => `<option value="${p.nome}" ${valorAtual === p.nome ? 'selected' : ''}>${p.emoji} ${p.nome} — ${p.descricao}</option>`).join('')}
      </select>
    </div>
  `;
}

function openAddEstudanteModal() {
  openModal(`
    <div class="p-6 sm:p-7">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg font-bold text-slate-900"><i class="fa-solid fa-user-plus mr-2 text-brand-yellow-dark"></i>Convidar estudante</h3>
        <button data-close-modal class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <form id="form-estudante" class="space-y-4">
        <div>
          <label class="form-label">Nome completo *</label>
          <input type="text" name="nome" required class="form-input" placeholder="Nome do estudante">
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">E-mail</label>
            <input type="email" name="email" class="form-input" placeholder="email@escola.com">
          </div>
          <div>
            <label class="form-label">Turma / série</label>
            <input type="text" name="turma_serie" class="form-input" placeholder="Ex.: 9º Ano B">
          </div>
        </div>
        <div>
          <label class="form-label">Foto (URL da imagem)</label>
          <input type="url" name="foto_url" class="form-input" placeholder="https://... (opcional)">
        </div>
        <div>
          <label class="form-label">Instagram <span class="text-slate-400 font-normal">(opcional)</span></label>
          <input type="text" name="instagram" class="form-input" placeholder="@usuario">
        </div>
        ${perfilHackFieldHTML()}
        <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Enviar convite</button>
      </form>
    </div>
  `);
  $('#form-estudante').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    data.clube_id = state.clube.id;
    data.equipe_id = '';
    data.funcao_equipe = 'A definir';
    data.status_convite = 'Convidado';
    try {
      const created = await api('estudantes', { method: 'POST', body: JSON.stringify(data) });
      state.estudantes.push(created);
      renderEstudantes();
      renderEquipes();
      renderStats();
      closeModal();
      showToast('Convite enviado ao estudante!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao convidar. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    }
  });
}

function openEditEstudanteModal(id) {
  const s = state.estudantes.find(e => e.id === id);
  if (!s) return;
  openModal(`
    <div class="p-6 sm:p-7">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg font-bold text-slate-900"><i class="fa-solid fa-user-pen mr-2 text-brand-yellow-dark"></i>Editar estudante</h3>
        <button data-close-modal class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <form id="form-edit-estudante" class="space-y-4">
        <div>
          <label class="form-label">Nome completo *</label>
          <input type="text" name="nome" required class="form-input" value="${s.nome || ''}">
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">E-mail</label>
            <input type="email" name="email" class="form-input" value="${s.email || ''}">
          </div>
          <div>
            <label class="form-label">Turma / série</label>
            <input type="text" name="turma_serie" class="form-input" value="${s.turma_serie || ''}">
          </div>
        </div>
        <div>
          <label class="form-label">Foto (URL da imagem)</label>
          <input type="url" name="foto_url" class="form-input" value="${s.foto_url || ''}">
        </div>
        <div>
          <label class="form-label">Instagram <span class="text-slate-400 font-normal">(opcional)</span></label>
          <input type="text" name="instagram" class="form-input" value="${s.instagram || ''}" placeholder="@usuario">
        </div>
        ${perfilHackFieldHTML(s.perfil_hack)}
        <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Salvar alterações</button>
      </form>
    </div>
  `);
  $('#form-edit-estudante').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const updated = await api(`estudantes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      const idx = state.estudantes.findIndex(s => s.id === id);
      state.estudantes[idx] = { ...state.estudantes[idx], ...updated };
      renderEstudantes();
      renderEquipes();
      closeModal();
      showToast('Estudante atualizado!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    }
  });
}

async function deleteEstudante(id) {
  if (!confirm('Remover este estudante do clube?')) return;
  try {
    await api(`estudantes/${id}`, { method: 'DELETE' });
    state.estudantes = state.estudantes.filter(s => s.id !== id);
    renderEstudantes();
    renderEquipes();
    renderStats();
    showToast('Estudante removido.');
  } catch (err) {
    console.error(err);
    showToast('Erro ao remover.', 'fa-solid fa-triangle-exclamation');
  }
}

/* --------------------------------------------------------------------------
   Ações: Equipes
   -------------------------------------------------------------------------- */

function openAddEquipeModal() {
  openModal(`
    <div class="p-6 sm:p-7">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg font-bold text-slate-900"><i class="fa-solid fa-people-group mr-2 text-brand-yellow-dark"></i>Criar equipe</h3>
        <button data-close-modal class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <form id="form-equipe" class="space-y-4">
        <div>
          <label class="form-label">Nome da equipe *</label>
          <input type="text" name="nome_equipe" required class="form-input" placeholder="Ex.: Os Inventores">
        </div>
        <div>
          <label class="form-label">Lema da equipe</label>
          <input type="text" name="lema" class="form-input" placeholder="Ex.: Ideias que transformam!">
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Cor / identidade</label>
            <select name="cor_tema" class="form-select">
              ${Object.keys(CORES_EQUIPE).map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Brasão (URL da imagem)</label>
            <input type="url" name="brasao_url" class="form-input" placeholder="https://... (opcional)">
          </div>
        </div>
        <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Criar equipe</button>
      </form>
    </div>
  `);
  $('#form-equipe').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    data.clube_id = state.clube.id;
    data.status = 'Em formação';
    try {
      const created = await api('equipes', { method: 'POST', body: JSON.stringify(data) });
      state.equipes.push(created);
      renderEquipes();
      renderStats();
      closeModal();
      showToast('Equipe criada com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao criar equipe.', 'fa-solid fa-triangle-exclamation');
    }
  });
}

function openEditEquipeModal(id) {
  const eq = state.equipes.find(e => e.id === id);
  if (!eq) return;
  openModal(`
    <div class="p-6 sm:p-7">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg font-bold text-slate-900"><i class="fa-solid fa-flag mr-2 text-brand-yellow-dark"></i>Identidade da equipe</h3>
        <button data-close-modal class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <form id="form-edit-equipe" class="space-y-4">
        <div>
          <label class="form-label">Nome da equipe *</label>
          <input type="text" name="nome_equipe" required class="form-input" value="${eq.nome_equipe || ''}">
        </div>
        <div>
          <label class="form-label">Lema da equipe</label>
          <input type="text" name="lema" class="form-input" value="${eq.lema || ''}">
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Cor / identidade</label>
            <select name="cor_tema" class="form-select">
              ${Object.keys(CORES_EQUIPE).map(c => `<option value="${c}" ${eq.cor_tema === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Brasão (URL da imagem)</label>
            <input type="url" name="brasao_url" class="form-input" value="${eq.brasao_url || ''}">
          </div>
        </div>
        <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Salvar</button>
      </form>
    </div>
  `);
  $('#form-edit-equipe').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const updated = await api(`equipes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
      const idx = state.equipes.findIndex(e => e.id === id);
      state.equipes[idx] = { ...state.equipes[idx], ...updated };
      renderEquipes();
      closeModal();
      showToast('Identidade da equipe atualizada!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar.', 'fa-solid fa-triangle-exclamation');
    }
  });
}

function openAddMembroModal(equipeId) {
  const disponiveis = state.estudantes.filter(s => !s.equipe_id || s.equipe_id === '');
  openModal(`
    <div class="p-6 sm:p-7">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg font-bold text-slate-900"><i class="fa-solid fa-user-plus mr-2 text-brand-yellow-dark"></i>Adicionar integrante</h3>
        <button data-close-modal class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      ${disponiveis.length === 0
        ? `<p class="text-sm text-slate-500 text-center py-6">Todos os estudantes já estão em uma equipe.<br>Convide mais estudantes na aba "Estudantes".</p>`
        : `<div class="space-y-2 max-h-80 overflow-y-auto">
            ${disponiveis.map(s => `
              <button data-action="confirm-add-membro" data-estudante-id="${s.id}" data-equipe-id="${equipeId}" class="member-row w-full text-left hover:bg-slate-50 transition-colors">
                ${avatarHTML(s.foto_url, s.nome, 'w-9 h-9', 'bg-brand-yellow/20', 'text-brand-yellow-dark')}
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-800 truncate">${s.nome}</p>
                  <p class="text-xs text-slate-400 truncate">${s.turma_serie || ''}</p>
                </div>
                <i class="fa-solid fa-plus text-brand-yellow-dark text-sm"></i>
              </button>
            `).join('')}
          </div>`}
    </div>
  `);
}

async function addMembroToEquipe(estudanteId, equipeId) {
  try {
    const updated = await api(`estudantes/${estudanteId}`, { method: 'PATCH', body: JSON.stringify({ equipe_id: equipeId, status_convite: 'Confirmado' }) });
    const idx = state.estudantes.findIndex(s => s.id === estudanteId);
    state.estudantes[idx] = { ...state.estudantes[idx], ...updated };
    renderEquipes();
    renderEstudantes();
    closeModal();
    showToast('Integrante adicionado à equipe!');
  } catch (err) {
    console.error(err);
    showToast('Erro ao adicionar integrante.', 'fa-solid fa-triangle-exclamation');
  }
}

async function removeMembroFromEquipe(estudanteId) {
  try {
    const updated = await api(`estudantes/${estudanteId}`, { method: 'PATCH', body: JSON.stringify({ equipe_id: '' }) });
    const idx = state.estudantes.findIndex(s => s.id === estudanteId);
    state.estudantes[idx] = { ...state.estudantes[idx], ...updated };
    renderEquipes();
    renderEstudantes();
    showToast('Integrante removido da equipe.');
  } catch (err) {
    console.error(err);
    showToast('Erro ao remover integrante.', 'fa-solid fa-triangle-exclamation');
  }
}

async function setFuncaoMembro(estudanteId, funcao) {
  try {
    const updated = await api(`estudantes/${estudanteId}`, { method: 'PATCH', body: JSON.stringify({ funcao_equipe: funcao }) });
    const idx = state.estudantes.findIndex(s => s.id === estudanteId);
    state.estudantes[idx] = { ...state.estudantes[idx], ...updated };
    showToast('Função atualizada!');
  } catch (err) {
    console.error(err);
    showToast('Erro ao atualizar função.', 'fa-solid fa-triangle-exclamation');
  }
}

async function setStatusEquipe(equipeId, status) {
  try {
    const updated = await api(`equipes/${equipeId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    const idx = state.equipes.findIndex(e => e.id === equipeId);
    state.equipes[idx] = { ...state.equipes[idx], ...updated };
    renderEquipes();
    renderStats();
    showToast(status === 'Aprovada' ? 'Equipe aprovada! 🎉' : 'Equipe reaberta para ajustes.');
  } catch (err) {
    console.error(err);
    showToast('Erro ao atualizar status da equipe.', 'fa-solid fa-triangle-exclamation');
  }
}

async function deleteEquipe(id) {
  if (!confirm('Remover esta equipe? Os integrantes ficarão sem equipe.')) return;
  try {
    await api(`equipes/${id}`, { method: 'DELETE' });
    const membros = state.estudantes.filter(s => s.equipe_id === id);
    await Promise.all(membros.map(m => api(`estudantes/${m.id}`, { method: 'PATCH', body: JSON.stringify({ equipe_id: '' }) })));
    state.equipes = state.equipes.filter(e => e.id !== id);
    state.estudantes.forEach(s => { if (s.equipe_id === id) s.equipe_id = ''; });
    renderEquipes();
    renderEstudantes();
    renderStats();
    showToast('Equipe removida.');
  } catch (err) {
    console.error(err);
    showToast('Erro ao remover equipe.', 'fa-solid fa-triangle-exclamation');
  }
}

/* --------------------------------------------------------------------------
   Exportar informações do clube / Link público para compartilhar
   -------------------------------------------------------------------------- */

function publicShareUrl() {
  const base = location.href.replace(/app\/clube\.html.*$/, 'app/clube-publico.html');
  return `${base}?id=${state.clube.id}`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback para navegadores sem suporte à Clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}

function downloadFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function buildClubeExportSummary() {
  const c = state.clube;
  const linhas = [];
  linhas.push(`HACK CLUB — Ficha do Clube`);
  linhas.push(`==========================`);
  linhas.push(`Nome: ${c.nome_clube || '—'}`);
  linhas.push(`Escola: ${c.escola || '—'}`);
  linhas.push(`Cidade/UF: ${c.cidade || '—'}${c.estado ? '/' + c.estado : ''}`);
  if (c.instagram) linhas.push(`Instagram do clube: ${c.instagram}`);
  if (c.descricao) linhas.push(`Descrição: ${c.descricao}`);
  linhas.push(`Status: ${c.status || '—'}`);
  linhas.push('');
  linhas.push(`PROFESSORES MENTORES (${state.mentores.length})`);
  linhas.push(`--------------------------`);
  if (state.mentores.length === 0) linhas.push('Nenhum professor mentor cadastrado.');
  state.mentores.forEach(m => {
    linhas.push(`• ${m.nome}${m.area_atuacao ? ' — ' + m.area_atuacao : ''}`);
    if (m.email) linhas.push(`  E-mail: ${m.email}`);
    if (m.telefone) linhas.push(`  Telefone: ${m.telefone}`);
    if (m.linkedin) linhas.push(`  LinkedIn: ${linkedinUrl(m.linkedin)}`);
    if (m.bio) linhas.push(`  Bio: ${m.bio}`);
  });
  linhas.push('');
  linhas.push(`EQUIPES (${state.equipes.length})`);
  linhas.push(`--------------------------`);
  if (state.equipes.length === 0) linhas.push('Nenhuma equipe criada.');
  state.equipes.forEach(eq => {
    const membros = state.estudantes.filter(s => s.equipe_id === eq.id);
    linhas.push(`• ${eq.nome_equipe}${eq.lema ? ' — "' + eq.lema + '"' : ''} [${eq.status || 'Em formação'}]`);
    membros.forEach(m => {
      linhas.push(`   - ${m.nome}${m.funcao_equipe ? ' (' + m.funcao_equipe + ')' : ''}${m.perfil_hack ? ' · Perfil HACK: ' + m.perfil_hack : ''}${m.instagram ? ' · Instagram: ' + m.instagram : ''}`);
    });
  });
  linhas.push('');
  linhas.push(`TODOS OS ESTUDANTES (${state.estudantes.length})`);
  linhas.push(`--------------------------`);
  if (state.estudantes.length === 0) linhas.push('Nenhum estudante convidado.');
  state.estudantes.forEach(s => {
    linhas.push(`• ${s.nome}${s.turma_serie ? ' — ' + s.turma_serie : ''}`);
    if (s.email) linhas.push(`  E-mail: ${s.email}`);
    if (s.instagram) linhas.push(`  Instagram: ${s.instagram}`);
    if (s.perfil_hack) linhas.push(`  Perfil HACK: ${s.perfil_hack}`);
  });
  linhas.push('');
  linhas.push(`Link público para compartilhar: ${publicShareUrl()}`);
  return linhas.join('\n');
}

function buildClubeExportJSON() {
  const c = state.clube;
  const payload = {
    clube: {
      nome_clube: c.nome_clube, escola: c.escola, cidade: c.cidade, estado: c.estado,
      descricao: c.descricao, instagram: c.instagram || '', status: c.status,
    },
    mentores: state.mentores.map(m => ({
      nome: m.nome, email: m.email, telefone: m.telefone, area_atuacao: m.area_atuacao,
      linkedin: m.linkedin || '', bio: m.bio,
    })),
    equipes: state.equipes.map(eq => ({
      nome_equipe: eq.nome_equipe, lema: eq.lema, cor_tema: eq.cor_tema, status: eq.status,
      integrantes: state.estudantes.filter(s => s.equipe_id === eq.id).map(s => ({
        nome: s.nome, funcao_equipe: s.funcao_equipe, perfil_hack: s.perfil_hack || '', instagram: s.instagram || '',
      })),
    })),
    estudantes: state.estudantes.map(s => ({
      nome: s.nome, email: s.email, turma_serie: s.turma_serie, instagram: s.instagram || '', perfil_hack: s.perfil_hack || '',
    })),
    link_publico: publicShareUrl(),
  };
  return JSON.stringify(payload, null, 2);
}

function slugify(text) {
  return (text || 'clube').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function openExportShareModal() {
  const link = publicShareUrl();
  openModal(`
    <div class="p-6 sm:p-7">
      <div class="flex items-center justify-between mb-5">
        <h3 class="font-display text-lg font-bold text-slate-900"><i class="fa-solid fa-share-nodes mr-2 text-brand-yellow-dark"></i>Exportar e compartilhar</h3>
        <button data-close-modal class="text-slate-400 hover:text-slate-700"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>

      <p class="text-xs text-slate-500 mb-4 leading-relaxed">Use o link público para inscrever o clube em eventos como o <strong>HACK Festival</strong>, ou envie para qualquer pessoa conhecer a equipe — nome, foto, Instagram dos estudantes e LinkedIn dos professores mentores. Não é preciso login para visualizar.</p>

      <label class="form-label">Link público do clube</label>
      <div class="flex items-stretch gap-2 mb-2">
        <input id="input-link-publico" type="text" readonly value="${link}" class="form-input text-xs flex-1" onclick="this.select()">
        <button id="btn-copiar-link" class="btn-accent px-4 rounded-lg text-sm font-semibold whitespace-nowrap"><i class="fa-solid fa-copy mr-1.5"></i>Copiar</button>
      </div>
      <a href="${link}" target="_blank" rel="noopener" class="text-xs font-semibold text-brand-yellow-dark hover:underline"><i class="fa-solid fa-arrow-up-right-from-square mr-1"></i> Abrir página pública em nova aba</a>

      <div class="border-t border-slate-200 my-5"></div>

      <label class="form-label mb-2">Exportar dados do clube</label>
      <div class="grid sm:grid-cols-2 gap-3">
        <button id="btn-export-txt" class="chip-btn justify-center"><i class="fa-solid fa-file-lines"></i> Baixar resumo (.txt)</button>
        <button id="btn-export-json" class="chip-btn justify-center"><i class="fa-solid fa-file-code"></i> Baixar dados (.json)</button>
      </div>
    </div>
  `);

  $('#btn-copiar-link').addEventListener('click', async () => {
    const ok = await copyToClipboard(link);
    showToast(ok ? 'Link copiado! Cole onde quiser enviar.' : 'Não foi possível copiar automaticamente. Selecione o texto e copie.', ok ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation');
  });
  $('#btn-export-txt').addEventListener('click', () => {
    downloadFile(`${slugify(state.clube.nome_clube)}-resumo.txt`, buildClubeExportSummary(), 'text/plain');
    showToast('Resumo exportado!');
  });
  $('#btn-export-json').addEventListener('click', () => {
    downloadFile(`${slugify(state.clube.nome_clube)}-dados.json`, buildClubeExportJSON(), 'application/json');
    showToast('Dados exportados em JSON!');
  });
}

/* --------------------------------------------------------------------------
   Tabs
   -------------------------------------------------------------------------- */

function setupTabs() {
  $all('.app-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('.app-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      $all('.app-tab-panel').forEach(p => p.classList.add('hidden'));
      $(`#tab-${tab}`).classList.remove('hidden');
    });
  });
}

/* --------------------------------------------------------------------------
   Delegação de eventos
   -------------------------------------------------------------------------- */

function setupEventDelegation() {
  document.body.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close-modal]');
    if (closeBtn) return closeModal();

    if (e.target.id === 'modal-backdrop') return closeModal();

    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.getAttribute('data-action');
    const id = actionEl.getAttribute('data-id');

    switch (action) {
      case 'del-mentor': return deleteMentor(id);
      case 'edit-estudante': return openEditEstudanteModal(id);
      case 'del-estudante': return deleteEstudante(id);
      case 'del-equipe': return deleteEquipe(id);
      case 'edit-equipe': return openEditEquipeModal(id);
      case 'add-membro': return openAddMembroModal(id);
      case 'remove-membro': return removeMembroFromEquipe(id);
      case 'aprovar-equipe': return setStatusEquipe(id, 'Aprovada');
      case 'reabrir-equipe': return setStatusEquipe(id, 'Em formação');
      case 'confirm-add-membro': {
        const estudanteId = actionEl.getAttribute('data-estudante-id');
        const equipeId = actionEl.getAttribute('data-equipe-id');
        return addMembroToEquipe(estudanteId, equipeId);
      }
    }
  });

  document.body.addEventListener('change', (e) => {
    const el = e.target.closest('[data-action="set-funcao"]');
    if (el) setFuncaoMembro(el.getAttribute('data-id'), el.value);
  });
}

/* --------------------------------------------------------------------------
   Init
   -------------------------------------------------------------------------- */

function setupStaticButtons() {
  $('#form-criar-clube').addEventListener('submit', handleCriarClube);
  $('#btn-editar-clube').addEventListener('click', openEditarClubeModal);
  $('#btn-export-share').addEventListener('click', openExportShareModal);
  $('#btn-add-mentor').addEventListener('click', openAddMentorModal);
  $('#btn-add-estudante').addEventListener('click', openAddEstudanteModal);
  $('#btn-add-equipe').addEventListener('click', openAddEquipeModal);
  $('#btn-sair-clube').addEventListener('click', () => {
    if (!confirm('Deseja trocar de clube? Você poderá voltar a este clube depois.')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupStaticButtons();
  setupTabs();
  setupEventDelegation();
  tryLoadActiveClube();
});
