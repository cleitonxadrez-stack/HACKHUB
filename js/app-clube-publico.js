/* ==========================================================================
   HACK HUB® — Ficha pública do Clube (somente leitura)
   Usada para compartilhar/inscrever o clube em eventos externos
   (ex.: HACK Festival), sem necessidade de login.
   ========================================================================== */

const CORES_EQUIPE = {
  'Amarelo': '#FFC800',
  'Preto': '#101010',
  'Azul': '#3B82F6',
  'Verde': '#22C55E',
  'Vermelho': '#EF4444',
  'Roxo': '#8B5CF6',
};

const PERFIS_HACK = [
  { nome: 'Creator', emoji: '💡' },
  { nome: 'Builder', emoji: '🚀' },
  { nome: 'Connector', emoji: '🎤' },
  { nome: 'Tech Maker', emoji: '🤖' },
  { nome: 'Leader', emoji: '🌍' },
];

function perfilEmoji(nome) {
  return PERFIS_HACK.find(p => p.nome === nome)?.emoji || '';
}

function $(sel, root = document) { return root.querySelector(sel); }

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

async function api(path) {
  const res = await fetch(`../tables/${path}`);
  if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
  return res.json();
}

function getClubeIdFromUrl() {
  const params = new URLSearchParams(location.search);
  return params.get('id');
}

function showState(name) {
  $('#view-loading').classList.toggle('hidden', name !== 'loading');
  $('#view-nao-encontrado').classList.toggle('hidden', name !== 'nao-encontrado');
  $('#view-clube').classList.toggle('hidden', name !== 'clube');
}

