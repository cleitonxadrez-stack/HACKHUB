/* ==========================================================================
   HACK HUB® — HACK Festival (app funcional)
   Inscrição de projetos (a partir do projeto concluído na Jornada Discovery),
   envio de pitch final, acompanhamento de avaliação/finalista/vencedor.
   Persistência via Table API (tables/festival_inscricoes, projetos_discovery)
   ========================================================================== */

const STORAGE_CLUBE_KEY = 'hh_clube_ativo_id';
const STORAGE_EQUIPE_KEY = 'hh_equipe_discovery_id';

const state = {
  clube: null,
  equipes: [],
  equipeAtiva: null,
  projetoDiscovery: null,
  inscricao: null,
};

const STATUS_HERO = {
  'Inscrito': {
    bg: 'linear-gradient(135deg,#101010,#1C1C1C)',
    emoji: '🎉',
    titulo: 'Inscrição confirmada!',
    texto: 'Seu projeto está inscrito no HACK Festival. Aguarde a avaliação da apresentação.',
  },
  'Avaliado': {
    bg: 'linear-gradient(135deg,#101010,#1C1C1C)',
    emoji: '📋',
    titulo: 'Apresentação avaliada!',
    texto: 'Veja abaixo a nota e o feedback recebidos. Fique de olho nos próximos resultados.',
  },
  'Finalista': {
    bg: 'linear-gradient(135deg,#E0A800,#FFC800)',
    emoji: '🏅',
    titulo: 'Sua equipe é finalista do HACK Festival!',
    texto: 'Parabéns! Seu projeto está entre os melhores do Ecossistema HACK BRASIL.',
  },
  'Vencedor': {
    bg: 'linear-gradient(135deg,#D4A017,#FFE27A)',
    emoji: '🏆',
    titulo: 'Sua equipe é vencedora do HACK Festival!',
    texto: 'Uma conquista incrível! Parabéns a toda a equipe pelo trabalho e pelo impacto gerado.',
  },
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

/* --------------------------------------------------------------------------
   Alternância de views
   -------------------------------------------------------------------------- */

const VIEWS = ['loading', 'erro', 'sem-clube', 'sem-equipe', 'escolher-equipe', 'sem-projeto', 'inscrever', 'status'];

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
  decidirView();
}

/* --------------------------------------------------------------------------
   Carregamento de dados
   -------------------------------------------------------------------------- */

async function carregarDados(equipe) {
  const [projetosRes, inscricoesRes] = await Promise.all([
    api(`projetos_discovery?limit=200`),
    api(`festival_inscricoes?limit=200`),
  ]);
  state.projetoDiscovery = (projetosRes.data || []).find(p => p.equipe_id === equipe.id) || null;
  state.inscricao = (inscricoesRes.data || []).find(i => i.equipe_id === equipe.id) || null;
}

function decidirView() {
  const projeto = state.projetoDiscovery;
  const concluidas = projeto ? (projeto.missoes_concluidas || []).length : 0;

  if (!projeto || concluidas < 10) {
    return showView('sem-projeto');
  }

  if (state.inscricao) {
    renderStatus();
    showView('status');
  } else {
    renderInscrever();
    showView('inscrever');
  }
}

/* --------------------------------------------------------------------------
   Render: Inscrever projeto
   -------------------------------------------------------------------------- */

function renderInscrever() {
  const projeto = state.projetoDiscovery;
  $('#projeto-resumo-card').innerHTML = `
    <p class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">Projeto da equipe</p>
    <p class="font-display text-lg font-bold text-slate-900 mb-1">${escapeHtml(projeto.m8_nome_projeto || 'Projeto sem nome')}</p>
    <p class="text-sm text-slate-500">${escapeHtml((projeto.m8_descricao_solucao || '').replace(/<[^>]+>/g, '').slice(0, 220) || 'Sem descrição registrada.')}</p>
  `;
  const form = $('#form-inscrever');
  if (projeto.m10_pitch_url) {
    form.querySelector('[name="pitch_url"]').value = projeto.m10_pitch_url;
  }
}

async function handleInscrever(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Inscrevendo...';

  try {
    const payload = {
      clube_id: state.clube.id,
      equipe_id: state.equipeAtiva.id,
      projeto_id: state.projetoDiscovery.id,
      pitch_url: (data.pitch_url || '').trim().slice(0, 500),
      status: 'Inscrito',
    };
    const created = await api('festival_inscricoes', { method: 'POST', body: JSON.stringify(payload) });
    state.inscricao = created;
    showToast('🎉 Projeto inscrito no HACK Festival com sucesso!');
    renderStatus();
    showView('status');
  } catch (err) {
    console.error(err);
    showToast('Não foi possível concluir a inscrição. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-champagne-glasses"></i> Inscrever no HACK Festival';
  }
}

/* --------------------------------------------------------------------------
   Render: Status da inscrição
   -------------------------------------------------------------------------- */

function renderStatus() {
  const insc = state.inscricao;
  const info = STATUS_HERO[insc.status] || STATUS_HERO['Inscrito'];

  $('#status-hero').style.background = info.bg;
  $('#status-hero').innerHTML = `
    <div class="relative">
      <p class="text-5xl mb-3">${info.emoji}</p>
      <h1 class="font-display text-2xl sm:text-3xl font-bold mb-2" style="color:${insc.status === 'Finalista' || insc.status === 'Vencedor' ? '#101010' : '#fff'};">${info.titulo}</h1>
      <p class="text-sm max-w-md mx-auto" style="color:${insc.status === 'Finalista' || insc.status === 'Vencedor' ? '#4A2E00' : '#CBD5E1'};">${info.texto}</p>
    </div>
  `;

  $('#status-pitch-url').textContent = insc.pitch_url || '—';

  if (insc.status === 'Avaliado' || insc.status === 'Finalista' || insc.status === 'Vencedor') {
    $('#status-avaliacao-card').classList.remove('hidden');
    $('#status-nota').textContent = (insc.avaliacao_nota_apresentacao !== undefined && insc.avaliacao_nota_apresentacao !== null) ? `${insc.avaliacao_nota_apresentacao}/10` : '—';
    $('#status-feedback').textContent = insc.avaliacao_feedback || 'Sem feedback registrado ainda.';
  } else {
    $('#status-avaliacao-card').classList.add('hidden');
  }

  // Permite editar o pitch apenas antes de avaliado
  $('#btn-editar-pitch').classList.toggle('hidden', insc.status !== 'Inscrito');
}

function handleEditarPitch() {
  const novoLink = prompt('Cole o novo link do pitch final:', state.inscricao.pitch_url || '');
  if (novoLink === null) return;
  const link = novoLink.trim().slice(0, 500);
  if (!link) return;

  api(`festival_inscricoes/${state.inscricao.id}`, { method: 'PATCH', body: JSON.stringify({ pitch_url: link }) })
    .then(updated => {
      state.inscricao = { ...state.inscricao, ...updated };
      showToast('Link do pitch atualizado!');
      renderStatus();
    })
    .catch(err => {
      console.error(err);
      showToast('Não foi possível atualizar o link.', 'fa-solid fa-triangle-exclamation');
    });
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
  $('#form-inscrever').addEventListener('submit', handleInscrever);
  $('#btn-editar-pitch').addEventListener('click', handleEditarPitch);
  init();
});
