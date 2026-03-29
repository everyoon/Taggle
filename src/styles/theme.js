import { css } from 'styled-components';

// 1. 태그 팔레트
const palette = {
  tag: {
    UIUX: { bg: '#FFEBEC', text: '#FF8C8E' },
    Color: { bg: '#FFF4EA', text: '#FFBD82' },
    Icon: { bg: '#777777', text: '#F5F5F5' },
    Typography: { bg: '#E6F3FF', text: '#6BBAFF' },
    AI: { bg: '#BFBFBF', text: '#626262' },
    Branding: { bg: '#FAEAFC', text: '#E187ED' },
    Motion: { bg: '#EBF9EE', text: '#89DF9F' },
    Figma: { bg: '#EAF1FB', text: '#85B0E9' },
    Photoshop: { bg: '#FFFBFE', text: '#FFBFED' },
    Illustration: { bg: '#F7F6F3', text: '#B3A28A' },
    Work: { bg: '#EAE5C6', text: '#655F3B' },
    Study: { bg: '#666F8E', text: '#A5B1D7' },
    App: { bg: '#CFFFDD', text: '#5EA272' },
    Web: { bg: '#CAF2F2', text: '#2CB7B7' },
    Ref: { bg: '#E4CBEA', text: '#9B62A8' },
    Etc: { bg: '#FFFAE6', text: '#FFE16B' },
  },
};

// 2. Primitives Tokens
export const primitives = {
  colors: {
    red: { 100: '#ffebec', 200: '#ffadaf', 300: '#ff8c8e', 400: '#ff5a5d', 500: '#ff383c' },
    neutral: {
      100: '#fafafa',
      200: '#f5f5f5',
      300: '#efefef',
      400: '#e1e1e1',
      500: '#bfbfbf',
      600: '#a0a0a0',
      700: '#777777',
      800: '#626262',
      900: '#434343',
      1000: '#222222',
    },
    orange: { 100: '#fff4ea', 200: '#ffd0a7', 300: '#ffbd82', 400: '#ffa04d', 500: '#ff8d28' },
    yellow: { 100: '#fffae6', 200: '#ffea96', 300: '#ffe16b', 400: '#ffd52b', 500: '#ffcc00' },
    green: { 100: '#ebf9ee', 200: '#ace8bb', 300: '#89df9f', 400: '#57d175', 500: '#34c759' },
    blue: { 100: '#e6f3ff', 200: '#96ceff', 300: '#6bbaff', 400: '#2b9cff', 500: '#0088ff' },
    purple: { 100: '#faeafc', 200: '#eaaaf2', 300: '#e187ed', 400: '#d453e5', 500: '#cb30e0' },
  },
};

// 3. Typography Tokens
const typography = {
  Headline: {
    'KR-H1': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 48px;
      font-weight: 700;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
    'KR-H2': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 40px;
      font-weight: 700;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
    'KR-H3': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 33px;
      font-weight: 700;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
  },
  Title: {
    'KR-Large': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 28px;
      font-weight: 500;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
    'KR-Midium': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 23px;
      font-weight: 500;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
    'KR-Small': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 20px;
      font-weight: 500;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
    'EN-Small': css`
      font-family: 'Lugati v1', sans-serif;
      font-size: 20px;
      font-weight: 400;
      letter-spacing: 1px;
      line-height: 1.28;
    `,
  },
  Body: {
    'KR-Large': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 18px;
      font-weight: 400;
      letter-spacing: -0.025em;
      line-height: 1.58;
    `,
    'KR-Midium': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 16px;
      font-weight: 400;
      letter-spacing: -0.025em;
      line-height: 1.58;
    `,
    'KR-Small': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: -0.025em;
      line-height: 1.58;
    `,
  },
  Label: {
    'KR-Large': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
    'KR-Midium': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
    'KR-Small': css`
      font-family: 'Pretendard', sans-serif;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
    'EN-Large': css`
      font-family: 'Lugati v1', sans-serif;
      font-size: 16px;
      font-weight: 400;
      letter-spacing: 1px;
      line-height: 1.28;
    `,
    'EN-Midium': css`
      font-family: 'Lugati v1', sans-serif;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 1px;
      line-height: 1.28;
    `,
    'EN-Small': css`
      font-family: 'Lugati v1', sans-serif;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: 1px;
      line-height: 1.28;
    `,
  },
  Caption: {
    KR: css`
      font-family: 'Pretendard', sans-serif;
      font-size: 11px;
      font-weight: 400;
      letter-spacing: -0.025em;
      line-height: 1.25;
    `,
  },
};

// 4. Effects (Shadows)
const shadows = {
  1: '0px 1px 1px 0px #0000001a, 0px 2px 2px 0px #00000017, 0px 5px 3px 0px #0000000d, 0px 9px 4px 0px #00000003, 0px 14px 4px 0px #00000000',
  2: '0px 1px 2px 0px #0000001a, 0px 4px 4px 0px #00000017, 0px 9px 6px 0px #0000000d, 0px 17px 7px 0px #00000003, 0px 26px 7px 0px #00000000',
  3: '0px 3px 7px 0px #0000001a, 0px 13px 13px 0px #00000017, 0px 29px 17px 0px #0000000d, 0px 52px 21px 0px #00000003, 0px 81px 23px 0px #00000000',
};

