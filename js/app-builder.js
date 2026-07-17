/* ==========================================================================
   HACK HUB® — Jornada HACK Builder (app funcional)
   Trilhas de competências com desbloqueio sequencial + gamificação em
   Pontos Builder. Persistência via Table API (tables/builder_conclusoes)
   ========================================================================== */

const STORAGE_CLUBE_KEY = 'hh_clube_ativo_id';
const STORAGE_EQUIPE_KEY = 'hh_equipe_discovery_id'; // mesma chave usada no Discovery/Banco HACK — equipe vale para toda a Jornada

const state = {
  clube: null,
  equipes: [],
  equipeAtiva: null,
  conclusoes: [],
  trilhaAtual: null,
  competenciaAtual: null,
};

/* --------------------------------------------------------------------------
   Catálogo de Trilhas e Competências (fixo, definido pela metodologia)
   -------------------------------------------------------------------------- */

const TRILHAS = [
  {
    id: 'inovacao',
    titulo: 'Inovação & Criatividade',
    icone: 'fa-solid fa-lightbulb',
    descricao: 'Técnicas para gerar e testar ideias fora da caixa.',
    competencias: [
      { id: 'inovacao-1', titulo: 'Brainstorming estruturado', subtitulo: 'Aprenda uma técnica de brainstorming e aplique no problema da sua equipe.', pontos: 20, pergunta: 'Liste pelo menos 5 ideias que surgiram usando a técnica.' },
      { id: 'inovacao-2', titulo: 'Pensamento lateral', subtitulo: 'Pratique enxergar o problema de ângulos inesperados.', pontos: 20, pergunta: 'Descreva uma ideia "fora da caixa" que a equipe não tinha considerado antes.' },
      { id: 'inovacao-3', titulo: 'Prototipagem rápida', subtitulo: 'Construa uma versão simples e barata de uma ideia para testar.', pontos: 30, pergunta: 'Descreva o protótipo que a equipe construiu (materiais, tempo, o que testava).' },
      { id: 'inovacao-4', titulo: 'Cultura de experimentação', subtitulo: 'Defina um pequeno experimento para validar uma hipótese do projeto.', pontos: 30, pergunta: 'Qual hipótese a equipe queria testar e o que descobriu com o experimento?' },
    ],
  },
  {
    id: 'tecnologia',
    titulo: 'Tecnologia',
    icone: 'fa-solid fa-laptop-code',
    descricao: 'Ferramentas digitais para construir e escalar a solução.',
    competencias: [
      { id: 'tecnologia-1', titulo: 'Ferramentas no-code/low-code', subtitulo: 'Explore uma ferramenta sem programação para criar um protótipo digital.', pontos: 20, pergunta: 'Qual ferramenta a equipe usou e o que foi construído com ela?' },
      { id: 'tecnologia-2', titulo: 'Automação simples', subtitulo: 'Identifique uma tarefa repetitiva do projeto que poderia ser automatizada.', pontos: 20, pergunta: 'Descreva a tarefa e como a automação (ou a ideia dela) ajudaria a equipe.' },
      { id: 'tecnologia-3', titulo: 'Dados e evidências', subtitulo: 'Organize os dados/pesquisas do projeto em uma planilha ou gráfico simples.', pontos: 30, pergunta: 'Que dados foram organizados e o que eles mostram sobre o problema?' },
      { id: 'tecnologia-4', titulo: 'Publicar online', subtitulo: 'Publique o MVP ou uma página simples do projeto na internet.', pontos: 30, pergunta: 'Cole o link publicado e explique o que ele mostra.' },
    ],
  },
  {
    id: 'ia',
    titulo: 'Inteligência Artificial',
    icone: 'fa-solid fa-robot',
    descricao: 'Uso responsável de IA para acelerar pesquisa e criação.',
    competencias: [
      { id: 'ia-1', titulo: 'IA para pesquisa', subtitulo: 'Use uma ferramenta de IA generativa para pesquisar sobre o problema da equipe.', pontos: 20, pergunta: 'Qual pergunta foi feita à IA e o que a equipe aprendeu com a resposta?' },
      { id: 'ia-2', titulo: 'IA para criação de conteúdo', subtitulo: 'Use IA para gerar um rascunho de texto, imagem ou roteiro para o projeto.', pontos: 20, pergunta: 'O que foi gerado e como a equipe adaptou/revisou o resultado?' },
      { id: 'ia-3', titulo: 'Checagem e ética', subtitulo: 'Verifique manualmente uma informação gerada por IA antes de usá-la.', pontos: 30, pergunta: 'Qual informação foi checada e o que a equipe descobriu ao verificar?' },
      { id: 'ia-4', titulo: 'IA aplicada à solução', subtitulo: 'Imagine como IA poderia tornar a solução da equipe mais inteligente no futuro.', pontos: 30, pergunta: 'Descreva a ideia de uso de IA na solução do projeto.' },
    ],
  },
  {
    id: 'empreendedorismo',
    titulo: 'Empreendedorismo',
    icone: 'fa-solid fa-rocket',
    descricao: 'Transforme a solução em um negócio ou iniciativa sustentável.',
    competencias: [
      { id: 'empreendedorismo-1', titulo: 'Modelo de negócio', subtitulo: 'Defina como a solução da equipe poderia se sustentar financeiramente.', pontos: 20, pergunta: 'Descreva a ideia de modelo de sustentação (venda, doação, patrocínio, etc.).' },
      { id: 'empreendedorismo-2', titulo: 'Público e concorrência', subtitulo: 'Identifique quem mais já tenta resolver esse problema.', pontos: 20, pergunta: 'Quais soluções parecidas a equipe encontrou e o que a delas é diferente?' },
      { id: 'empreendedorismo-3', titulo: 'Pitch de negócio', subtitulo: 'Prepare um pitch curto (1 minuto) focado no valor da solução.', pontos: 30, pergunta: 'Escreva o roteiro do pitch de 1 minuto.' },
      { id: 'empreendedorismo-4', titulo: 'Plano de crescimento', subtitulo: 'Pense em como a solução poderia crescer/escalar para mais pessoas.', pontos: 30, pergunta: 'Descreva o plano de crescimento da equipe para os próximos passos.' },
    ],
  },
  {
    id: 'gestao',
    titulo: 'Gestão de Projetos',
    icone: 'fa-solid fa-diagram-project',
    descricao: 'Organize o time, o tempo e as entregas do projeto.',
    competencias: [
      { id: 'gestao-1', titulo: 'Divisão de tarefas', subtitulo: 'Organize quem faz o quê no projeto nas próximas semanas.', pontos: 20, pergunta: 'Liste as tarefas e quem da equipe é responsável por cada uma.' },
      { id: 'gestao-2', titulo: 'Cronograma simples', subtitulo: 'Defina prazos para as próximas entregas do projeto.', pontos: 20, pergunta: 'Quais são os próximos prazos/marcos definidos pela equipe?' },
      { id: 'gestao-3', titulo: 'Retrospectiva de equipe', subtitulo: 'Reflita com a equipe sobre o que está funcionando bem e o que pode melhorar.', pontos: 30, pergunta: 'O que funcionou bem e o que a equipe quer melhorar a partir de agora?' },
      { id: 'gestao-4', titulo: 'Gestão de riscos', subtitulo: 'Identifique um risco que pode atrapalhar o projeto e um plano B.', pontos: 30, pergunta: 'Qual risco foi identificado e qual o plano para lidar com ele?' },
    ],
  },
];

