import type { Config } from 'tailwindcss';

/**
 * THE ROYAL ARCHIVE — design tokens.
 * Candlelight on dark wood: near-black ground, wine and maroon for depth,
 * antique gold used like gilding (thin, sparing, never a fill), parchment for text.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0706',        // near black — the ground of every room
        soot: '#130D0B',
        oxblood: '#1A0A0A',
        wine: '#3A0D12',
        maroon: '#5A1720',
        crimson: '#8B1E2D',    // accent only: seals, active states, warnings
        gold: '#C9A45C',       // gilding — thin lines and small caps
        brass: '#8A6E3A',
        parchment: '#E7D6B4',
        ivory: '#F2E9D8',
        ash: '#9C8C77',        // muted supporting text
      },
      fontFamily: {
        // No webfonts: these are high-quality serifs already present on the
        // platforms this site will be read on, so there is no FOUT and no request.
        display: ['Didot', '"Bodoni MT"', '"Playfair Display"', '"Hoefler Text"', 'Garamond', '"Times New Roman"', 'serif'],
        body: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
        mono: ['ui-monospace', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      letterSpacing: { royal: '0.34em', label: '0.22em' },
      boxShadow: {
        candle: '0 0 60px 10px rgba(201,164,92,0.16)',
        deep: '0 40px 120px rgba(0,0,0,0.75)',
        leather: 'inset 0 2px 6px rgba(0,0,0,0.6), inset 0 -2px 10px rgba(0,0,0,0.75), 0 30px 70px rgba(0,0,0,0.7)',
      },
      transitionTimingFunction: {
        drape: 'cubic-bezier(0.22, 1, 0.36, 1)',
        weight: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
