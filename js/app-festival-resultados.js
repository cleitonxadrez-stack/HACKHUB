/* ==========================================================================
   HACK HUB® — HACK Festival: Resultados públicos
   Página pública, sem login: exibe finalistas e vencedores do HACK Festival
   em todo o Ecossistema HACK BRASIL. Junta festival_inscricoes com
   projetos_discovery, equipes e hack_clubes.
   ========================================================================== */

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
  $('#view-resultados').classList.toggle('hidden', name !== 'resultados');
}

function cardVencedorHTML(item) {
  const { equipe, clube, projeto, insc } = item;
  const nomeEscola = clube ? (clube.escola || clube.nome_clube) : 'Escola não identificada';
  const nomeProjeto = projeto ? (projeto.m8_nome_projeto || 'Projeto sem nome') : 'Projeto sem nome';
  const resumo = projeto ? (projeto.m8_descricao_solucao || '').replace(/<[^>]+>/g, '').slice(0, 160) : '';
  return `
    <div class="rounded-3xl p-7 sm:p-8 relative overflow-hidden text-center" style="background:linear-gradient(135deg,#D4A017,#FFE27A);">
      <p class="text-4xl mb-3">🏆</p>
      <span class="inline-block px-3 py-1 rounded-full bg-black/10 text-[#4A2E00] text-[11px] font-bold uppercase tracking-wide mb-3">Vencedor(a) do HACK Festival</span>
      <h3 class="font-display text-xl sm:text-2xl font-bold text-[#101010] mb-2">${escapeHtml(nomeProjeto)}</h3>
      <p class="text-sm text-[#4A2E00] mb-4">${escapeHtml(equipe ? equipe.nome_equipe : 'Equipe')} · ${escapeHtml(nomeEscola)}</p>
      ${resumo ? `<p class="text-sm text-[#4A2E00]/90 max-w-md mx-auto mb-4">${escapeHtml(resumo)}${resumo.length >= 160 ? '…' : ''}</p>` : ''}
      ${insc.pitch_url ? `<a href="${escapeHtml(insc.pitch_url)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-xs font-semibold text-[#101010] bg-white/70 hover:bg-white px-4 py-2 rounded-lg transition-colors"><i class="fa-solid fa-play"></i> Ver pitch do projeto</a>` : ''}
    </div>
  `;
}

function cardFinalistaHTML(item, pos) {
  const { equipe, clube, projeto, insc } = item;
  const nomeEscola = clube ? (clube.escola || clube.nome_clube) : 'Escola não identificada';
  const nomeProjeto = projeto ? (projeto.m8_nome_projeto || 'Projeto sem nome') : 'Projeto sem nome';
  return `
    <div class="app-card flex items-center gap-4">
      <div class="w-11 h-11 rounded-xl bg-brand-yellow/20 text-brand-yellow-dark flex items-center justify-center text-lg shrink-0"><i class="fa-solid fa-medal"></i></div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-slate-900 truncate">${escapeHtml(nomeProjeto)}</p>
        <p class="text-xs text-slate-500 truncate">${escapeHtml(equipe ? equipe.nome_equipe : 'Equipe')} · ${escapeHtml(nomeEscola)}</p>
        ${insc.avaliacao_nota_apresentacao !== undefined && insc.avaliacao_nota_apresentacao !== null
          ? `<p class="text-[11px] text-slate-400 mt-0.5"><i class="fa-solid fa-star w-3.5 text-brand-yellow-dark"></i> Nota da apresentação: ${insc.avaliacao_nota_apresentacao}/10</p>`
          : ''}
      </div>
      ${insc.pitch_url ? `<a href="${escapeHtml(insc.pitch_url)}" target="_blank" rel="noopener" class="text-xs font-semibold text-brand-yellow-dark hover:underline whitespace-nowrap shrink-0"><i class="fa-solid fa-play mr-1"></i> Pitch</a>` : ''}
    </div>
  `;
}

async function init() {
  showState('loading');
  try {
    const [inscricoes, projetos, equipes, clubes] = await Promise.all([
      apiAll('festival_inscricoes'),
      apiAll('projetos_discovery'),
      apiAll('equipes'),
      apiAll('hack_clubes'),
    ]);

    const enriquecer = (insc) => ({
      insc,
      projeto: projetos.find(p => p.id === insc.projeto_id) || null,
      equipe: equipes.find(e => e.id === insc.equipe_id) || null,
      clube: clubes.find(c => c.id === insc.clube_id) || null,
    });

    const vencedores = inscricoes.filter(i => i.status === 'Vencedor').map(enriquecer);
    const finalistas = inscricoes.filter(i => i.status === 'Finalista').map(enriquecer);
    const totalInscritos = inscricoes.length;

    if (vencedores.length === 0 && finalistas.length === 0) {
      $('#stat-total-inscritos').textContent = totalInscritos;
      showState('vazio');
      return;
    }

    $('#stat-total-inscritos').textContent = totalInscritos;
    $('#stat-total-finalistas').textContent = finalistas.length + vencedores.length;
    $('#stat-total-vencedores').textContent = vencedores.length;

    // ---- Vencedores ----
    const wrapVencedores = $('#lista-vencedores');
    const secVencedores = $('#secao-vencedores');
    if (vencedores.length > 0) {
      wrapVencedores.innerHTML = vencedores.map(cardVencedorHTML).join('');
      secVencedores.classList.remove('hidden');
    } else {
      secVencedores.classList.add('hidden');
    }

    // ---- Finalistas ----
    const wrapFinalistas = $('#lista-finalistas');
    const secFinalistas = $('#secao-finalistas');
    if (finalistas.length > 0) {
      wrapFinalistas.innerHTML = finalistas.map((item, pos) => cardFinalistaHTML(item, pos)).join('');
      secFinalistas.classList.remove('hidden');
    } else {
      secFinalistas.classList.add('hidden');
    }

    showState('resultados');
  } catch (err) {
    console.error(err);
    showState('vazio');
  }
}

document.addEventListener('DOMContentLoaded', init);
