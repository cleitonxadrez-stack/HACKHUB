/* ==========================================================================
   HACK HUB® — Script comum (header, footer, menu mobile, sessão simulada)
   ========================================================================== */

/**
 * Carrega um trecho de HTML (header/footer) dentro de um elemento alvo.
 */
async function includeHTML(targetSelector, url) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  try {
    const res = await fetch(url);
    const html = await res.text();
    target.innerHTML = html;
  } catch (err) {
    console.error('Erro ao carregar ' + url, err);
  }
}

/** Marca o link de navegação ativo com base no atributo data-page do <body>. */
function setActiveNavLink() {
  const page = document.body.getAttribute('data-page');
  if (!page) return;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.getAttribute('data-nav') === page) {
      link.classList.add('active');
    }
  });
}

/** Configura o menu mobile (abrir/fechar). */
function setupMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const isOpen = menu.style.maxHeight && menu.style.maxHeight !== '0px';
    if (isOpen) {
      menu.style.maxHeight = '0px';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<i class="fa-solid fa-bars text-xl"></i>';
    } else {
      menu.style.maxHeight = menu.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
      btn.innerHTML = '<i class="fa-solid fa-xmark text-xl"></i>';
    }
  });
}

/** Anima números de contador (data-counter) quando entram na tela. */
function animateCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-counter'), 10) || 0;
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current;
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => observer.observe(c));
}

/** Inicializa header/footer compartilhados em todas as páginas institucionais. */
async function initLayout() {
  await Promise.all([
    includeHTML('#header-placeholder', 'includes/header.html'),
    includeHTML('#footer-placeholder', 'includes/footer.html')
  ]);
  setActiveNavLink();
  setupMobileMenu();
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  animateCounters();
}

document.addEventListener('DOMContentLoaded', initLayout);