function renderClube(clube, mentores, estudantes, equipes) {
  $('#clube-nome').textContent = clube.nome_clube || 'HACK CLUB';
  $('#clube-escola').innerHTML = `<i class="fa-solid fa-school mr-1.5"></i>${clube.escola || '—'}${clube.cidade ? ' · ' + clube.cidade : ''}${clube.estado ? '/' + clube.estado : ''}`;
  $('#clube-descricao').textContent = clube.descricao || '';

  const statusBadge = $('#clube-status-badge');
  statusBadge.textContent = clube.status === 'Ativo' ? '● Clube ativo' : '● Configuração pendente';
  statusBadge.className = clube.status === 'Ativo' ? 'badge badge-yellow mb-2' : 'badge badge-dark mb-2';

  const logoImg = $('#clube-logo-img');
  const logoFallback = $('#clube-logo-fallback');
  if (clube.logo_url) {
    logoImg.src = clube.logo_url;
    logoImg.style.display = 'block';
    logoFallback.style.display = 'none';
  } else {
    logoImg.style.display = 'none';
    logoFallback.style.display = 'flex';
  }

  $('#clube-social-links').innerHTML = clube.instagram
    ? `<a href="${instagramUrl(clube.instagram)}" target="_blank" rel="noopener" class="social-pill"><i class="fa-brands fa-instagram"></i>${clube.instagram}</a>`
    : '';

  $('#stat-mentores').textContent = mentores.length;
  $('#stat-estudantes').textContent = estudantes.length;
  $('#stat-equipes').textContent = equipes.length;
  $('#stat-aprovadas').textContent = equipes.filter(e => e.status === 'Aprovada').length;

  // Mentores
  const wrapMentores = $('#lista-mentores');
  wrapMentores.innerHTML = '';
  $('#empty-mentores').classList.toggle('hidden', mentores.length > 0);
  mentores.forEach(m => {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="flex items-start gap-4 mb-3">
        ${avatarHTML(m.foto_url, m.nome, 'w-14 h-14')}
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-slate-900 truncate">${m.nome}</p>
          <p class="text-xs text-slate-500 truncate">${m.area_atuacao || 'Professor mentor'}</p>
        </div>
      </div>
      ${m.bio ? `<p class="text-xs text-slate-500 mb-3 leading-relaxed">${m.bio}</p>` : ''}
      <div class="flex flex-wrap gap-2">
        ${m.linkedin ? `<a href="${linkedinUrl(m.linkedin)}" target="_blank" rel="noopener" class="social-pill"><i class="fa-brands fa-linkedin"></i>LinkedIn</a>` : ''}
        ${m.email ? `<span class="social-pill" style="cursor:default;"><i class="fa-solid fa-envelope"></i>${m.email}</span>` : ''}
      </div>
    `;
    wrapMentores.appendChild(card);
  });

  // Equipes
  const wrapEquipes = $('#lista-equipes');
  wrapEquipes.innerHTML = '';
  $('#empty-equipes').classList.toggle('hidden', equipes.length > 0);
  equipes.forEach(eq => {
    const membros = estudantes.filter(s => s.equipe_id === eq.id);
    const cor = CORES_EQUIPE[eq.cor_tema] || '#FFC800';
    const card = document.createElement('div');
    card.className = 'app-card relative';
    card.innerHTML = `
      <div class="team-strip" style="background:${cor}"></div>
      <div class="flex items-center gap-3 mb-3">
        ${eq.brasao_url
          ? `<img src="${eq.brasao_url}" alt="${eq.nome_equipe}" class="avatar-img w-12 h-12">`
          : `<div class="avatar-img w-12 h-12 flex items-center justify-center text-white" style="background:${cor}"><i class="fa-solid fa-shield-halved"></i></div>`}
        <div class="min-w-0">
          <p class="font-semibold text-slate-900 truncate">${eq.nome_equipe}</p>
          ${eq.lema ? `<p class="text-xs text-slate-500 italic truncate">"${eq.lema}"</p>` : ''}
        </div>
      </div>
      <span class="badge ${eq.status === 'Aprovada' ? 'badge-yellow' : 'badge-dark'} mb-4">
        <i class="fa-solid ${eq.status === 'Aprovada' ? 'fa-check' : 'fa-hourglass-half'} mr-1"></i> ${eq.status || 'Em formação'}
      </span>
      <p class="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Integrantes (${membros.length})</p>
      <div class="space-y-1.5">
        ${membros.length === 0 ? '<p class="text-xs text-slate-400">Nenhum integrante ainda.</p>' : membros.map(m => `
          <div class="member-row">
            ${avatarHTML(m.foto_url, m.nome, 'w-9 h-9', 'bg-black', 'text-brand-yellow')}
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-slate-800 truncate">${m.nome}${m.funcao_equipe && m.funcao_equipe !== 'A definir' ? ` · ${m.funcao_equipe}` : ''}</p>
              ${m.perfil_hack ? `<p class="text-[10px] text-brand-yellow-dark font-semibold truncate">${perfilEmoji(m.perfil_hack)} ${m.perfil_hack}</p>` : ''}
            </div>
            ${m.instagram ? `<a href="${instagramUrl(m.instagram)}" target="_blank" rel="noopener" class="text-slate-400 hover:text-brand-yellow-dark shrink-0"><i class="fa-brands fa-instagram"></i></a>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    wrapEquipes.appendChild(card);
  });
}

async function init() {
  const clubeId = getClubeIdFromUrl();
  if (!clubeId) return showState('nao-encontrado');

  showState('loading');
  try {
    const clube = await api(`hack_clubes/${clubeId}`);
    if (!clube || clube.deleted) return showState('nao-encontrado');

    const [mentoresRes, estudantesRes, equipesRes] = await Promise.all([
      api(`professores_mentores?limit=200`),
      api(`estudantes?limit=500`),
      api(`equipes?limit=200`),
    ]);
    const mentores = (mentoresRes.data || []).filter(m => m.clube_id === clubeId);
    const estudantes = (estudantesRes.data || []).filter(e => e.clube_id === clubeId);
    const equipes = (equipesRes.data || []).filter(eq => eq.clube_id === clubeId);

    renderClube(clube, mentores, estudantes, equipes);
    document.title = `${clube.nome_clube || 'HACK CLUB'} — Ficha pública | HACK HUB®`;
    showState('clube');
  } catch (err) {
    console.error(err);
    showState('nao-encontrado');
  }
}

document.addEventListener('DOMContentLoaded', init);
