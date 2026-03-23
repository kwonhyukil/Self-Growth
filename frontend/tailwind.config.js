/** @type {import('tailwindcss').Config} */
const primary = {
  50: '#edf5ef',
  100: '#dcebdd',
  200: '#bdd5bf',
  300: '#9abd9e',
  400: '#78a57d',
  500: '#5f8e64',
  600: '#4f7654',
  700: '#405f44',
  800: '#364d39',
  900: '#2d4030',
  950: '#162118',
}

const secondary = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
  950: '#451A03',
}

const accent = {
  50: '#fff5ed',
  100: '#ffe8d6',
  200: '#ffd0aa',
  300: '#ffb073',
  400: '#f28c49',
  500: '#d97332',
  600: '#b85d24',
  700: '#94461d',
  800: '#77381c',
  900: '#612f1a',
  950: '#34170d',
}

const neutral = {
  0: '#FFFFFF',
  25: '#fffdf9',
  50: '#f8f3ea',
  100: '#f2ebe0',
  200: '#e7dccd',
  300: '#d7c5ad',
  400: '#bda588',
  500: '#9c8166',
  600: '#7f6652',
  700: '#624d3f',
  800: '#46372e',
  900: '#27211d',
  950: '#14110f',
}

const success = {
  50: '#effaf4',
  100: '#d9f2e3',
  200: '#b8e5ca',
  300: '#89d1a5',
  400: '#57b57e',
  500: '#369865',
  600: '#287a51',
  700: '#236142',
  800: '#214d37',
  900: '#1b3f2d',
}

const info = {
  50: '#eef8ff',
  100: '#d8ecff',
  200: '#baddff',
  300: '#8ec8ff',
  400: '#58a7f6',
  500: '#3287de',
  600: '#2369bc',
  700: '#215596',
  800: '#22497a',
  900: '#213e66',
}

const warning = {
  50: '#fff9eb',
  100: '#fff0c6',
  200: '#fedf88',
  300: '#fdc84a',
  400: '#fbaf22',
  500: '#f08d0e',
  600: '#d46b08',
  700: '#b04c0a',
  800: '#8f3c10',
  900: '#763311',
}

const error = {
  50: '#fff2f2',
  100: '#ffe0e0',
  200: '#ffc4c4',
  300: '#ff9b9b',
  400: '#ff6467',
  500: '#f03d44',
  600: '#d11f33',
  700: '#af1830',
  800: '#91182f',
  900: '#7a192f',
}

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary,
        secondary,
        accent,
        brand: primary,
        jade: secondary,
        success,
        info,
        warning,
        error,
        neutral,
        surface: {
          DEFAULT: '#FFFCF7',
          canvas: '#F8F3EA',
          elevated: '#FFFDF8',
          muted: '#F2EBE0',
          subtle: '#FAF4EB',
          emphasis: '#EDE3D4',
          border: '#E5DBCC',
          inverse: neutral[900],
        },
        text: {
          main: '#27211D',
          sub: '#5D534B',
          soft: '#86796E',
          disabled: '#AEA59D',
          inverse: '#FAF9F7',
        },
        border: {
          subtle: '#E5DBCC',
          DEFAULT: '#CCBCA8',
          strong: '#A99179',
          focus: primary[500],
        },
      },
      fontFamily: {
        sans: [
          'Noto Sans JP',
          'Noto Sans KR',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        display: [
          'Cormorant Garamond',
          'Times New Roman',
          'serif',
        ],
        jp: ['Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif'],
      },
      fontSize: {
        display: ['2.5rem', { lineHeight: '1.16', letterSpacing: '-0.034em', fontWeight: '700' }],
        h1: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '700' }],
        h2: ['1.5rem', { lineHeight: '1.28', letterSpacing: '-0.026em', fontWeight: '700' }],
        h3: ['1.25rem', { lineHeight: '1.34', letterSpacing: '-0.022em', fontWeight: '600' }],
        bodyLg: ['1.0625rem', { lineHeight: '1.76', letterSpacing: '-0.014em', fontWeight: '400' }],
        body: ['1rem', { lineHeight: '1.72', letterSpacing: '-0.012em', fontWeight: '400' }],
        bodySm: ['0.9375rem', { lineHeight: '1.68', letterSpacing: '-0.01em', fontWeight: '400' }],
        caption: ['0.8125rem', { lineHeight: '1.54', letterSpacing: '0.01em', fontWeight: '500' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        card: '1.25rem',
        panel: '1rem',
        control: '0.875rem',
        pill: '9999px',
      },
      boxShadow: {
        activity:
          '0 16px 40px rgba(39, 33, 29, 0.08), 0 4px 12px rgba(39, 33, 29, 0.05)',
        'activity-hover':
          '0 22px 50px rgba(39, 33, 29, 0.12), 0 10px 22px rgba(39, 33, 29, 0.06)',
        dashboard:
          '0 18px 44px rgba(39, 33, 29, 0.12), 0 6px 18px rgba(39, 33, 29, 0.05)',
        soft: '0 6px 16px rgba(39, 33, 29, 0.06)',
        focus: '0 0 0 4px rgba(95, 142, 100, 0.18)',
      },
      backgroundImage: {
        'mesh-soft':
          'radial-gradient(circle at top left, rgba(79,70,229,0.08), transparent 35%), radial-gradient(circle at 85% 15%, rgba(245,158,11,0.08), transparent 28%), linear-gradient(180deg, rgba(255,253,249,0.8), rgba(255,253,249,0.96))',
      },
      transitionDuration: {
        180: '180ms',
        240: '240ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 220ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-up': 'slide-up 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
