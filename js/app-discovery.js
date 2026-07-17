/* ==========================================================================
   HACK HUB® — Jornada HACK Discovery (app funcional)
   10 missões, gamificação em Pontos de Impacto, projeto montado automaticamente.
   Persistência via Table API (tables/projetos_discovery)
   ========================================================================== */

const STORAGE_CLUBE_KEY = 'hh_clube_ativo_id';
const STORAGE_EQUIPE_KEY = 'hh_equipe_discovery_id';

const state = {
  clube: null,
  equipes: [],
  equipeAtiva: null,
  projeto: null,
};

const ODS_LIST = [
  '1 — Erradicação da Pobreza',
  '2 — Fome Zero e Agricultura Sustentável',
  '3 — Saúde e Bem-Estar',
  '4 — Educação de Qualidade',
  '5 — Igualdade de Gênero',
  '6 — Água Potável e Saneamento',
  '7 — Energia Limpa e Acessível',
  '8 — Trabalho Decente e Crescimento Econômico',
  '9 — Indústria, Inovação e Infraestrutura',
  '10 — Redução das Desigualdades',
  '11 — Cidades e Comunidades Sustentáveis',
  '12 — Consumo e Produção Responsáveis',
  '13 — Ação Contra a Mudança Global do Clima',
  '14 — Vida na Água',
  '15 — Vida Terrestre',
  '16 — Paz, Justiça e Instituições Eficazes',
  '17 — Parcerias e Meios de Implementação',
];

const CONTEXTOS_PROBLEMA = {
  escola: { label: 'Escola', instrucao: 'Caminhe pela escola e registre três problemas que poderiam ser melhorados.', campo: 'm2_problemas_escola' },
  comunidade: { label: 'Comunidade', instrucao: 'Observe seu bairro, converse com pessoas e descubra três problemas reais da comunidade.', campo: 'm3_problemas_comunidade' },
  municipio: { label: 'Município', instrucao: 'Pesquise e registre três problemas que afetam o município como um todo.', campo: 'm4_problemas_municipio' },
  empresa: { label: 'Empresa', instrucao: 'Converse com comerciantes e empresários locais e registre três desafios de empresas da região.', campo: 'm5_problemas_empresa' },
};

// Mesma fórmula/constantes do motor de cálculo do IIH usado no Banco HACK (js/app-banco-hack.js),
// reaproveitadas aqui para a Avaliação do Professor Mentor sobre o projeto real da Jornada Discovery.
const MULTIPLICADOR_PROFUNDIDADE = { 'Paliativa': 1, 'Sistêmica': 2, 'Transformadora': 3 };
const SELO_INFO = {
  'Bronze': { emoji: '🥉', gradiente: 'linear-gradient(145deg,#E3A469,#CD7F32)', cor: '#fff', desc: 'Resolve o sintoma, primeiro passo.' },
  'Prata': { emoji: '🥈', gradiente: 'linear-gradient(145deg,#E5E7EB,#9CA3AF)', cor: '#334155', desc: 'Ataca causas, solução integrada.' },
  'Ouro': { emoji: '🥇', gradiente: 'linear-gradient(145deg,#FFE27A,#D4A017)', cor: '#4A2E00', desc: 'Alto impacto, múltiplos ODS.' },
  'Diamante': { emoji: '💎', gradiente: 'linear-gradient(145deg,#93E5FF,#6C7BFA)', cor: '#fff', desc: 'Pode ser replicada em escala, muda o jogo.' },
};

function calcularPontosOds(qtdDiretos, qtdIndiretos, profundidade) {
  const mult = MULTIPLICADOR_PROFUNDIDADE[profundidade] || 1;
  const pontosBrutos = (qtdDiretos * 3 + qtdIndiretos * 1) * mult;
  const notaDimensao = Math.min(40, pontosBrutos);
  return { pontosBrutos, notaDimensao };
}

function calcularSeloIih(profundidade, pontosBrutosOds) {
  if (profundidade === 'Transformadora') return 'Diamante';
  if (profundidade === 'Sistêmica' && pontosBrutosOds > 25) return 'Ouro';
  if (profundidade === 'Sistêmica' && pontosBrutosOds >= 10) return 'Prata';
  return 'Bronze';
}

const MISSOES = [
  { n: 1, fase: 'Explorar', titulo: 'Missão 1 · Conhecendo a metodologia', subtitulo: 'Entenda como funciona a Jornada HACK e como sua equipe vai desenvolver um projeto de inovação.', tempo: '20 minutos', pontos: 10 },
  { n: 2, fase: 'Observar', titulo: 'Missão 2 · Problemas na escola', subtitulo: 'Caminhe pela escola e registre três problemas que poderiam ser melhorados.', tempo: '40 minutos', pontos: 40, contexto: 'escola' },
  { n: 3, fase: 'Observar', titulo: 'Missão 3 · Problemas da comunidade', subtitulo: 'Observe seu bairro, converse com pessoas e descubra três problemas reais.', tempo: '40 minutos', pontos: 40, contexto: 'comunidade' },
  { n: 4, fase: 'Observar', titulo: 'Missão 4 · Problemas do município', subtitulo: 'Pesquise três problemas que afetam o município.', tempo: '40 minutos', pontos: 40, contexto: 'municipio' },
  { n: 5, fase: 'Observar', titulo: 'Missão 5 · Desafios de empresas', subtitulo: 'Converse com comerciantes e empresários locais e registre três desafios.', tempo: '40 minutos', pontos: 40, contexto: 'empresa' },
  { n: 6, fase: 'Escolher', titulo: 'Missão 6 · Qual problema vamos resolver?', subtitulo: 'Escolham, entre todos os problemas encontrados, qual a equipe vai resolver.', tempo: '25 minutos', pontos: 30 },
  { n: 7, fase: 'Investigar', titulo: 'Missão 7 · Pesquisa e entrevistas', subtitulo: 'Descubram quem sofre com o problema e, se possível, façam entrevistas.', tempo: '30 minutos', pontos: 30 },
  { n: 8, fase: 'Imaginar & Construir', titulo: 'Missão 8 · Criando a solução e o MVP', subtitulo: 'Deem nome ao projeto, imaginem a solução e construam um MVP.', tempo: '60 minutos', pontos: 50 },
  { n: 9, fase: 'Validar', titulo: 'Missão 9 · Testando com usuários', subtitulo: 'Testem a solução com pessoas reais e registrem o que aprenderam.', tempo: '30 minutos', pontos: 30 },
  { n: 10, fase: 'Comunicar & Apresentar', titulo: 'Missão 10 · Hora do pitch', subtitulo: 'Enviem o pitch final da equipe: PDF, slides, vídeo ou link.', tempo: '20 minutos', pontos: 50 },
];

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