function trilhaById(id) { return TRILHAS.find(t => t.id === id); }
function competenciaById(trilha, id) { return trilha.competencias.find(c => c.id === id); }

/* --------------------------------------------------------------------------
   Helpers gerais (mesmo padrão do Discovery/Banco HACK)
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

const VIEWS = ['loading', 'erro', 'sem-clube', 'sem-equipe', 'escolher-equipe', 'dashboard', 'trilha', 'competencia'];

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

  const conclusoesRes = await api(`builder_conclusoes?limit=500`);
  state.conclusoes = (conclusoesRes.data || []).filter(c => c.equipe_id === equipe.id);

  renderDashboard();
  showView('dashboard');
}

/* --------------------------------------------------------------------------
   Cálculos de progresso
   -------------------------------------------------------------------------- */

function conclusoesDaTrilha(trilhaId) {
  return state.conclusoes.filter(c => c.trilha_id === trilhaId);
}

function competenciaConcluida(competenciaId) {
  return state.conclusoes.find(c => c.competencia_id === competenciaId) || null;
}

function totalPontosBuilder() {
  return state.conclusoes.reduce((soma, c) => soma + (c.pontos || 0), 0);
}

/** Dentro de uma trilha, as competências são desbloqueadas em sequência. */
function competenciaDesbloqueada(trilha, index) {
  if (index === 0) return true;
  const anterior = trilha.competencias[index - 1];
  return !!competenciaConcluida(anterior.id);
}

