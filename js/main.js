/* ==========================================================================
   SEO – Buenas prácticas · Interacciones de interfaz
   Tema, progreso, índice, revelado, acordeones, tabs, copiar código y contadores.
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => matchMedia('(min-width: 1024px)').matches;

  /* ---------- Tema claro / oscuro ---------- */
  const themeBtn = $('#theme-toggle');
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    themeBtn?.setAttribute('aria-pressed', String(theme === 'dark'));
    try { localStorage.setItem('seo-guide-theme', theme); } catch (_) { /* modo privado */ }
  };
  themeBtn?.setAttribute('aria-pressed', String(root.dataset.theme === 'dark'));
  themeBtn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(() => setTheme(next));
    else setTheme(next);
  });

  /* ---------- Progreso de lectura, header y parallax ---------- */
  const header = $('.site-header');
  const progress = $('.progress');
  const aurora = $('.aurora');
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress?.style.setProperty('--p', max > 0 ? Math.min(y / max, 1).toFixed(4) : 0);
    header?.setAttribute('data-scrolled', String(y > 8));
    if (aurora && !reduceMotion && y < innerHeight * 1.2) aurora.style.transform = `translate3d(0, ${(y * 0.18).toFixed(1)}px, 0)`;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- Revelado al hacer scroll (con escalonado) ---------- */
  $$('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.classList.add('reveal');
      child.style.setProperty('--i', Math.min(i, 8));
    });
  });
  $$('.sec-head').forEach((el) => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      target.classList.add('is-visible');
      revealObserver.unobserve(target);
      // Al terminar la entrada se limpian las clases para que el hover use sus propias transiciones.
      setTimeout(() => target.classList.remove('reveal', 'is-visible'), 1500 + Number(target.style.getPropertyValue('--i') || 0) * 70);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ---------- Índice lateral: sección activa ---------- */
  const tocLinks = $$('.toc-link');
  const linkById = new Map(tocLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  const setActive = (id) => {
    tocLinks.forEach((a) => a.removeAttribute('aria-current'));
    const link = linkById.get(id);
    if (!link) return;
    link.setAttribute('aria-current', 'true');
    const toc = $('#toc');
    if (isDesktop() && toc) {
      const top = link.offsetTop - toc.clientHeight / 2 + link.clientHeight / 2;
      toc.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
  }, { rootMargin: '-30% 0px -62% 0px' });
  $$('main section[id]').forEach((s) => sectionObserver.observe(s));

  /* ---------- Menú móvil (drawer) ---------- */
  const toc = $('#toc');
  const overlay = $('.drawer-overlay');
  const menuBtn = $('#menu-toggle');
  const setDrawer = (open) => {
    if (!toc) return;
    toc.dataset.open = String(open);
    overlay.dataset.open = String(open);
    menuBtn?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open && !isDesktop() ? 'hidden' : '';
  };
  menuBtn?.addEventListener('click', () => setDrawer(toc.dataset.open !== 'true'));
  overlay?.addEventListener('click', () => setDrawer(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
  tocLinks.forEach((a) => a.addEventListener('click', () => { if (!isDesktop()) setDrawer(false); }));
  matchMedia('(min-width: 1024px)').addEventListener('change', () => setDrawer(false));

  /* ---------- Acordeones ---------- */
  $$('.acc').forEach((acc, i) => {
    const btn = $('.acc-trigger', acc);
    const panel = $('.acc-panel', acc);
    btn.id ||= `acc-btn-${i}`;
    panel.id ||= `acc-panel-${i}`;
    btn.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', btn.id);
    const set = (open) => {
      acc.dataset.open = String(open);
      btn.setAttribute('aria-expanded', String(open));
      panel.toggleAttribute('inert', !open);
    };
    set(acc.dataset.open === 'true');
    btn.addEventListener('click', () => set(acc.dataset.open !== 'true'));
  });

  /* ---------- Tabs segmentados ---------- */
  $$('[data-tabs]').forEach((wrap) => {
    const list = $('[role="tablist"]', wrap);
    const tabs = $$('[role="tab"]', list);
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const ind = document.createElement('span');
    ind.className = 'seg-ind';
    ind.setAttribute('aria-hidden', 'true');
    list.prepend(ind);

    const moveIndicator = (tab) => {
      ind.style.setProperty('--x', `${tab.offsetLeft}px`);
      ind.style.setProperty('--w', `${tab.offsetWidth}px`);
    };
    const select = (tab, focus = false) => {
      tabs.forEach((t, i) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      moveIndicator(tab);
      if (focus) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (dir) { e.preventDefault(); select(tabs[(i + dir + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(tabs.at(-1), true); }
      });
    });
    const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
    ind.style.transition = 'none';
    select(initial);
    requestAnimationFrame(() => { ind.style.transition = ''; });
    addEventListener('resize', () => moveIndicator(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
    document.fonts?.ready.then(() => moveIndicator(tabs.find((t) => t.getAttribute('aria-selected') === 'true')));
  });

  /* ---------- Copiar código ---------- */
  $$('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.closest('.codeblock')?.querySelector('code');
      if (!code) return;
      const text = code.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch (_) {
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
      btn.dataset.done = 'true';
      btn.textContent = 'Copiado ✓';
      setTimeout(() => { btn.dataset.done = 'false'; btn.textContent = 'Copiar'; }, 1800);
    });
  });

  /* ---------- Contadores animados ---------- */
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countObserver.unobserve(entry.target);
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const start = performance.now();
      const dur = 1400;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObserver.observe(el));

  /* ---------- Año del footer ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();