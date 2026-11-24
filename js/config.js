/* ==========================================================================
   Configuración de Tailwind (CDN)
   Los colores leen variables CSS de /css/styles.css, así el tema claro/oscuro
   funciona con las mismas clases (bg-surface, text-ink, border-ink/10...).
   ========================================================================== */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"',
          'Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif',
        ],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface-2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        ink2: 'rgb(var(--ink-2) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        accent2: 'rgb(var(--accent-2) / <alpha-value>)',
        ok: 'rgb(var(--ok) / <alpha-value>)',
        bad: 'rgb(var(--bad) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(.16, 1, .3, 1)',
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
};