/* --------------------------------------------------------------------------
   Render: Dashboard (grid de trilhas)
   -------------------------------------------------------------------------- */

function renderDashboard() {
  $('#equipe-nome').textContent = state.equipeAtiva.nome_equipe;
  $('#pontos-builder').textContent = totalPontosBuilder();

  const wrap = $('#grid-trilhas');
  wrap.innerHTML = TRILHAS.map(trilha => {
    const total = trilha.competencias.length;
    const concluidas = conclusoesDaTrilha(trilha.id).length;
    const pct = Math.round((concluidas / total) * 100);
    const pontosTrilha = conclusoesDaTrilha(trilha.id).reduce((s, c) => s + (c.pontos || 0), 0);
    return `
      <button data-trilha-id="${trilha.id}" class="app-card text-left hover:border-brand-yellow transition-colors" style="border:2px solid transparent;">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 rounded-xl bg-black text-brand-yellow flex items-center justify-center text-lg shrink-0"><i class="${trilha.icone}"></i></div>
          ${concluidas === total ? '<span class="badge badge-yellow"><i class="fa-solid fa-check mr-1"></i>Completa</span>' : `<span class="badge badge-dark">${concluidas}/${total}</span>`}
        </div>
        <p class="font-semibold text-slate-900 mb-1">${escapeHtml(trilha.titulo)}</p>
        <p class="text-xs text-slate-500 mb-4">${escapeHtml(trilha.descricao)}</p>
        <div class="progress-track mb-2"><div class="progress-fill" style="width:${pct}%"></div></div>
        <p class="text-xs text-slate-400">${pontosTrilha} pontos Builder ganhos nesta trilha</p>
      </button>
    `;
  }).join('');

  $all('[data-trilha-id]', wrap).forEach(btn => {
    btn.addEventListener('click', () => abrirTrilha(btn.getAttribute('data-trilha-id')));
  });
}

/* --------------------------------------------------------------------------
   Render: Trilha (lista de competências)
   -------------------------------------------------------------------------- */

function abrirTrilha(trilhaId) {
  const trilha = trilhaById(trilhaId);
  state.trilhaAtual = trilha;
  $('#trilha-icon').innerHTML = `<i class="${trilha.icone}"></i>`;
  $('#trilha-titulo').textContent = trilha.titulo;
  $('#trilha-descricao').textContent = trilha.descricao;
  renderListaCompetencias();
  showView('trilha');
}

function renderListaCompetencias() {
  const trilha = state.trilhaAtual;
  const wrap = $('#lista-competencias');
  wrap.innerHTML = trilha.competencias.map((comp, idx) => {
    const feita = competenciaConcluida(comp.id);
    const desbloqueada = competenciaDesbloqueada(trilha, idx);
    let classe = 'is-locked';
    let icone = 'fa-lock';
    if (feita) { classe = 'is-done'; icone = 'fa-check'; }
    else if (desbloqueada) { classe = 'is-current'; icone = 'fa-play'; }
    return `
      <button data-comp-id="${comp.id}" ${desbloqueada ? '' : 'disabled'} class="missao-row w-full text-left ${classe}" ${!desbloqueada ? 'style="opacity:.5;cursor:not-allowed;"' : ''}>
        <div class="missao-icon"><i class="fa-solid ${icone}"></i></div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-900 text-sm">${escapeHtml(comp.titulo)}</p>
          <p class="text-xs text-slate-500">${escapeHtml(comp.subtitulo)}</p>
        </div>
        <span class="badge badge-dark shrink-0">+${comp.pontos}</span>
      </button>
    `;
  }).join('');

  $all('[data-comp-id]', wrap).forEach(btn => {
    if (btn.disabled) return;
    btn.addEventListener('click', () => abrirCompetencia(btn.getAttribute('data-comp-id')));
  });
}

