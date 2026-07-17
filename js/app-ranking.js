/* ==========================================================================
   HACK HUB® — Ranking público (Equipes e Escolas)
   Página pública, sem login: soma Pontos de Impacto (Jornada Discovery) +
   Pontos HACK (Banco HACK) de TODAS as equipes/clubes cadastrados.
   ========================================================================== */

const CORES_EQUIPE = {
  'Amarelo': '#FFC800',
  'Preto': '#101010',
  'Azul': '#3B82F6',
  'Verde': '#22C55E',
  'Vermelho': '#EF4444',
  'Roxo': '#8B5CF6',
};

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function api(path) {
  const res = await fetch(`tables/${path}`);
  if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
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

function showState(name) {
  $('#view-loading').classList.toggle('hidden', name !== 'loading');
  $('#view-vazio').classList.toggle('hidden', name !== 'vazio');
  $('#view-ranking').classList.toggle('hidden', name !== 'ranking');
}

function medalha(pos) {
  if (pos === 0) return { icone: 'fa-solid fa-trophy', cor: '#E0A800', bg: '#FFF3CC' };
  if (pos === 1) return { icone: 'fa-solid fa-medal', cor: '#94A3B8', bg: '#F1F5F9' };
  if (pos === 2) return { icone: 'fa-solid fa-medal', cor: '#B45309', bg: '#FEF3C7' };
  return { icone: 'fa-solid fa-hashtag', cor: '#94A3B8', bg: '#F8FAFC' };
}

function linhaRankingHTML(pos, { titulo, subtitulo, pontosDiscovery, pontosBancoHack, total, corIcone, icone, imgUrl }) {
  const m = medalha(pos);
  return `
    <div class="app-card flex items-center gap-4">
      <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style="background:${m.bg};color:${m.cor}">
        ${pos < 3 ? `<i class="${m.icone}"></i>` : `${pos + 1}º`}
      </div>
      ${imgUrl
        ? `<img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(titulo)}" class="avatar-img w-11 h-11 shrink-0">`
        : `<div class="avatar-img w-11 h-11 flex items-center justify-center text-white shrink-0" style="background:${corIcone || '#101010'}"><i class="fa-solid ${icone || 'fa-shield-halved'}"></i></div>`}
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-slate-900 truncate">${escapeHtml(titulo)}</p>
        <p class="text-xs text-slate-500 truncate">${escapeHtml(subtitulo)}</p>
        <p class="text-[11px] text-slate-400 truncate mt-0.5"><i class="fa-solid fa-earth-americas w-3.5 text-brand-yellow-dark"></i> ${pontosDiscovery} Discovery &nbsp;·&nbsp; <i class="fa-solid fa-cube w-3.5 text-brand-yellow-dark"></i> ${pontosBancoHack} Banco HACK</p>
      </div>
      <div class="text-right shrink-0">
        <p class="font-display text-xl font-bold text-slate-900">${total}</p>
        <p class="text-[10px] text-slate-400 uppercase tracking-wide">pontos</p>
      </div>
    </div>
  `;
}

function setupTabsRanking() {
  $all('.ranking-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('.ranking-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab-ranking');
      $all('.ranking-tab-panel').forEach(p => p.classList.add('hidden'));
      $(`#ranking-panel-${tab}`).classList.remove('hidden');
    });
  });
}

async function init() {
  showState('loading');
  try {
    const [clubes, equipes, projetos, submissoes] = await Promise.all([
      apiAll('hack_clubes'),
      apiAll('equipes'),
      apiAll('projetos_discovery'),
      apiAll('hack_submissoes'),
    ]);

    if (equipes.length === 0) {
      showState('vazio');
      return;
    }

    // ---- Ranking de equipes ----
    const rankingEquipes = equipes.map(eq => {
      const pontosDiscovery = projetos
        .filter(p => p.equipe_id === eq.id)
        .reduce((soma, p) => soma + (p.pontos_impacto || 0), 0);
      const pontosBancoHack = submissoes
        .filter(s => s.equipe_id === eq.id)
        .reduce((soma, s) => soma + (s.pontos_ganhos || 0), 0);
      const clube = clubes.find(c => c.id === eq.clube_id);
      return {
        equipe: eq,
        clube,
        pontosDiscovery,
        pontosBancoHack,
        total: pontosDiscovery + pontosBancoHack,
      };
    }).sort((a, b) => b.total - a.total);

    // ---- Ranking de escolas (agrega todas as equipes do mesmo clube) ----
    const porClube = {};
    rankingEquipes.forEach(r => {
      const clubeId = r.equipe.clube_id;
      if (!porClube[clubeId]) {
        porClube[clubeId] = {
          clube: r.clube,
          pontosDiscovery: 0,
          pontosBancoHack: 0,
          total: 0,
          qtdEquipes: 0,
        };
      }
      porClube[clubeId].pontosDiscovery += r.pontosDiscovery;
      porClube[clubeId].pontosBancoHack += r.pontosBancoHack;
      porClube[clubeId].total += r.total;
      porClube[clubeId].qtdEquipes += 1;
    });
    const rankingEscolas = Object.values(porClube)
      .filter(r => r.clube)
      .sort((a, b) => b.total - a.total);

    // ---- Render equipes ----
    const wrapEquipes = $('#lista-ranking-equipes');
    wrapEquipes.innerHTML = rankingEquipes.map((r, pos) => {
      const cor = CORES_EQUIPE[r.equipe.cor_tema] || '#FFC800';
      const nomeEscola = r.clube ? (r.clube.escola || r.clube.nome_clube) : 'Escola não identificada';
      return linhaRankingHTML(pos, {
        titulo: r.equipe.nome_equipe || 'Equipe sem nome',
        subtitulo: `${nomeEscola}${r.clube && r.clube.cidade ? ' · ' + r.clube.cidade : ''}`,
        pontosDiscovery: r.pontosDiscovery,
        pontosBancoHack: r.pontosBancoHack,
        total: r.total,
        corIcone: cor,
        icone: 'fa-shield-halved',
        imgUrl: r.equipe.brasao_url,
      });
    }).join('') || '<p class="text-center text-slate-400 text-sm py-10">Nenhuma equipe pontuou ainda.</p>';

    // ---- Render escolas ----
    const wrapEscolas = $('#lista-ranking-escolas');
    wrapEscolas.innerHTML = rankingEscolas.map((r, pos) => {
      const nomeEscola = r.clube.escola || r.clube.nome_clube;
      return linhaRankingHTML(pos, {
        titulo: nomeEscola,
        subtitulo: `${r.clube.nome_clube}${r.clube.cidade ? ' · ' + r.clube.cidade : ''}${r.clube.estado ? '/' + r.clube.estado : ''} — ${r.qtdEquipes} equipe${r.qtdEquipes !== 1 ? 's' : ''}`,
        pontosDiscovery: r.pontosDiscovery,
        pontosBancoHack: r.pontosBancoHack,
        total: r.total,
        icone: 'fa-school',
        imgUrl: r.clube.logo_url,
      });
    }).join('') || '<p class="text-center text-slate-400 text-sm py-10">Nenhuma escola pontuou ainda.</p>';

    setupTabsRanking();
    showState('ranking');
  } catch (err) {
    console.error(err);
    showState('vazio');
  }
}

document.addEventListener('DOMContentLoaded', init);