function missaoByN(n) { return MISSOES.find(m => m.n === n); }

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

/* --------------------------------------------------------------------------
   Alternância de views
   -------------------------------------------------------------------------- */

const VIEWS = ['loading', 'erro', 'sem-clube', 'sem-equipe', 'escolher-equipe', 'dashboard', 'missao', 'avaliacao'];

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
    state.projeto = await loadOrCreateProjeto(equipe.id);
    showTopbarEquipe();
    renderDashboard();
    showView('dashboard');
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

async function loadOrCreateProjeto(equipeId) {
  const res = await api(`projetos_discovery?limit=200`);
  let projeto = (res.data || []).find(p => p.equipe_id === equipeId);
  if (!projeto) {
    projeto = await api('projetos_discovery', {
      method: 'POST',
      body: JSON.stringify({
        clube_id: state.clube.id,
        equipe_id: equipeId,
        missao_atual: 1,
        pontos_impacto: 0,
        missoes_concluidas: [],
        status: 'Não iniciado',
      }),
    });
  }
  return projeto;
}

/* --------------------------------------------------------------------------
   Render: Dashboard
   -------------------------------------------------------------------------- */

function missoesConcluidas() { return state.projeto.missoes_concluidas || []; }

function proximaMissaoPendente() {
  return MISSOES.find(m => !missoesConcluidas().includes(m.n));
}

function renderDashboard() {
  const p = state.projeto;
  const concluidas = missoesConcluidas();
  const percentual = Math.round((concluidas.length / MISSOES.length) * 100);

  $('#equipe-nome').textContent = state.equipeAtiva.nome_equipe;
  $('#projeto-nome').textContent = p.m8_nome_projeto || 'Ainda não iniciado';
  $('#pontos-impacto').textContent = p.pontos_impacto || 0;
  $('#progress-fill-discovery').style.width = `${percentual}%`;
  $('#progress-percent').textContent = percentual;

  const proxima = proximaMissaoPendente();
  if (proxima) {
    $('#card-proxima-missao').classList.remove('hidden');
    $('#card-jornada-concluida').classList.add('hidden');
    $('#proxima-missao-titulo').textContent = proxima.titulo;
    $('#proxima-missao-subtitulo').textContent = proxima.subtitulo;
    $('#proxima-missao-tempo').textContent = proxima.tempo;
    $('#btn-iniciar-missao').onclick = () => abrirMissao(proxima.n);
  } else {
    $('#card-proxima-missao').classList.add('hidden');
    $('#card-jornada-concluida').classList.remove('hidden');
  }

  renderCardIihResultado();

  // Checklist de missões
  const wrap = $('#lista-missoes');
  wrap.innerHTML = '';
  MISSOES.forEach(m => {
    const isDone = concluidas.includes(m.n);
    const isCurrent = !isDone && proxima && proxima.n === m.n;
    const isLocked = !isDone && !isCurrent;
    const row = document.createElement('div');
    row.className = `missao-row ${isDone ? 'is-done' : isCurrent ? 'is-current' : 'is-locked'}`;
    row.innerHTML = `
      <div class="missao-icon">${isDone ? '<i class="fa-solid fa-check"></i>' : isLocked ? '<i class="fa-solid fa-lock text-xs"></i>' : m.n}</div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-brand-yellow-dark uppercase tracking-wide">${m.fase}</p>
        <p class="font-semibold text-slate-900 text-sm truncate">${m.titulo}</p>
        <p class="text-xs text-slate-500 truncate">${m.subtitulo}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="text-xs text-slate-400"><i class="fa-regular fa-clock mr-1"></i>${m.tempo}</p>
        <p class="text-xs font-semibold text-brand-yellow-dark">+${m.pontos} pts</p>
      </div>
    `;
    if (!isLocked) {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => abrirMissao(m.n));
    }
    wrap.appendChild(row);
  });

  renderResumoProjeto();
}

