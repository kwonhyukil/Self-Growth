/** @type {import('tailwindcss').Config} */
const primary = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1',
  600: '#4F46E5',
  700: '#4338CA',
  800: '#3730A3',
  900: '#312E81',
  950: '#1E1B4B',
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
  50: '#FFF5F2',
  100: '#FFE8E1',
  200: '#FFCAB8',
  300: '#FF9E81',
  400: '#F47255',
  500: '#E8603C',
  600: '#D14E2B',
  700: '#B03E1F',
  800: '#8E3118',
  900: '#742714',
  950: '#3D1208',
}

const neutral = {
  0: '#FFFFFF',
  25: '#FEFDFB',
  50: '#FBF8F3',
  100: '#F5EFE6',
  200: '#EAE0D3',
  300: '#D4C4B0',
  400: '#B8A090',
  500: '#9C8070',
  600: '#7C6254',
  700: '#5C4638',
  800: '#3E2E24',
  900: '#1C1917',
  950: '#0F0A08',
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
          DEFAULT: '#FFFDF9',
          canvas: '#FBF8F3',
          elevated: '#FFFDF9',
          muted: '#F5EFE6',
          subtle: '#FAF6EF',
          emphasis: '#EFE7D9',
          border: '#E7E2D9',
          inverse: neutral[900],
        },
        text: {
          main: '#1C1917',
          sub: '#57534E',
          soft: '#78716C',
          disabled: '#A8A29E',
          inverse: '#FAF9F7',
        },
        border: {
          subtle: '#E7E2D9',
          DEFAULT: '#D4C4B0',
          strong: '#B8A090',
          focus: primary[600],
        },
      },
      fontFamily: {
        sans: [
          'Noto Sans JP',
          'Pretendard Variable',
          'Pretendard',
          'Noto Sans KR',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        display: [
          'Noto Sans JP',
          'Pretendard Variable',
          'Pretendard',
          'Noto Sans KR',
          'sans-serif',
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
          '0 8px 24px rgba(28, 25, 23, 0.06), 0 2px 8px rgba(28, 25, 23, 0.04)',
        'activity-hover':
          '0 14px 34px rgba(28, 25, 23, 0.10), 0 4px 14px rgba(28, 25, 23, 0.06)',
        dashboard:
          '0 10px 30px rgba(28, 25, 23, 0.08), 0 2px 10px rgba(28, 25, 23, 0.04)',
        soft: '0 2px 10px rgba(28, 25, 23, 0.05)',
        focus: '0 0 0 4px rgba(79, 70, 229, 0.18)',
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
