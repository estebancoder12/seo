/* ==========================================================================
   SEO – Buenas prácticas · Widgets interactivos
   1) Simulador de resultado de Google (title + meta description)
   2) Verificador de contraste WCAG
   ========================================================================== */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ======================================================================
     1) Simulador SERP
     ====================================================================== */
  const serp = $('#serp-sim');
  if (serp) {
    const titleIn = $('#serp-title');
    const descIn = $('#serp-desc');
    const titleOut = $('#serp-out-title');
    const descOut = $('#serp-out-desc');
    const titleCount = $('#serp-title-count');
    const descCount = $('#serp-desc-count');

    const TITLE_MAX = 60;
    const DESC_MAX = 155;
    const clip = (text, max) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
    const stateFor = (len, min, max) => (len === 0 || len > max ? 'bad' : len < min ? 'warn' : 'ok');

    const render = () => {
      const t = titleIn.value.trim();
      const d = descIn.value.trim();
      titleOut.textContent = clip(t, TITLE_MAX) || 'Tu título aparece acá';
      descOut.textContent = clip(d, DESC_MAX) || 'Tu meta description aparece acá. Si la dejás vacía, Google elige un fragmento del contenido.';
      titleCount.textContent = `${t.length} / ${TITLE_MAX}`;
      descCount.textContent = `${d.length} / ${DESC_MAX}`;
      titleCount.dataset.state = stateFor(t.length, 30, TITLE_MAX);
      descCount.dataset.state = stateFor(d.length, 70, DESC_MAX);
    };
    titleIn.addEventListener('input', render);
    descIn.addEventListener('input', render);
    render();
  }

  /* ======================================================================
     2) Verificador de contraste (WCAG 2.x)
     ====================================================================== */
  const contrast = $('#contrast-tool');
  if (contrast) {
    const fg = $('#c-fg');
    const bg = $('#c-bg');
    const sample = $('#c-sample');
    const ratioEl = $('#c-ratio');
    const badges = {
      aaNormal: $('#c-aa-normal'),
      aaaNormal: $('#c-aaa-normal'),
      aaLarge: $('#c-aa-large'),
      aaaLarge: $('#c-aaa-large'),
    };

    const channel = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    const luminance = (hex) => {
      const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratioOf = (a, b) => {
      const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    };
    const mark = (el, pass, label) => {
      el.dataset.tone = pass ? 'ok' : 'bad';
      el.textContent = `${pass ? '✓' : '✕'} ${label}`;
    };

    const update = () => {
      const r = ratioOf(fg.value, bg.value);
      sample.style.color = fg.value;
      sample.style.backgroundColor = bg.value;
      ratioEl.textContent = `${r.toFixed(2)}:1`;
      mark(badges.aaNormal, r >= 4.5, 'AA · texto normal (4.5)');
      mark(badges.aaaNormal, r >= 7, 'AAA · texto normal (7)');
      mark(badges.aaLarge, r >= 3, 'AA · texto grande (3)');
      mark(badges.aaaLarge, r >= 4.5, 'AAA · texto grande (4.5)');
    };
    fg.addEventListener('input', update);
    bg.addEventListener('input', update);
    $$('[data-fg]', contrast).forEach((btn) => btn.addEventListener('click', () => {
      fg.value = btn.dataset.fg;
      bg.value = btn.dataset.bg;
      update();
    }));
    update();
  }
})();