/* --------------------------------------------------------------------------
   Render: Competência (formulário / resultado)
   -------------------------------------------------------------------------- */

function abrirCompetencia(compId) {
  const trilha = state.trilhaAtual;
  const comp = competenciaById(trilha, compId);
  state.competenciaAtual = comp;
  const feita = competenciaConcluida(comp.id);

  if (feita) {
    $('#competencia-conteudo').innerHTML = `
      <div class="text-center mb-6">
        <div class="w-16 h-16 rounded-2xl bg-brand-yellow/20 text-brand-yellow-dark flex items-center justify-center text-2xl mx-auto mb-4"><i class="fa-solid fa-check"></i></div>
        <h1 class="font-display text-xl font-bold text-slate-900 mb-1">${escapeHtml(comp.titulo)}</h1>
        <p class="text-sm text-slate-500">Competência já concluída — <strong class="text-brand-yellow-dark">+${feita.pontos} Pontos Builder</strong></p>
      </div>
      <div class="app-card">
        <p class="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">${escapeHtml(comp.pergunta)}</p>
        <p class="text-sm text-slate-600 whitespace-pre-line">${escapeHtml(feita.entrega_texto || '—')}</p>
        ${feita.entrega_url ? `<p class="text-xs text-slate-400 mt-3"><i class="fa-solid fa-link mr-1"></i>${escapeHtml(feita.entrega_url)}</p>` : ''}
      </div>
    `;
  } else {
    $('#competencia-conteudo').innerHTML = `
      <div class="mb-6">
        <span class="badge badge-yellow mb-3"><i class="fa-solid fa-star mr-1.5"></i> +${comp.pontos} Pontos Builder</span>
        <h1 class="font-display text-xl font-bold text-slate-900 mb-1">${escapeHtml(comp.titulo)}</h1>
        <p class="text-sm text-slate-500">${escapeHtml(comp.subtitulo)}</p>
      </div>
      <form id="form-competencia" class="space-y-4">
        <div>
          <label class="form-label">${escapeHtml(comp.pergunta)}</label>
          <textarea name="entrega_texto" required rows="5" maxlength="2000" class="form-textarea" placeholder="Escreva a resposta da equipe..."></textarea>
        </div>
        <div>
          <label class="form-label">Link de evidência <span class="text-slate-400 font-normal">(opcional)</span></label>
          <input type="text" name="entrega_url" maxlength="500" class="form-input" placeholder="Ex.: link de documento, imagem ou vídeo">
        </div>
        <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Concluir competência</button>
      </form>
    `;
    $('#form-competencia').addEventListener('submit', handleConcluirCompetencia);
  }
  showView('competencia');
}

async function handleConcluirCompetencia(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());
  const comp = state.competenciaAtual;
  const trilha = state.trilhaAtual;

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

  try {
    const payload = {
      clube_id: state.clube.id,
      equipe_id: state.equipeAtiva.id,
      trilha_id: trilha.id,
      competencia_id: comp.id,
      pontos: comp.pontos,
      entrega_texto: (data.entrega_texto || '').slice(0, 2000),
      entrega_url: (data.entrega_url || '').slice(0, 500),
    };
    const created = await api('builder_conclusoes', { method: 'POST', body: JSON.stringify(payload) });
    state.conclusoes.push(created);
    showToast(`🎉 Competência concluída! Sua equipe ganhou +${comp.pontos} Pontos Builder`);
    renderListaCompetencias();
    showView('trilha');
  } catch (err) {
    console.error(err);
    showToast('Não foi possível salvar. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    btn.disabled = false;
    btn.innerHTML = 'Concluir competência';
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
  $('#btn-voltar-trilhas').addEventListener('click', () => {
    renderDashboard();
    showView('dashboard');
  });
  $('#btn-voltar-competencia').addEventListener('click', () => {
    renderListaCompetencias();
    showView('trilha');
  });
  init();
});