// 5. 공통 토큰
export const tokens = {
  fontFamily: "'Pretendard', -apple-system, sans-serif",
  typography,
  radius: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    13: '52px',
    14: '56px',
    15: '60px',
    16: '64px',
    full: '999px',
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    11: '44px',
    12: '48px',
    13: '52px',
    14: '56px',
    15: '60px',
    16: '64px',
  },
  transition: {
    fast: '0.12s ease',
    normal: '0.2s ease',
  },
  shadows,
};

// 6. Light Theme
export const lightTheme = {
  colors: {
    surface: {
      primary: primitives.colors.neutral[100],
      contrast: primitives.colors.neutral[400],
      secondary: primitives.colors.neutral[300],
      invert: primitives.colors.neutral[1000],
      brand: '#90a1b8',
      modal_background: '#434343b2',
      positive: primitives.colors.green[500],
      negative: primitives.colors.red[500],
      warning: primitives.colors.orange[500],
      caution: primitives.colors.yellow[500],
      information: primitives.colors.blue[500],
    },
    text: {
      primary: primitives.colors.neutral[1000],
      contrast: primitives.colors.neutral[600],
      secondary: primitives.colors.neutral[300],
      invert: primitives.colors.neutral[100],
      brand: '#90a1b8',
      positive: primitives.colors.green[500],
      negative: primitives.colors.red[500],
      warning: primitives.colors.orange[500],
      caution: primitives.colors.yellow[500],
      information: primitives.colors.blue[500],
    },
    icon: {
      primary: primitives.colors.neutral[1000],
      contrast: primitives.colors.neutral[600],
      secondary: primitives.colors.neutral[300],
      invert: primitives.colors.neutral[100],
      brand: '#90a1b8',
      positive: primitives.colors.green[500],
      negative: primitives.colors.red[500],
      warning: primitives.colors.orange[500],
      caution: primitives.colors.yellow[500],
      information: primitives.colors.blue[500],
    },
    border: {
      primary: primitives.colors.neutral[1000],
      contrast: primitives.colors.neutral[600],
      secondary: primitives.colors.neutral[300],
      invert: primitives.colors.neutral[100],
      brand: '#90a1b8',
      positive: primitives.colors.green[500],
      negative: primitives.colors.red[500],
      warning: primitives.colors.orange[500],
      caution: primitives.colors.yellow[500],
      information: primitives.colors.blue[500],
    },
    button: {
      default: primitives.colors.neutral[100],
      hover: primitives.colors.neutral[800],
      active: primitives.colors.neutral[800],
      focus: primitives.colors.neutral[800],
      disabled: primitives.colors.neutral[500],
      invert: primitives.colors.neutral[1000],
    },
    tag: palette.tag,
  },
  ...tokens,
};

// 7. Dark Theme
export const darkTheme = {
  colors: {
    surface: {
      primary: primitives.colors.neutral[1000],
      contrast: primitives.colors.neutral[600],
      secondary: primitives.colors.neutral[800],
      invert: primitives.colors.neutral[100],
      brand: '#90a1b8',
      modal_background: '#111111b2',
      positive: primitives.colors.green[400],
      negative: primitives.colors.red[400],
      warning: primitives.colors.orange[400],
      caution: primitives.colors.yellow[400],
      information: primitives.colors.blue[400],
    },
    text: {
      primary: primitives.colors.neutral[100],
      contrast: primitives.colors.neutral[400],
      secondary: primitives.colors.neutral[600],
      invert: primitives.colors.neutral[1000],
      brand: '#90a1b8',
      positive: primitives.colors.green[400],
      negative: primitives.colors.red[400],
      warning: primitives.colors.orange[400],
      caution: primitives.colors.yellow[400],
      information: primitives.colors.blue[400],
    },
    icon: {
      primary: primitives.colors.neutral[100],
      contrast: primitives.colors.neutral[400],
      secondary: primitives.colors.neutral[600],
      invert: primitives.colors.neutral[1000],
      brand: '#90a1b8',
      positive: primitives.colors.green[400],
      negative: primitives.colors.red[400],
      warning: primitives.colors.orange[400],
      caution: primitives.colors.yellow[400],
      information: primitives.colors.blue[400],
    },
    border: {
      primary: primitives.colors.neutral[800],
      contrast: primitives.colors.neutral[600],
      secondary: primitives.colors.neutral[700],
      invert: primitives.colors.neutral[200],
      brand: '#90a1b8',
      positive: primitives.colors.green[400],
      negative: primitives.colors.red[400],
      warning: primitives.colors.orange[400],
      caution: primitives.colors.yellow[400],
      information: primitives.colors.blue[400],
    },
    button: {
      default: primitives.colors.neutral[1000],
      hover: primitives.colors.neutral[200],
      active: primitives.colors.neutral[200],
      focus: primitives.colors.neutral[200],
      disabled: primitives.colors.neutral[700],
      invert: primitives.colors.neutral[100],
    },
    tag: palette.tag,
  },
  ...tokens,
};