function urlSegura(href) {
  // Evita esquemas perigosos (javascript:, data:, etc.) em links gerados a partir de texto livre.
  const v = String(href || '').trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[a-z0-9.\-_/? =&%#@]+$/i.test(v) && !v.includes(':')) return `https://${v}`;
  return '#';
}

function renderResumoProjeto() {
  const p = state.projeto;
  const grid = $('#resumo-projeto-grid');
  const item = (label, icon, value, isLink = false) => {
    const safeValue = escapeHtml(value);
    return `
    <div class="rounded-xl border border-slate-100 p-4">
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1"><i class="${icon} mr-1.5 text-brand-yellow-dark"></i>${label}</p>
      ${isLink && value !== 'Ainda não definido'
        ? `<a href="${escapeHtml(urlSegura(value))}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-brand-yellow-dark hover:underline break-all">${safeValue}</a>`
        : `<p class="text-sm font-medium text-slate-800 break-words">${safeValue}</p>`}
    </div>
  `;
  };
  const investigacao = p.m7_descobertas
    ? `${p.m7_quem_sofre ? p.m7_quem_sofre + ' — ' : ''}${p.m7_quantidade_entrevistados || 0} pessoa(s) entrevistada(s). ${p.m7_descobertas}`
    : 'Ainda não realizada';
  grid.innerHTML = [
    item('Nome do Projeto', 'fa-solid fa-tag', p.m8_nome_projeto || 'Ainda não definido'),
    item('Equipe', 'fa-solid fa-people-group', state.equipeAtiva.nome_equipe),
    item('ODS Relacionados', 'fa-solid fa-earth-americas', (p.m6_ods_selecionados || []).length ? p.m6_ods_selecionados.join(' · ') : 'Ainda não definido'),
    item('Problema Escolhido', 'fa-solid fa-magnifying-glass', p.m6_problema_escolhido || 'Ainda não definido'),
    item('Pesquisa / Entrevistas', 'fa-solid fa-comments', investigacao),
    item('Solução', 'fa-solid fa-lightbulb', p.m8_descricao_solucao || 'Ainda não definida'),
    item('MVP', 'fa-solid fa-hammer', p.m8_mvp_url || 'Ainda não construído', !!p.m8_mvp_url),
    item('Validação', 'fa-solid fa-vial-circle-check', p.m9_o_que_mudou || 'Ainda não validado'),
    item('Pitch', 'fa-solid fa-bullhorn', p.m10_pitch_url || 'Ainda não enviado', !!p.m10_pitch_url),
  ].join('');
}

/* --------------------------------------------------------------------------
   Missões — abrir e renderizar formulário
   -------------------------------------------------------------------------- */

function abrirMissao(n) {
  const missao = missaoByN(n);
  showView('missao');
  $('#missao-container').innerHTML = buildMissaoHTML(missao);
  wireMissaoForm(missao);
}

function buildMissaoHTML(missao) {
  if (missao.n === 1) return htmlMissao1(missao);
  if (missao.n >= 2 && missao.n <= 5) return htmlMissaoProblemas(missao);
  if (missao.n === 6) return htmlMissao6(missao);
  if (missao.n === 7) return htmlMissao7(missao);
  if (missao.n === 8) return htmlMissao8(missao);
  if (missao.n === 9) return htmlMissao9(missao);
  if (missao.n === 10) return htmlMissao10(missao);
  return '';
}

function cabecalhoMissao(missao) {
  return `
    <span class="badge badge-yellow mb-3"><i class="fa-solid fa-flag mr-1.5"></i>${missao.fase}</span>
    <h2 class="font-display text-xl font-bold text-slate-900 mb-2">${missao.titulo}</h2>
    <p class="text-slate-500 text-sm mb-5"><i class="fa-regular fa-clock mr-1.5"></i>${missao.tempo} · <span class="text-brand-yellow-dark font-semibold">+${missao.pontos} Pontos de Impacto</span></p>
  `;
}

/* Missão 1 — Explorar */
function htmlMissao1(missao) {
  const jaConcluida = missoesConcluidas().includes(1);
  return `
    ${cabecalhoMissao(missao)}
    <p class="text-slate-600 text-sm leading-relaxed mb-5">Nesta missão você vai entender como funciona a Jornada HACK e como sua equipe irá desenvolver um projeto de inovação.</p>
    <div class="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600 mb-6 leading-relaxed">
      A Jornada Discovery é dividida em 10 missões. A cada missão concluída, vocês ganham <strong>Pontos de Impacto</strong> e o projeto da equipe vai sendo montado automaticamente — vocês nunca "criam um projeto do zero", apenas vão respondendo às missões, uma a uma.
    </div>
    <form id="form-missao" class="space-y-5">
      <label class="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" name="entendeu" ${jaConcluida ? 'checked' : ''} required class="mt-1 w-4 h-4 accent-brand-yellow-dark">
        <span class="text-sm font-medium text-slate-800">✅ Entendi a metodologia.</span>
      </label>
      <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Concluir Missão</button>
    </form>
  `;
}

/* Missões 2–5 — Observar (Escola / Comunidade / Município / Empresa) */
function htmlMissaoProblemas(missao) {
  const ctx = CONTEXTOS_PROBLEMA[missao.contexto];
  const existentes = state.projeto[ctx.campo] || [];
  const blocos = [0, 1, 2].map(i => {
    const p = existentes[i] || {};
    const obrigatorio = i === 0; // apenas o Problema 1 é obrigatório — 2 e 3 são bônus, sem bloquear a equipe
    return `
      <div class="problema-block">
        <p class="font-semibold text-slate-800 text-sm mb-3">Problema ${i + 1}${obrigatorio ? '' : ' <span class="text-slate-400 font-normal">(opcional)</span>'}</p>
        <div class="space-y-3">
          <div>
            <label class="form-label">Título ${obrigatorio ? '*' : ''}</label>
            <input type="text" name="titulo_${i}" ${obrigatorio ? 'required' : ''} maxlength="120" class="form-input" value="${escapeHtml(p.titulo || '')}" placeholder="Ex.: Falta de sombra no pátio">
          </div>
          <div>
            <label class="form-label">Descrição ${obrigatorio ? '*' : ''}</label>
            <textarea name="descricao_${i}" ${obrigatorio ? 'required' : ''} rows="2" maxlength="600" class="form-textarea" placeholder="Descreva o problema com detalhes">${escapeHtml(p.descricao || '')}</textarea>
          </div>
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="form-label">Quem é afetado?</label>
              <input type="text" name="afetados_${i}" maxlength="200" class="form-input" value="${escapeHtml(p.afetados || '')}" placeholder="Ex.: Alunos do turno da tarde">
            </div>
            <div>
              <label class="form-label"><i class="fa-solid fa-camera mr-1"></i> Foto (URL)</label>
              <input type="text" name="foto_${i}" maxlength="400" class="form-input" value="${escapeHtml(p.foto_url || '')}" placeholder="https://... (opcional)">
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    ${cabecalhoMissao(missao)}
    <p class="text-slate-600 text-sm leading-relaxed mb-5">Toda inovação começa pela observação. ${ctx.instrucao} <span class="text-slate-400">(o Problema 1 é obrigatório; 2 e 3 são bônus para quem encontrar mais)</span></p>
    <form id="form-missao" class="space-y-1">
      ${blocos}
      <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold mt-4">Salvar Missão</button>
    </form>
  `;
}

/* Missão 6 — Escolher */
function todosProblemasColetados() {
  const lista = [];
  Object.values(CONTEXTOS_PROBLEMA).forEach(ctx => {
    (state.projeto[ctx.campo] || []).forEach((p, idx) => {
      if (p && p.titulo) lista.push({ id: `${ctx.campo}__${idx}`, contexto: ctx.label, ...p });
    });
  });
  return lista;
}

function htmlMissao6(missao) {
  const problemas = todosProblemasColetados();
  const odsSelecionados = state.projeto.m6_ods_selecionados || [];

  if (problemas.length === 0) {
    return `
      ${cabecalhoMissao(missao)}
      <div class="rounded-xl bg-slate-50 border border-slate-100 p-5 text-sm text-slate-500 text-center">
        Vocês ainda não registraram nenhum problema nas missões anteriores. Voltem e completem as Missões 2 a 5 primeiro.
      </div>
    `;
  }

  return `
    ${cabecalhoMissao(missao)}
    <p class="text-slate-600 text-sm leading-relaxed mb-4">A plataforma já tem tudo o que vocês registraram. Agora é hora de escolher:</p>
    <form id="form-missao" class="space-y-6">
      <div>
        <p class="font-semibold text-slate-800 text-sm mb-3">Qual problema sua equipe deseja resolver?</p>
        <div class="space-y-2">
          ${problemas.map(p => `
            <label class="flex items-start gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-brand-yellow-dark transition-colors">
              <input type="radio" name="problema_id" value="${p.id}" required class="mt-1 w-4 h-4 accent-brand-yellow-dark" ${state.projeto.m6_problema_escolhido === `${p.contexto}: ${p.titulo}` ? 'checked' : ''}>
              <span>
                <span class="badge badge-dark mr-2" style="font-size:0.65rem;">${escapeHtml(p.contexto)}</span>
                <span class="text-sm font-medium text-slate-800">${escapeHtml(p.titulo)}</span>
                <br><span class="text-xs text-slate-500">${escapeHtml(p.descricao || '')}</span>
              </span>
            </label>
          `).join('')}
        </div>
      </div>

      <div>
        <label class="form-label">Por que escolheram esse problema?</label>
        <textarea name="motivo" rows="3" maxlength="600" class="form-textarea" placeholder="Expliquem o motivo da escolha">${escapeHtml(state.projeto.m6_motivo_escolha || '')}</textarea>
      </div>

      <div>
        <p class="font-semibold text-slate-800 text-sm mb-3">Quais ODS estão relacionados?</p>
        <div class="grid sm:grid-cols-2 gap-2">
          ${ODS_LIST.map(ods => `
            <label class="ods-checkbox">
              <input type="checkbox" name="ods" value="${escapeHtml(ods)}" ${odsSelecionados.includes(ods) ? 'checked' : ''}>
              <span>${escapeHtml(ods)}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Salvar Missão</button>
    </form>
  `;
}

/* Missão 7 — Investigar */
function htmlMissao7(missao) {
  const p = state.projeto;
  const entrevistou = p.m7_entrevistou;
  return `
    ${cabecalhoMissao(missao)}
    <p class="text-slate-600 text-sm leading-relaxed mb-5">Agora é hora de pesquisar de verdade. Quem sofre com esse problema? Vocês entrevistaram alguém?</p>
    <form id="form-missao" class="space-y-4">
      <div>
        <label class="form-label">Quem sofre com esse problema?</label>
        <input type="text" name="quem_sofre" maxlength="200" class="form-input" value="${escapeHtml(p.m7_quem_sofre || '')}" placeholder="Ex.: Estudantes do período da tarde, moradores da rua X...">
      </div>
      <div>
        <p class="form-label mb-2">Vocês entrevistaram alguém?</p>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 text-sm"><input type="radio" name="entrevistou" value="sim" ${entrevistou ? 'checked' : ''} class="accent-brand-yellow-dark"> Sim</label>
          <label class="flex items-center gap-2 text-sm"><input type="radio" name="entrevistou" value="nao" ${entrevistou === false ? 'checked' : ''} class="accent-brand-yellow-dark"> Não</label>
        </div>
      </div>
      <div>
        <label class="form-label">Quantas pessoas?</label>
        <input type="number" min="0" name="quantidade" class="form-input" value="${p.m7_quantidade_entrevistados || ''}" placeholder="0">
      </div>
      <div>
        <label class="form-label">O que descobriram?</label>
        <textarea name="descobertas" rows="4" maxlength="800" class="form-textarea" placeholder="Registrem aqui o que aprenderam com a pesquisa/entrevistas">${escapeHtml(p.m7_descobertas || '')}</textarea>
      </div>
      <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Salvar Missão</button>
    </form>
  `;
}

/* Missão 8 — Imaginar & Construir */
function htmlMissao8(missao) {
  const p = state.projeto;
  return `
    ${cabecalhoMissao(missao)}
    <p class="text-slate-600 text-sm leading-relaxed mb-5">Agora é uma oficina de criação. Deem nome ao projeto, imaginem a solução e construam um MVP.</p>
    <form id="form-missao" class="space-y-4">
      <div>
        <label class="form-label">Nome do Projeto *</label>
        <input type="text" name="nome_projeto" required maxlength="80" class="form-input" value="${escapeHtml(p.m8_nome_projeto || '')}" placeholder="Dê um nome para o projeto da equipe">
      </div>
      <div>
        <label class="form-label">Qual solução vocês imaginam? *</label>
        <textarea name="descricao_solucao" required rows="3" maxlength="800" class="form-textarea" placeholder="Descrevam a solução pensada pela equipe">${escapeHtml(p.m8_descricao_solucao || '')}</textarea>
      </div>
      <div>
        <label class="form-label"><i class="fa-solid fa-paperclip mr-1"></i> Desenho ou anexo (URL)</label>
        <input type="text" name="anexo_url" maxlength="400" class="form-input" value="${escapeHtml(p.m8_anexo_url || '')}" placeholder="https://... (opcional)">
      </div>
      <div>
        <label class="form-label">Link do MVP</label>
        <input type="text" name="mvp_url" maxlength="400" class="form-input" value="${escapeHtml(p.m8_mvp_url || '')}" placeholder="Foto, vídeo, protótipo, maquete ou site (opcional)">
        <p class="text-xs text-slate-400 mt-1">Pode ser uma foto, vídeo, protótipo, maquete ou site.</p>
      </div>
      <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Salvar Missão</button>
    </form>
  `;
}

/* Missão 9 — Validar */
function htmlMissao9(missao) {
  const p = state.projeto;
  return `
    ${cabecalhoMissao(missao)}
    <p class="text-slate-600 text-sm leading-relaxed mb-5">Hora de validar. Quem testou? O que disseram? O que mudou?</p>
    <form id="form-missao" class="space-y-4">
      <div>
        <label class="form-label">Quem testou?</label>
        <input type="text" name="quem_testou" maxlength="200" class="form-input" value="${escapeHtml(p.m9_quem_testou || '')}" placeholder="Ex.: 5 colegas de turma, a diretora...">
      </div>
      <div>
        <label class="form-label">O que disseram?</label>
        <textarea name="o_que_disseram" rows="3" maxlength="600" class="form-textarea" placeholder="Registrem o feedback recebido">${escapeHtml(p.m9_o_que_disseram || '')}</textarea>
      </div>
      <div>
        <label class="form-label">O que mudou?</label>
        <textarea name="o_que_mudou" rows="3" maxlength="600" class="form-textarea" placeholder="O que a equipe ajustou na solução depois do teste">${escapeHtml(p.m9_o_que_mudou || '')}</textarea>
      </div>
      <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Salvar Missão</button>
    </form>
  `;
}

/* Missão 10 — Comunicar & Apresentar */
function htmlMissao10(missao) {
  const p = state.projeto;
  return `
    ${cabecalhoMissao(missao)}
    <p class="text-slate-600 text-sm leading-relaxed mb-5">Chegou a hora de apresentar a solução da equipe. Enviem o pitch final.</p>
    <form id="form-missao" class="space-y-4">
      <div>
        <label class="form-label">Link do Pitch *</label>
        <input type="text" name="pitch_url" required maxlength="400" class="form-input" value="${escapeHtml(p.m10_pitch_url || '')}" placeholder="PDF, Slides, Vídeo ou link do pitch">
        <p class="text-xs text-slate-400 mt-1">Pode ser um PDF, apresentação de slides, vídeo ou qualquer link com o pitch da equipe.</p>
      </div>
      <button type="submit" class="btn-accent w-full py-3 rounded-lg font-semibold">Concluir Jornada Discovery <i class="fa-solid fa-flag-checkered ml-1"></i></button>
    </form>
  `;
}

/* --------------------------------------------------------------------------
   Wiring dos formulários de missão
   -------------------------------------------------------------------------- */

function wireMissaoForm(missao) {
  const form = $('#form-missao');
  if (!form) return;

  // Toggle de campo "quantidade" na Missão 7 conforme resposta sim/não (comportamento visual apenas)
  if (missao.n === 7) {
    // sem toggle obrigatório de exibição — campo sempre visível para simplicidade
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    let patch = {};

    if (missao.n === 1) {
      patch = {};
    } else if (missao.n >= 2 && missao.n <= 5) {
      const ctx = CONTEXTOS_PROBLEMA[missao.contexto];
      const problemas = [0, 1, 2].map(i => ({
        titulo: fd.get(`titulo_${i}`) || '',
        descricao: fd.get(`descricao_${i}`) || '',
        afetados: fd.get(`afetados_${i}`) || '',
        foto_url: fd.get(`foto_${i}`) || '',
      }));
      patch = { [ctx.campo]: problemas };
    } else if (missao.n === 6) {
      const problemaId = fd.get('problema_id');
      const problema = todosProblemasColetados().find(p => p.id === problemaId);
      const odsSelecionados = fd.getAll('ods');
      if (odsSelecionados.length === 0) {
        showToast('Selecionem pelo menos um ODS relacionado ao problema.', 'fa-solid fa-triangle-exclamation');
        return;
      }
      patch = {
        m6_problema_escolhido: problema ? `${problema.contexto}: ${problema.titulo}` : '',
        m6_motivo_escolha: fd.get('motivo') || '',
        m6_ods_selecionados: odsSelecionados,
      };
    } else if (missao.n === 7) {
      const qtdRaw = Number(fd.get('quantidade'));
      patch = {
        m7_quem_sofre: fd.get('quem_sofre') || '',
        m7_entrevistou: fd.get('entrevistou') === 'sim',
        m7_quantidade_entrevistados: Number.isFinite(qtdRaw) ? Math.max(0, Math.round(qtdRaw)) : 0,
        m7_descobertas: fd.get('descobertas') || '',
      };
    } else if (missao.n === 8) {
      patch = {
        m8_nome_projeto: fd.get('nome_projeto') || '',
        m8_descricao_solucao: fd.get('descricao_solucao') || '',
        m8_anexo_url: fd.get('anexo_url') || '',
        m8_mvp_url: fd.get('mvp_url') || '',
      };
    } else if (missao.n === 9) {
      patch = {
        m9_quem_testou: fd.get('quem_testou') || '',
        m9_o_que_disseram: fd.get('o_que_disseram') || '',
        m9_o_que_mudou: fd.get('o_que_mudou') || '',
      };
    } else if (missao.n === 10) {
      patch = { m10_pitch_url: fd.get('pitch_url') || '' };
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
    }

    await saveMissao(missao.n, patch, missao.pontos, submitBtn);
  });
}

async function saveMissao(n, patch, pontos, submitBtn) {
  try {
    const jaConcluida = missoesConcluidas().includes(n);
    const novasConcluidas = jaConcluida ? missoesConcluidas() : [...missoesConcluidas(), n];
    const pontosGanhos = jaConcluida ? 0 : pontos;
    const novoTotalPontos = (state.projeto.pontos_impacto || 0) + pontosGanhos;
    const proxima = MISSOES.find(m => !novasConcluidas.includes(m.n));
    const missaoAtual = proxima ? proxima.n : n;
    const status = novasConcluidas.length >= MISSOES.length ? 'Concluído' : 'Em andamento';

    const fullPatch = { ...patch, missoes_concluidas: novasConcluidas, pontos_impacto: novoTotalPontos, missao_atual: missaoAtual, status };
    const updated = await api(`projetos_discovery/${state.projeto.id}`, { method: 'PATCH', body: JSON.stringify(fullPatch) });
    state.projeto = { ...state.projeto, ...updated };

    if (status === 'Concluído' && n === 10) {
      showToast('🎉 Parabéns! Sua equipe concluiu a Jornada Discovery!');
    } else if (pontosGanhos > 0) {
      showToast(`🎉 Parabéns! Sua equipe ganhou +${pontosGanhos} Pontos de Impacto`);
    } else {
      showToast('Missão atualizada!');
    }

    showView('dashboard');
    renderDashboard();
  } catch (err) {
    console.error(err);
    showToast('Erro ao salvar a missão. Tente novamente.', 'fa-solid fa-triangle-exclamation');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitBtn.dataset.originalHtml || submitBtn.innerHTML;
    }
  }
}

/* --------------------------------------------------------------------------
   Avaliação do Professor Mentor — IIH real do projeto
   (mesma metodologia/fórmulas do Banco HACK, aplicada ao projeto real da equipe)
   -------------------------------------------------------------------------- */

function renderCardIihResultado() {
  const p = state.projeto;
  const card = $('#card-iih-resultado');
  if (!card) return;
  if (p.avaliacao_status !== 'Avaliado') {
    card.classList.add('hidden');
    return;
  }
  card.classList.remove('hidden');
  const selo = SELO_INFO[p.iih_selo] || SELO_INFO['Bronze'];
  const odsDiretos = p.avaliacao_ods_diretos || [];
  const odsIndiretos = p.avaliacao_ods_indiretos || [];
  const odsTags = [
    ...odsDiretos.map(o => `<span class="ods-tag"><span class="ods-dot" style="background:var(--hh-yellow-dark)">●</span>${escapeHtml(o)}</span>`),
    ...odsIndiretos.map(o => `<span class="ods-tag ods-indirect"><span class="ods-dot" style="background:#CBD5E1">●</span>${escapeHtml(o)} (indireto)</span>`),
  ].join('');
  const { notaDimensao: notaOds } = calcularPontosOds(odsDiretos.length, odsIndiretos.length, p.avaliacao_profundidade);

  $('#iih-resultado-container').innerHTML = `
    <div class="result-mockup">
      <div class="result-mockup-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <p class="text-brand-yellow text-xs font-semibold uppercase tracking-wide mb-1">IIH real do projeto</p>
          <p class="text-4xl font-extrabold">${Math.round(p.iih_total || 0)}<span class="text-lg text-white/60">/100</span></p>
        </div>
        <div class="text-center">
          <div class="tier-medal" style="background:${selo.gradiente}; color:${selo.cor};"><i class="fa-solid fa-medal"></i></div>
          <p class="text-xs font-semibold text-white/80">Selo ${escapeHtml(p.iih_selo || 'Bronze')}</p>
        </div>
      </div>
      <div class="p-6 sm:p-8">
        <div class="space-y-5 mb-6">
          <div class="dim-result-row">
            <p class="text-sm font-medium text-slate-700">Compreensão do Problema</p>
            <p class="text-sm font-semibold text-slate-900">${Math.round(p.avaliacao_nota_compreensao || 0)}/10</p>
            <div class="dim-bar-track col-span-2"><div class="dim-bar-fill" style="width:${((p.avaliacao_nota_compreensao || 0) / 10) * 100}%"></div></div>
          </div>
          ${p.avaliacao_feedback_compreensao ? `<p class="text-xs text-slate-500 -mt-3">${escapeHtml(p.avaliacao_feedback_compreensao)}</p>` : ''}
          <div class="dim-result-row">
            <p class="text-sm font-medium text-slate-700">Impacto ODS</p>
            <p class="text-sm font-semibold text-slate-900">${Math.round(notaOds)}/40</p>
            <div class="dim-bar-track col-span-2"><div class="dim-bar-fill" style="width:${(notaOds / 40) * 100}%"></div></div>
          </div>
          ${p.avaliacao_justificativa_profundidade ? `<p class="text-xs text-slate-500 -mt-3">Profundidade: <strong>${escapeHtml(p.avaliacao_profundidade || '')}</strong> — ${escapeHtml(p.avaliacao_justificativa_profundidade)}</p>` : ''}
          <div class="dim-result-row">
            <p class="text-sm font-medium text-slate-700">Planejamento</p>
            <p class="text-sm font-semibold text-slate-900">${Math.round(p.avaliacao_nota_planejamento || 0)}/25</p>
            <div class="dim-bar-track col-span-2"><div class="dim-bar-fill" style="width:${((p.avaliacao_nota_planejamento || 0) / 25) * 100}%"></div></div>
          </div>
          ${p.avaliacao_feedback_planejamento ? `<p class="text-xs text-slate-500 -mt-3">${escapeHtml(p.avaliacao_feedback_planejamento)}</p>` : ''}
          <div class="dim-result-row">
            <p class="text-sm font-medium text-slate-700">Ferramentas</p>
            <p class="text-sm font-semibold text-slate-900">${Math.round(p.avaliacao_nota_ferramentas || 0)}/25</p>
            <div class="dim-bar-track col-span-2"><div class="dim-bar-fill" style="width:${((p.avaliacao_nota_ferramentas || 0) / 25) * 100}%"></div></div>
          </div>
          ${p.avaliacao_feedback_ferramentas ? `<p class="text-xs text-slate-500 -mt-3">${escapeHtml(p.avaliacao_feedback_ferramentas)}</p>` : ''}
        </div>
        ${odsTags ? `<p class="font-semibold text-slate-900 mb-3 text-sm">ODS impactados pelo projeto:</p><div class="flex flex-wrap gap-2 mb-6">${odsTags}</div>` : ''}
        <div class="rounded-xl bg-slate-50 border border-slate-100 p-5 flex items-center gap-4">
          <div class="tier-medal" style="background:${selo.gradiente}; color:${selo.cor}; margin:0;"><i class="fa-solid fa-medal"></i></div>
          <div>
            <p class="text-xs text-slate-500">Selo de Impacto</p>
            <p class="font-semibold text-slate-900">${selo.emoji} ${escapeHtml(p.iih_selo || 'Bronze')} — ${escapeHtml(selo.desc)}</p>
          </div>
        </div>
        ${p.avaliacao_avaliador_nome ? `<p class="text-xs text-slate-400 mt-4 text-center">Avaliado por ${escapeHtml(p.avaliacao_avaliador_nome)}</p>` : ''}
      </div>
    </div>
  `;
}

function abrirAvaliacao() {
  showView('avaliacao');
  $('#avaliacao-container').innerHTML = htmlAvaliacao();
  wireAvaliacaoForm();
}

function htmlAvaliacao() {
  const p = state.projeto;
  const odsDoProjeto = p.m6_ods_selecionados || [];
  const odsDiretosSalvos = p.avaliacao_ods_diretos || [];
  const odsIndiretosSalvos = p.avaliacao_ods_indiretos || [];

  if (odsDoProjeto.length === 0) {
    return `
      <div class="rounded-xl bg-slate-50 border border-slate-100 p-5 text-sm text-slate-500 text-center">
        Este projeto ainda não tem ODS selecionados na Missão 6. Não é possível calcular o Impacto ODS sem essa informação.
      </div>
    `;
  }

  return `
    <form id="form-avaliacao" class="space-y-8">
      <div>
        <label class="form-label">Seu nome (professor mentor) *</label>
        <input type="text" name="avaliador_nome" required maxlength="120" class="form-input" value="${escapeHtml(p.avaliacao_avaliador_nome || '')}" placeholder="Nome de quem está avaliando">
      </div>

      <div>
        <p class="font-semibold text-slate-800 text-sm mb-2"><i class="fa-solid fa-earth-americas mr-1.5 text-brand-yellow-dark"></i>1. Impacto ODS (40%)</p>
        <p class="text-slate-500 text-xs mb-4">A equipe marcou estes ODS na Missão 6. Classifique cada um como <strong>Direto</strong> (3 pts, a solução ataca esse ODS de forma primária) ou <strong>Indireto</strong> (1 pt, é beneficiado como consequência secundária).</p>
        <div class="space-y-2 mb-4">
          ${odsDoProjeto.map((ods, i) => {
            const isDireto = odsDiretosSalvos.includes(ods);
            const isIndireto = odsIndiretosSalvos.includes(ods);
            return `
            <div class="opcao-selecionavel" style="cursor:default;">
              <span class="text-sm text-slate-700 flex-1">${escapeHtml(ods)}</span>
              <div class="flex gap-3 shrink-0 ml-3">
                <label class="flex items-center gap-1.5 text-xs cursor-pointer"><input type="radio" name="ods_tipo_${i}" value="direto" class="accent-brand-yellow-dark" ${isDireto ? 'checked' : ''}> Direto</label>
                <label class="flex items-center gap-1.5 text-xs cursor-pointer"><input type="radio" name="ods_tipo_${i}" value="indireto" class="accent-brand-yellow-dark" ${isIndireto ? 'checked' : ''}> Indireto</label>
                <label class="flex items-center gap-1.5 text-xs cursor-pointer"><input type="radio" name="ods_tipo_${i}" value="nenhum" class="accent-brand-yellow-dark" ${!isDireto && !isIndireto ? 'checked' : ''}> Nenhum</label>
              </div>
              <input type="hidden" name="ods_texto_${i}" value="${escapeHtml(ods)}">
            </div>
          `;
          }).join('')}
        </div>

        <p class="font-semibold text-slate-800 text-sm mb-2 mt-6">Profundidade da solução *</p>
        <div class="space-y-2">
          <label class="opcao-selecionavel ${p.avaliacao_profundidade === 'Paliativa' ? 'is-checked' : ''}">
            <input type="radio" name="profundidade" value="Paliativa" required class="mt-1 w-4 h-4 accent-brand-yellow-dark" ${p.avaliacao_profundidade === 'Paliativa' ? 'checked' : ''}>
            <span class="text-sm text-slate-700"><strong>Paliativa (×1)</strong> — resolve o sintoma, mas não ataca a causa raiz.</span>
          </label>
          <label class="opcao-selecionavel ${p.avaliacao_profundidade === 'Sistêmica' ? 'is-checked' : ''}">
            <input type="radio" name="profundidade" value="Sistêmica" required class="mt-1 w-4 h-4 accent-brand-yellow-dark" ${p.avaliacao_profundidade === 'Sistêmica' ? 'checked' : ''}>
            <span class="text-sm text-slate-700"><strong>Sistêmica (×2)</strong> — ataca a causa raiz do problema.</span>
          </label>
          <label class="opcao-selecionavel ${p.avaliacao_profundidade === 'Transformadora' ? 'is-checked' : ''}">
            <input type="radio" name="profundidade" value="Transformadora" required class="mt-1 w-4 h-4 accent-brand-yellow-dark" ${p.avaliacao_profundidade === 'Transformadora' ? 'checked' : ''}>
            <span class="text-sm text-slate-700"><strong>Transformadora (×3)</strong> — cria um novo paradigma ou pode ser replicada em escala.</span>
          </label>
        </div>
        <div class="mt-3">
          <label class="form-label">Justificativa da profundidade (aparece para a equipe)</label>
          <input type="text" name="justificativa_profundidade" maxlength="300" class="form-input" value="${escapeHtml(p.avaliacao_justificativa_profundidade || '')}" placeholder="Ex.: A solução ataca a causa do desperdício, não só o sintoma.">
        </div>
      </div>

      <div class="border-t border-slate-100 pt-6">
        <p class="font-semibold text-slate-800 text-sm mb-2"><i class="fa-solid fa-magnifying-glass mr-1.5 text-brand-yellow-dark"></i>2. Compreensão do Problema (10%)</p>
        <p class="text-slate-500 text-xs mb-3">Com base na Missão 6/7 (motivo da escolha, pesquisa e entrevistas), o quanto a equipe demonstrou entender as causas reais do problema?</p>
        <div class="flex items-center gap-3">
          <input type="range" name="nota_compreensao" min="0" max="10" step="1" value="${p.avaliacao_nota_compreensao ?? 7}" class="flex-1" oninput="this.nextElementSibling.textContent = this.value + '/10'">
          <span class="font-display font-bold text-brand-yellow-dark w-16 text-right">${p.avaliacao_nota_compreensao ?? 7}/10</span>
        </div>
        <textarea name="feedback_compreensao" rows="2" maxlength="400" class="form-textarea mt-3" placeholder="Comentário para a equipe (opcional)">${escapeHtml(p.avaliacao_feedback_compreensao || '')}</textarea>
      </div>

      <div class="border-t border-slate-100 pt-6">
        <p class="font-semibold text-slate-800 text-sm mb-2"><i class="fa-solid fa-diagram-project mr-1.5 text-brand-yellow-dark"></i>3. Planejamento Estratégico (25%)</p>
        <p class="text-slate-500 text-xs mb-3">Com base na pesquisa/investigação (Missão 7) e na organização da equipe até o pitch, o quão bem planejada foi a execução?</p>
        <div class="flex items-center gap-3">
          <input type="range" name="nota_planejamento" min="0" max="25" step="1" value="${p.avaliacao_nota_planejamento ?? 18}" class="flex-1" oninput="this.nextElementSibling.textContent = this.value + '/25'">
          <span class="font-display font-bold text-brand-yellow-dark w-16 text-right">${p.avaliacao_nota_planejamento ?? 18}/25</span>
        </div>
        <textarea name="feedback_planejamento" rows="2" maxlength="400" class="form-textarea mt-3" placeholder="Comentário para a equipe (opcional)">${escapeHtml(p.avaliacao_feedback_planejamento || '')}</textarea>
      </div>

      <div class="border-t border-slate-100 pt-6">
        <p class="font-semibold text-slate-800 text-sm mb-2"><i class="fa-solid fa-toolbox mr-1.5 text-brand-yellow-dark"></i>4. Ferramentas Adequadas (25%)</p>
        <p class="text-slate-500 text-xs mb-3">Com base no MVP construído (Missão 8) e nas ferramentas usadas para testar/validar (Missão 9), quão adequadas foram as ferramentas escolhidas?</p>
        <div class="flex items-center gap-3">
          <input type="range" name="nota_ferramentas" min="0" max="25" step="1" value="${p.avaliacao_nota_ferramentas ?? 18}" class="flex-1" oninput="this.nextElementSibling.textContent = this.value + '/25'">
          <span class="font-display font-bold text-brand-yellow-dark w-16 text-right">${p.avaliacao_nota_ferramentas ?? 18}/25</span>
        </div>
        <textarea name="feedback_ferramentas" rows="2" maxlength="400" class="form-textarea mt-3" placeholder="Comentário para a equipe (opcional)">${escapeHtml(p.avaliacao_feedback_ferramentas || '')}</textarea>
      </div>

      <button type="submit" class="btn-accent w-full py-3.5 rounded-lg font-semibold"><i class="fa-solid fa-flag-checkered mr-1"></i> Calcular e salvar o IIH do projeto</button>
    </form>
  `;
}

function wireAvaliacaoForm() {
  const form = $('#form-avaliacao');
  if (!form) return;

  const odsDoProjeto = state.projeto.m6_ods_selecionados || [];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const odsDiretos = [];
    const odsIndiretos = [];
    odsDoProjeto.forEach((ods, i) => {
      const tipo = fd.get(`ods_tipo_${i}`);
      if (tipo === 'direto') odsDiretos.push(ods);
      else if (tipo === 'indireto') odsIndiretos.push(ods);
    });

    const profundidade = fd.get('profundidade');
    if (!profundidade) {
      showToast('Selecionem a profundidade da solução antes de salvar.', 'fa-solid fa-triangle-exclamation');
      return;
    }
    if (odsDiretos.length === 0 && odsIndiretos.length === 0) {
      showToast('Classifiquem pelo menos 1 ODS como Direto ou Indireto.', 'fa-solid fa-triangle-exclamation');
      return;
    }

    const notaCompreensao = Number(fd.get('nota_compreensao')) || 0;
    const notaPlanejamento = Number(fd.get('nota_planejamento')) || 0;
    const notaFerramentas = Number(fd.get('nota_ferramentas')) || 0;

    const { pontosBrutos, notaDimensao: notaOds } = calcularPontosOds(odsDiretos.length, odsIndiretos.length, profundidade);
    const selo = calcularSeloIih(profundidade, pontosBrutos);
    const iihTotal = notaCompreensao + notaOds + notaPlanejamento + notaFerramentas;

    const patch = {
      avaliacao_status: 'Avaliado',
      avaliacao_avaliador_nome: fd.get('avaliador_nome') || '',
      avaliacao_ods_diretos: odsDiretos,
      avaliacao_ods_indiretos: odsIndiretos,
      avaliacao_profundidade: profundidade,
      avaliacao_justificativa_profundidade: fd.get('justificativa_profundidade') || '',
      avaliacao_nota_compreensao: notaCompreensao,
      avaliacao_feedback_compreensao: fd.get('feedback_compreensao') || '',
      avaliacao_nota_planejamento: notaPlanejamento,
      avaliacao_feedback_planejamento: fd.get('feedback_planejamento') || '',
      avaliacao_nota_ferramentas: notaFerramentas,
      avaliacao_feedback_ferramentas: fd.get('feedback_ferramentas') || '',
      iih_total: Math.round(iihTotal * 10) / 10,
      iih_selo: selo,
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const original = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando...';

    try {
      const updated = await api(`projetos_discovery/${state.projeto.id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      state.projeto = { ...state.projeto, ...updated };
      showToast(`🎉 IIH calculado! Selo ${selo} — ${patch.iih_total}/100`);
      showView('dashboard');
      renderDashboard();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar a avaliação. Tente novamente.', 'fa-solid fa-triangle-exclamation');
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
    }
  });
}

/* --------------------------------------------------------------------------
   Botões estáticos / init
   -------------------------------------------------------------------------- */

function setupStaticButtons() {
  $('#btn-voltar-dashboard').addEventListener('click', () => { showView('dashboard'); renderDashboard(); });
  $('#btn-voltar-dashboard-avaliacao').addEventListener('click', () => { showView('dashboard'); renderDashboard(); });
  $('#btn-trocar-equipe').addEventListener('click', () => {
    if (!confirm('Deseja trocar de equipe? Você poderá voltar a esta equipe depois.')) return;
    localStorage.removeItem(STORAGE_EQUIPE_KEY);
    location.reload();
  });
  const btnAbrirAvaliacao = $('#btn-abrir-avaliacao');
  if (btnAbrirAvaliacao) btnAbrirAvaliacao.addEventListener('click', abrirAvaliacao);
  const btnReavaliar = $('#btn-reavaliar');
  if (btnReavaliar) btnReavaliar.addEventListener('click', abrirAvaliacao);
  const btnTentar = $('#btn-tentar-novamente');
  if (btnTentar) btnTentar.addEventListener('click', () => init());
}

document.addEventListener('DOMContentLoaded', () => {
  setupStaticButtons();
  init();
});
